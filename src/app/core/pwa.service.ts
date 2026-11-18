import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const INSTALL_DISMISSED_KEY = '180services-install-dismissed';
const PULL_THRESHOLD = 72;

/**
 * Gère les fonctionnalités PWA (bannière d'installation Android/Chrome & iOS Safari,
 * notification de mise à jour `SwUpdate`) ainsi que le geste Pull-to-Refresh mobile.
 */
@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  private deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

  readonly canInstallApp = signal(false);
  readonly showInstallHelp = signal(false);
  readonly isIosInstall = signal(false);
  readonly showIosSteps = signal(false);
  readonly pwaUpdateReady = signal(false);

  readonly pullDistance = signal(0);
  readonly isPulling = signal(false);
  readonly isRefreshing = signal(false);

  readonly pullReady = computed(() => this.pullDistance() >= PULL_THRESHOLD);
  readonly pullRotation = computed(() =>
    Math.min(180, Math.round((this.pullDistance() / PULL_THRESHOLD) * 180)),
  );

  /**
   * Initialise les écouteurs PWA et Pull-to-Refresh côté navigateur et enregistre
   * leur nettoyage automatique sur le `DestroyRef` du composant hôte.
   */
  initBrowser(destroyRef: DestroyRef, isOverlayOpen: () => boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.swUpdate?.isEnabled) {
      const updateSub = this.swUpdate.versionUpdates.subscribe((evt: VersionEvent) => {
        if (evt.type === 'VERSION_READY') {
          this.pwaUpdateReady.set(true);
        }
      });
      destroyRef.onDestroy(() => updateSub.unsubscribe());
    }

    const supportsMatchMedia = typeof window.matchMedia === 'function';
    const isStandalone =
      (supportsMatchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    let installAlreadyDismissed = false;
    try {
      installAlreadyDismissed = sessionStorage.getItem(INSTALL_DISMISSED_KEY) === '1';
    } catch {
      // Ignore storage restrictions
    }

    if (!isStandalone) {
      const isIos =
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      this.isIosInstall.set(isIos);

      if (isIos && !installAlreadyDismissed) {
        this.showInstallHelp.set(true);
      }

      const onBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        this.deferredInstallPrompt = event as BeforeInstallPromptEvent;
        this.canInstallApp.set(true);
        if (!installAlreadyDismissed) {
          this.showInstallHelp.set(true);
        }
      };

      const onAppInstalled = () => {
        this.canInstallApp.set(false);
        this.showInstallHelp.set(false);
        this.showIosSteps.set(false);
        this.deferredInstallPrompt = null;
      };

      window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.addEventListener('appinstalled', onAppInstalled);

      destroyRef.onDestroy(() => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.removeEventListener('appinstalled', onAppInstalled);
      });
    }

    // Pull-to-Refresh + protection zoom limitée au mode PWA autonome (hors galerie)
    let touchStartY = 0;
    let touchStartX = 0;
    let trackingPull = false;
    let lastTouchEnd = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const shouldBlockStandaloneZoom = (target: EventTarget | null): boolean => {
      if (!isStandalone) {
        return false;
      }
      const el = target instanceof HTMLElement ? target : null;
      return !el?.closest('.lightbox-backdrop');
    };

    const preventGestureZoom = (event: Event) => {
      if (shouldBlockStandaloneZoom(event.target)) {
        event.preventDefault();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        trackingPull = false;
        this.isPulling.set(false);
        this.pullDistance.set(0);
        return;
      }

      if (
        event.touches.length === 1 &&
        window.scrollY <= 0 &&
        !isOverlayOpen() &&
        !this.isRefreshing()
      ) {
        touchStartY = event.touches[0].clientY;
        touchStartX = event.touches[0].clientX;
        trackingPull = true;
      } else {
        trackingPull = false;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        if (shouldBlockStandaloneZoom(event.target)) {
          event.preventDefault();
        }
        trackingPull = false;
        this.isPulling.set(false);
        this.pullDistance.set(0);
        return;
      }

      if (!trackingPull || event.touches.length !== 1) {
        return;
      }

      const deltaY = event.touches[0].clientY - touchStartY;
      const deltaX = event.touches[0].clientX - touchStartX;

      if (deltaY <= 0 || window.scrollY > 0) {
        trackingPull = false;
        if (this.isPulling()) {
          this.isPulling.set(false);
          this.pullDistance.set(0);
        }
        return;
      }

      if (deltaY > 8 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3) {
        event.preventDefault();
        this.isPulling.set(true);
        this.pullDistance.set(Math.min(108, Math.round(deltaY * 0.48)));
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (isStandalone) {
        const now = Date.now();
        const target = event.target as HTMLElement | null;
        const isInteractiveOrGallery =
          target !== null &&
          Boolean(target.closest('input, textarea, select, button, a, label, .lightbox-backdrop'));

        if (!isInteractiveOrGallery && now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }

      if (!trackingPull) {
        return;
      }
      trackingPull = false;

      if (this.isPulling() && this.pullDistance() >= PULL_THRESHOLD) {
        this.isPulling.set(false);
        this.isRefreshing.set(true);
        this.pullDistance.set(64);
        refreshTimer = setTimeout(() => {
          window.location.reload();
        }, 450);
      } else {
        this.isPulling.set(false);
        this.pullDistance.set(0);
      }
    };

    const onTouchCancel = () => {
      trackingPull = false;
      if (!this.isRefreshing()) {
        this.isPulling.set(false);
        this.pullDistance.set(0);
      }
    };

    if (isStandalone) {
      document.addEventListener('gesturestart', preventGestureZoom, { passive: false });
      document.addEventListener('gesturechange', preventGestureZoom, { passive: false });
      document.addEventListener('gestureend', preventGestureZoom, { passive: false });
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: !isStandalone });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });

    destroyRef.onDestroy(() => {
      if (isStandalone) {
        document.removeEventListener('gesturestart', preventGestureZoom);
        document.removeEventListener('gesturechange', preventGestureZoom);
        document.removeEventListener('gestureend', preventGestureZoom);
      }
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
      if (refreshTimer !== null) {
        clearTimeout(refreshTimer);
      }
    });
  }

  toggleIosSteps(): void {
    this.showIosSteps.update((open) => !open);
  }

  async installApp(): Promise<void> {
    const prompt = this.deferredInstallPrompt;
    if (!prompt) {
      this.showIosSteps.set(true);
      return;
    }

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.showInstallHelp.set(false);
        this.showIosSteps.set(false);
      }
    } catch (error) {
      console.error('La demande d’installation a échoué :', error);
    } finally {
      this.deferredInstallPrompt = null;
      this.canInstallApp.set(false);
    }
  }

  dismissInstallHelp(): void {
    this.showInstallHelp.set(false);
    this.showIosSteps.set(false);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(INSTALL_DISMISSED_KEY, '1');
      } catch {
        // Ignore storage restrictions
      }
    }
  }

  async applyPwaUpdate(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      await this.swUpdate?.activateUpdate();
    } catch {
      // Reload even if activation was already applied
    }
    window.location.reload();
  }

  dismissPwaUpdate(): void {
    this.pwaUpdateReady.set(false);
  }
}

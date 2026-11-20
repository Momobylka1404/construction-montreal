import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PrivacyModalComponent } from './components/privacy-modal/privacy-modal';
import { PwaOverlaysComponent } from './components/pwa-overlays/pwa-overlays';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { SiteHeaderComponent } from './components/site-header/site-header';
import { getPageHref, getPageIdFromPath, getPagePath } from './config/pages.config';
import { FocusController, isPlainLeftClick } from './core/focus.util';
import { I18nService } from './core/i18n.service';
import { PwaService } from './core/pwa.service';
import { QuotePrefillService } from './core/quote-prefill.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SiteHeaderComponent,
    SiteFooterComponent,
    PrivacyModalComponent,
    PwaOverlaysComponent,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doc = inject(DOCUMENT);
  private readonly pwa = inject(PwaService);
  private readonly router = inject(Router);
  private readonly focus = new FocusController(this.doc, this.isBrowser);

  readonly i18n = inject(I18nService);
  private readonly quotePrefill = inject(QuotePrefillService);

  readonly mobileMenuOpen = signal(false);
  readonly privacyModalOpen = signal(false);
  readonly isScrolled = signal(false);
  readonly showBackToTop = signal(false);

  readonly activeSection = computed(() => this.i18n.activePageId());

  constructor() {
    afterNextRender(() => {
      this.i18n.restoreSavedLanguage();
      this.pwa.initBrowser(this.destroyRef, () => this.isAnyOverlayOpen());
      this.initScrollAndReveal();
      this.handleLegacyHash();
      this.listenForPrivacyEvent();
    });
  }

  pageHref(pageId: string): string {
    return this.i18n.pageHref(pageId);
  }

  onNavigateFromHeader(payload: { event: MouseEvent; sectionId: string }): void {
    this.navigateToPage(payload.event, payload.sectionId);
  }

  onNavigateFromFooter(payload: { event: MouseEvent; sectionId: string }): void {
    this.navigateToPage(payload.event, payload.sectionId);
  }

  onNavigatePage(event: MouseEvent, pageId: string): void {
    this.navigateToPage(event, pageId);
  }

  private navigateToPage(event: MouseEvent, pageId: string): void {
    if (!isPlainLeftClick(event) || !this.isBrowser) return;
    const resolved = this.resolveSectionId(pageId);
    const target = getPagePath(resolved, this.i18n.lang());
    const url = target === '' ? '/' : `/${target}`;
    event.preventDefault();
    this.closeMobileMenu(false);
    void this.router.navigateByUrl(url);
  }

  /** Compatibilité anciennes ancres (#services, #apropos) */
  resolveSectionId(sectionId: string): string {
    if (sectionId === 'services') return 'expertises';
    if (sectionId === 'apropos') return 'pourquoi-nous';
    return sectionId;
  }

  onRequestQuote(serviceId: string): void {
    this.closeMobileMenu(false);
    this.quotePrefill.requestQuote(serviceId);
  }

  scrollToTop(): void {
    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMobileMenu(): void {
    const next = !this.mobileMenuOpen();
    if (next) this.focus.captureOrigin();
    this.mobileMenuOpen.set(next);
    this.syncScrollLock();
    if (next) this.focus.focusFirstInside('.mobile-drawer');
    else this.focus.restore();
  }

  closeMobileMenu(restoreFocus = true): void {
    if (!this.mobileMenuOpen()) return;
    this.mobileMenuOpen.set(false);
    this.syncScrollLock();
    if (restoreFocus && !this.privacyModalOpen()) this.focus.restore();
  }

  openPrivacyModal(): void {
    this.focus.captureOrigin();
    this.closeMobileMenu(false);
    this.privacyModalOpen.set(true);
    this.syncScrollLock();
  }

  closePrivacyModal(restoreFocus = true): void {
    if (!this.privacyModalOpen()) return;
    this.privacyModalOpen.set(false);
    this.syncScrollLock();
    if (restoreFocus) this.focus.restore();
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      if (this.privacyModalOpen()) this.focus.trapTab(event, '.privacy-dialog');
      else if (this.mobileMenuOpen()) this.focus.trapTab(event, '.mobile-drawer');
      return;
    }
    if (event.key === 'Escape') {
      if (this.privacyModalOpen()) this.closePrivacyModal();
      else if (this.mobileMenuOpen()) this.closeMobileMenu();
      return;
    }
  }

  private isAnyOverlayOpen(): boolean {
    return this.mobileMenuOpen() || this.privacyModalOpen();
  }

  private syncScrollLock(): void {
    this.focus.setBodyScrollLocked(this.isAnyOverlayOpen());
  }

  private initScrollAndReveal(): void {
    if (!this.isBrowser) return;

    const onScroll = () => {
      const y = window.scrollY;
      this.isScrolled.set(y > 28);
      this.showBackToTop.set(y > 520);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Animations d'apparition au défilement
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let revealObserver: IntersectionObserver | null = null;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      this.doc.documentElement.classList.add('reveal-ready');
      const revealEls = Array.from(this.doc.querySelectorAll<HTMLElement>('[data-reveal]'));

      revealObserver = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -20px 0px', threshold: 0.01 },
      );
      for (const el of revealEls) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
        else revealObserver.observe(el);
      }

      // Observer les nouveaux éléments ajoutés par navigation de pages
      const routerSub = this.router.events.subscribe((ev) => {
        if (ev instanceof NavigationEnd) {
          setTimeout(() => {
            const newEls = Array.from(
              this.doc.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)'),
            );
            for (const el of newEls) {
              if (el.getBoundingClientRect().top < window.innerHeight)
                el.classList.add('is-visible');
              else revealObserver?.observe(el);
            }
          }, 50);
        }
      });
      this.destroyRef.onDestroy(() => routerSub.unsubscribe());
    }

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      revealObserver?.disconnect();
      this.focus.setBodyScrollLocked(false);
    });
  }

  private handleLegacyHash(): void {
    if (!this.isBrowser) return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const resolved = this.resolveSectionId(decodeURIComponent(hash));
    const pageId = getPageIdFromPath(resolved) ?? this.resolveSectionId(resolved);
    // Si le hash correspond à une page connue, rediriger vers la page dédiée
    if (PAGE_IDS.includes(pageId) || getPageIdFromPath(hash)) {
      const target = getPagePath(pageId, this.i18n.lang());
      const url = target === '' ? '/' : `/${target}`;
      // Nettoyer le hash sans recharger
      try {
        history.replaceState(history.state, '', window.location.pathname);
      } catch {}
      void this.router.navigateByUrl(url);
    }
  }

  private listenForPrivacyEvent(): void {
    if (!this.isBrowser) return;
    const handler = () => this.openPrivacyModal();
    document.addEventListener('openPrivacy', handler);
    this.destroyRef.onDestroy(() => document.removeEventListener('openPrivacy', handler));
  }
}

const PAGE_IDS = [
  'accueil',
  'expertises',
  'realisations',
  'pourquoi-nous',
  'avis',
  'faq',
  'contact',
];

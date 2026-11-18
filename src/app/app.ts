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
import { RouterOutlet } from '@angular/router';
import { AboutProcessSectionComponent } from './components/about-process-section/about-process-section';
import { ContactSectionComponent } from './components/contact-section/contact-section';
import { FaqSectionComponent } from './components/faq-section/faq-section';
import { HeroSectionComponent } from './components/hero-section/hero-section';
import { LightboxModalComponent } from './components/lightbox-modal/lightbox-modal';
import { PrivacyModalComponent } from './components/privacy-modal/privacy-modal';
import { PwaOverlaysComponent } from './components/pwa-overlays/pwa-overlays';
import { RealisationsSectionComponent } from './components/realisations-section/realisations-section';
import { ReviewsSectionComponent } from './components/reviews-section/reviews-section';
import { ServicesSectionComponent } from './components/services-section/services-section';
import { SiteFooterComponent } from './components/site-footer/site-footer';
import { SiteHeaderComponent } from './components/site-header/site-header';
import { FocusController, isPlainLeftClick } from './core/focus.util';
import { I18nService } from './core/i18n.service';
import { PwaService } from './core/pwa.service';
import { ServiceCategory } from './i18n';
import { ServiceSelectionEvent } from './models/quote.models';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SiteHeaderComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
    AboutProcessSectionComponent,
    RealisationsSectionComponent,
    ReviewsSectionComponent,
    FaqSectionComponent,
    ContactSectionComponent,
    SiteFooterComponent,
    LightboxModalComponent,
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
  private readonly focus = new FocusController(this.doc, this.isBrowser);

  readonly i18n = inject(I18nService);

  // --- État d'interface global (navigation, modales & galerie) ---
  readonly mobileMenuOpen = signal(false);
  readonly privacyModalOpen = signal(false);
  readonly isScrolled = signal(false);
  readonly showBackToTop = signal(false);
  readonly activeSection = signal('accueil');

  readonly realisationFilter = signal<ServiceCategory>('all');
  readonly activeRealisationId = signal<string | null>(null);
  readonly selectedService = signal<ServiceSelectionEvent | null>(null);

  /** Liste parcourue dans la lightbox : respecte le filtre actif (Bâtiment / Extérieur / Tous). */
  readonly lightboxRealisations = computed(() => {
    const all = this.i18n.t().realisations;
    const filter = this.realisationFilter();
    const filtered = filter === 'all' ? all : all.filter((item) => item.category === filter);
    const id = this.activeRealisationId();
    return id && filtered.some((item) => item.id === id) ? filtered : all;
  });

  readonly activeRealisation = computed(() => {
    const id = this.activeRealisationId();
    return id ? (this.i18n.t().realisations.find((item) => item.id === id) ?? null) : null;
  });

  readonly activeRealisationIndex = computed(() => {
    const id = this.activeRealisationId();
    return id ? this.lightboxRealisations().findIndex((item) => item.id === id) : -1;
  });

  constructor() {
    afterNextRender(() => {
      this.i18n.restoreSavedLanguage();
      this.pwa.initBrowser(this.destroyRef, () => this.isAnyOverlayOpen());
      this.initScrollAndReveal();
    });
  }

  // --- Navigation fluide par ancres (compatible `<base href>` sur `/` et `/en/`) ---
  onNavigateSection(payload: { event: MouseEvent; sectionId: string }): void {
    this.scrollToSection(payload.event, payload.sectionId);
  }

  scrollToSection(event: MouseEvent, sectionId: string): void {
    if (!isPlainLeftClick(event) || !this.isBrowser) {
      return;
    }
    const target = this.doc.getElementById(sectionId);
    if (!target) {
      return;
    }
    event.preventDefault();
    this.closeMobileMenu(false);
    target.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

    if (sectionId === 'contenu') {
      target.focus({ preventScroll: true });
    }

    try {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}#${sectionId}`,
      );
    } catch {
      // Ignore history API restrictions
    }
  }

  scrollToTop(): void {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- Tiroir mobile ---
  toggleMobileMenu(): void {
    const next = !this.mobileMenuOpen();
    if (next) {
      this.focus.captureOrigin();
    }
    this.mobileMenuOpen.set(next);
    this.syncScrollLock();
    if (next) {
      this.focus.focusFirstInside('.mobile-drawer');
    } else {
      this.focus.restore();
    }
  }

  closeMobileMenu(restoreFocus = true): void {
    if (!this.mobileMenuOpen()) {
      return;
    }
    this.mobileMenuOpen.set(false);
    this.syncScrollLock();
    if (restoreFocus && !this.privacyModalOpen() && this.activeRealisationId() === null) {
      this.focus.restore();
    }
  }

  // --- Modale Politique de confidentialité (Loi 25, Québec) ---
  openPrivacyModal(): void {
    this.focus.captureOrigin();
    this.closeMobileMenu(false);
    this.privacyModalOpen.set(true);
    this.syncScrollLock();
  }

  closePrivacyModal(restoreFocus = true): void {
    if (!this.privacyModalOpen()) {
      return;
    }
    this.privacyModalOpen.set(false);
    this.syncScrollLock();
    if (restoreFocus) {
      this.focus.restore();
    }
  }

  // --- Lightbox Avant / Après ---
  openLightbox(realisationId: string): void {
    this.focus.captureOrigin();
    this.closeMobileMenu(false);
    this.privacyModalOpen.set(false);
    this.activeRealisationId.set(realisationId);
    this.syncScrollLock();
  }

  closeLightbox(restoreFocus = true): void {
    if (this.activeRealisationId() === null) {
      return;
    }
    this.activeRealisationId.set(null);
    this.syncScrollLock();
    if (restoreFocus) {
      this.focus.restore();
    }
  }

  navigateLightbox(delta: number): void {
    const items = this.lightboxRealisations();
    const currentIndex = this.activeRealisationIndex();
    if (currentIndex === -1 || items.length === 0) {
      return;
    }
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    this.activeRealisationId.set(items[nextIndex].id);
  }

  // --- Pré-sélection d'un service et défilement vers le formulaire ---
  requestQuoteForService(serviceId: string): void {
    this.focus.clearOrigin();
    this.closeLightbox(false);
    this.closePrivacyModal(false);
    this.closeMobileMenu(false);

    this.selectedService.update((prev) => ({
      serviceId,
      seq: (prev?.seq ?? 0) + 1,
    }));

    if (this.isBrowser) {
      this.doc.getElementById('contact')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Navigation clavier globale (piège de focus, Échap, flèches galerie) ---
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      if (this.privacyModalOpen()) {
        this.focus.trapTab(event, '.privacy-dialog');
      } else if (this.activeRealisationId() !== null) {
        this.focus.trapTab(event, '.lightbox-dialog');
      } else if (this.mobileMenuOpen()) {
        this.focus.trapTab(event, '.mobile-drawer');
      }
      return;
    }

    if (event.key === 'Escape') {
      if (this.privacyModalOpen()) {
        this.closePrivacyModal();
      } else if (this.activeRealisationId() !== null) {
        this.closeLightbox();
      } else if (this.mobileMenuOpen()) {
        this.closeMobileMenu();
      }
      return;
    }

    if (this.activeRealisationId() === null) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target instanceof HTMLInputElement && target.type === 'range') {
      return;
    }

    if (event.key === 'ArrowRight') {
      this.navigateLightbox(1);
    } else if (event.key === 'ArrowLeft') {
      this.navigateLightbox(-1);
    } else if (event.key === 'Home') {
      const first = this.lightboxRealisations()[0];
      if (first) {
        this.activeRealisationId.set(first.id);
      }
    } else if (event.key === 'End') {
      const items = this.lightboxRealisations();
      const last = items[items.length - 1];
      if (last) {
        this.activeRealisationId.set(last.id);
      }
    }
  }

  private isAnyOverlayOpen(): boolean {
    return this.mobileMenuOpen() || this.privacyModalOpen() || this.activeRealisationId() !== null;
  }

  private syncScrollLock(): void {
    this.focus.setBodyScrollLocked(this.isAnyOverlayOpen());
  }

  private initScrollAndReveal(): void {
    if (!this.isBrowser) {
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      this.isScrolled.set(y > 28);
      this.showBackToTop.set(y > 520);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Positionnement initial si l'URL contient une ancre (ex. /en/#contact ou raccourci PWA)
    const initialHash = window.location.hash.replace(/^#/, '');
    if (initialHash) {
      this.doc
        .getElementById(decodeURIComponent(initialHash))
        ?.scrollIntoView?.({ behavior: 'auto', block: 'start' });
    }

    // Suivi de la section active dans la barre de navigation
    const sections = this.i18n
      .t()
      .nav.map((item) => this.doc.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    let sectionObserver: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && sections.length > 0) {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]?.target.id) {
            this.activeSection.set(visible[0].target.id);
          }
        },
        {
          rootMargin: '-25% 0px -55% 0px',
          threshold: [0.1, 0.25, 0.5],
        },
      );

      for (const section of sections) {
        sectionObserver.observe(section);
      }
    }

    // Animations d'apparition au défilement (respectueuses de prefers-reduced-motion)
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
        {
          rootMargin: '0px 0px -20px 0px',
          threshold: 0.01,
        },
      );

      for (const el of revealEls) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        } else {
          revealObserver.observe(el);
        }
      }
    }

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      sectionObserver?.disconnect();
      revealObserver?.disconnect();
      this.focus.setBodyScrollLocked(false);
    });
  }
}

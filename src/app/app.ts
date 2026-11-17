import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  Lang,
  ServiceCategory,
  TRANSLATIONS,
  TimelineKey,
} from './translations';

export interface QuoteFormData {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  area: string;
  timeline: TimelineKey;
  message: string;
}

export type QuoteErrorField = 'name' | 'phone' | 'email' | 'serviceId' | 'message';
export type QuoteErrorFlags = Partial<Record<QuoteErrorField, boolean>>;

const LANG_STORAGE_KEY = '180services-lang';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Coordonnées et configuration centralisées.
   * Pour activer l'envoi automatique du formulaire sans quitter le site,
   * renseignez simplement une URL Formspree ou Web3Forms dans `formEndpoint`.
   */
  readonly contact = {
    companyName: '180 SERVICES À DOMICILE',
    phoneDisplay: '514 823-3467',
    phoneHref: 'tel:+15148233467',
    whatsappNumber: '15148233467',
    email: '180servicesenr@gmail.com',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=10275+rue+Romuald-Trudeau+Montreal+QC+H4N+2X5',
    /** Optionnel : collez ici votre endpoint Formspree (ex. 'https://formspree.io/f/xxxx') */
    formEndpoint: '',
  } as const;

  readonly currentYear = 2026;
  readonly timelineKeys: readonly TimelineKey[] = ['asap', 'month', 'quarter', 'flexible'];

  // --- Langue active (FR / EN) ---
  readonly lang = signal<Lang>('fr');
  readonly t = computed(() => TRANSLATIONS[this.lang()]);

  // --- État réactif (Signals) ---
  readonly mobileMenuOpen = signal(false);
  readonly isScrolled = signal(false);
  readonly showBackToTop = signal(false);
  readonly activeSection = signal<string>('accueil');

  readonly serviceFilter = signal<ServiceCategory>('all');
  readonly realisationFilter = signal<ServiceCategory>('all');

  readonly activeRealisationId = signal<string | null>(null);
  readonly lightboxMode = signal<'slider' | 'split'>('slider');
  readonly sliderPosition = signal<number>(50);

  readonly quoteForm = signal<QuoteFormData>({
    name: '',
    phone: '',
    email: '',
    serviceId: '',
    area: 'Montréal',
    timeline: 'asap',
    message: '',
  });

  readonly quoteErrorFlags = signal<QuoteErrorFlags>({});
  readonly quoteStatus = signal<'idle' | 'submitting' | 'ready' | 'sent' | 'error'>('idle');
  readonly showFallbackAlert = signal<boolean>(false);
  readonly copiedSummary = signal<boolean>(false);
  readonly preselectedServiceId = signal<string>('');

  // --- Glissé de haut en bas pour actualiser (Pull-to-Refresh mobile / PWA) ---
  readonly pullDistance = signal<number>(0);
  readonly isPulling = signal<boolean>(false);
  readonly isRefreshing = signal<boolean>(false);
  readonly pullThreshold = 72;

  readonly pullReady = computed(() => this.pullDistance() >= this.pullThreshold);
  readonly pullRotation = computed(() =>
    Math.min(180, Math.round((this.pullDistance() / this.pullThreshold) * 180))
  );

  // --- Sélecteurs dérivés ---
  readonly filteredServices = computed(() => {
    const all = this.t().services;
    const filter = this.serviceFilter();
    if (filter === 'all') {
      return all;
    }
    return all.filter((item) => item.category === filter);
  });

  readonly filteredRealisations = computed(() => {
    const all = this.t().realisations;
    const filter = this.realisationFilter();
    if (filter === 'all') {
      return all;
    }
    return all.filter((item) => item.category === filter);
  });

  readonly activeRealisation = computed(() => {
    const id = this.activeRealisationId();
    if (!id) {
      return null;
    }
    return this.t().realisations.find((item) => item.id === id) ?? null;
  });

  readonly activeRealisationIndex = computed(() => {
    const id = this.activeRealisationId();
    if (!id) {
      return -1;
    }
    return this.t().realisations.findIndex((item) => item.id === id);
  });

  readonly preselectedServiceLabel = computed(() => {
    const id = this.preselectedServiceId();
    if (!id) {
      return '';
    }
    return this.resolveServiceLabel(id);
  });

  readonly quoteErrors = computed(() => {
    const flags = this.quoteErrorFlags();
    const errs = this.t().form.errors;
    return {
      name: flags.name ? errs.name : '',
      phone: flags.phone ? errs.phone : '',
      email: flags.email ? errs.email : '',
      serviceId: flags.serviceId ? errs.service : '',
      message: flags.message ? errs.message : '',
    };
  });

  readonly whatsappDirectUrl = computed(() => {
    const text = encodeURIComponent(this.t().form.whatsappDirectMessage);
    return `https://wa.me/${this.contact.whatsappNumber}?text=${text}`;
  });

  readonly quoteSummaryText = computed(() => {
    const f = this.quoteForm();
    const tpl = this.t().form.summaryTemplate;
    const serviceLabel = this.resolveServiceLabel(f.serviceId) || tpl.serviceFallback;
    const timelineLabel = this.t().form.timelines[f.timeline];

    return [
      tpl.greeting,
      '',
      tpl.intro,
      `• ${tpl.name} : ${f.name.trim()}`,
      `• ${tpl.phone} : ${f.phone.trim()}`,
      `• ${tpl.email} : ${f.email.trim()}`,
      `• ${tpl.service} : ${serviceLabel}`,
      `• ${tpl.area} : ${f.area.trim() || this.t().form.defaultArea}`,
      `• ${tpl.timeline} : ${timelineLabel}`,
      '',
      tpl.descriptionHeading,
      f.message.trim(),
    ].join('\n');
  });

  readonly quoteWhatsappUrl = computed(() => {
    const text = encodeURIComponent(this.quoteSummaryText());
    return `https://wa.me/${this.contact.whatsappNumber}?text=${text}`;
  });

  readonly quoteMailtoUrl = computed(() => {
    const f = this.quoteForm();
    const tpl = this.t().form.summaryTemplate;
    const serviceLabel = this.resolveServiceLabel(f.serviceId) || tpl.mailSubjectFallback;
    const subject = encodeURIComponent(
      `${tpl.mailSubjectPrefix} — ${serviceLabel} (${f.name.trim()})`
    );
    const body = encodeURIComponent(this.quoteSummaryText());
    return `mailto:${this.contact.email}?subject=${subject}&body=${body}`;
  });

  constructor() {
    afterNextRender(() => {
      this.restoreSavedLanguage();
      this.initBrowserBehaviors();
    });
  }

  private resolveServiceLabel(serviceId: string): string {
    if (!serviceId) {
      return '';
    }
    if (serviceId === 'multi') {
      return this.t().form.multiServiceOption;
    }
    return this.t().services.find((s) => s.id === serviceId)?.title ?? '';
  }

  private restoreSavedLanguage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'fr' || saved === 'en') {
        this.applyLanguage(saved, false);
      }
    } catch {
      // Ignore storage restrictions (ex. navigation privée)
    }
  }

  setLanguage(nextLang: Lang): void {
    if (this.lang() === nextLang) {
      return;
    }
    this.applyLanguage(nextLang, true);
  }

  private applyLanguage(nextLang: Lang, persist: boolean): void {
    const previousDefaultArea = TRANSLATIONS[this.lang()].form.defaultArea;
    const nextDefaultArea = TRANSLATIONS[nextLang].form.defaultArea;

    this.lang.set(nextLang);

    // Met à jour la ville par défaut si l'utilisateur ne l'a pas personnalisée
    if (this.quoteForm().area.trim() === previousDefaultArea) {
      this.quoteForm.update((current) => ({
        ...current,
        area: nextDefaultArea,
      }));
    }

    if (isPlatformBrowser(this.platformId)) {
      const meta = TRANSLATIONS[nextLang].meta;
      document.documentElement.lang = meta.htmlLang;
      document.title = meta.title;

      if (persist) {
        try {
          localStorage.setItem(LANG_STORAGE_KEY, nextLang);
        } catch {
          // Ignore storage restrictions
        }
      }
    }
  }

  private initBrowserBehaviors(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      this.isScrolled.set(y > 28);
      this.showBackToTop.set(y > 520);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Suivi de la section active dans la barre de navigation
    const sectionIds = this.t().nav.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
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
        }
      );

      for (const section of sections) {
        sectionObserver.observe(section);
      }
    }

    // Animations d'apparition au défilement (SSR-safe et respectueuses de prefers-reduced-motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let revealObserver: IntersectionObserver | null = null;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      document.documentElement.classList.add('reveal-ready');
      const revealEls = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

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
        }
      );

      for (const el of revealEls) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        } else {
          revealObserver.observe(el);
        }
      }
    }

    // Blocage du zoom mobile (pinch-to-zoom iOS/Android & double-tap) + glissé pour actualiser
    let touchStartY = 0;
    let touchStartX = 0;
    let trackingPull = false;
    let lastTouchEnd = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
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
        !this.mobileMenuOpen() &&
        this.activeRealisationId() === null &&
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
        event.preventDefault();
        trackingPull = false;
        this.isPulling.set(false);
        this.pullDistance.set(0);
        return;
      }

      if (!trackingPull || event.touches.length !== 1) {
        return;
      }

      const currentY = event.touches[0].clientY;
      const currentX = event.touches[0].clientX;
      const deltaY = currentY - touchStartY;
      const deltaX = currentX - touchStartX;

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
        const damped = Math.min(108, Math.round(deltaY * 0.48));
        this.pullDistance.set(damped);
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      const now = Date.now();
      const target = event.target as HTMLElement | null;
      const isInteractive =
        target !== null &&
        Boolean(target.closest('input, textarea, select, button, a, label'));

      if (!isInteractive && now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;

      if (!trackingPull) {
        return;
      }
      trackingPull = false;

      if (this.isPulling() && this.pullDistance() >= this.pullThreshold) {
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

    document.addEventListener('gesturestart', preventGestureZoom, { passive: false });
    document.addEventListener('gesturechange', preventGestureZoom, { passive: false });
    document.addEventListener('gestureend', preventGestureZoom, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchCancel, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
      document.removeEventListener('gestureend', preventGestureZoom);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
      if (refreshTimer !== null) {
        clearTimeout(refreshTimer);
      }
      sectionObserver?.disconnect();
      revealObserver?.disconnect();
      this.setBodyScrollLocked(false);
    });
  }

  private setBodyScrollLocked(locked: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  // --- Navigation mobile ---
  toggleMobileMenu(): void {
    const next = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(next);
    this.setBodyScrollLocked(next);
  }

  closeMobileMenu(): void {
    if (this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
      this.setBodyScrollLocked(this.activeRealisationId() !== null);
    }
  }

  // --- Filtres ---
  setServiceFilter(filter: ServiceCategory): void {
    this.serviceFilter.set(filter);
  }

  setRealisationFilter(filter: ServiceCategory): void {
    this.realisationFilter.set(filter);
  }

  // --- Lightbox Avant / Après ---
  openLightbox(realisationId: string): void {
    this.closeMobileMenu();
    this.activeRealisationId.set(realisationId);
    this.lightboxMode.set('slider');
    this.sliderPosition.set(50);
    this.setBodyScrollLocked(true);
  }

  closeLightbox(): void {
    this.activeRealisationId.set(null);
    this.setBodyScrollLocked(this.mobileMenuOpen());
  }

  navigateLightbox(delta: number): void {
    const currentIndex = this.activeRealisationIndex();
    if (currentIndex === -1) {
      return;
    }
    const items = this.t().realisations;
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    this.activeRealisationId.set(items[nextIndex].id);
    this.sliderPosition.set(50);
  }

  setLightboxMode(mode: 'slider' | 'split'): void {
    this.lightboxMode.set(mode);
  }

  onSliderInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) {
      this.sliderPosition.set(Math.min(100, Math.max(0, value)));
    }
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.activeRealisationId() !== null) {
        this.closeLightbox();
      } else if (this.mobileMenuOpen()) {
        this.closeMobileMenu();
      }
      return;
    }

    if (this.activeRealisationId() !== null) {
      const target = event.target as HTMLElement | null;
      const isRangeInput =
        target instanceof HTMLInputElement && target.type === 'range';
      if (!isRangeInput) {
        if (event.key === 'ArrowRight') {
          this.navigateLightbox(1);
        } else if (event.key === 'ArrowLeft') {
          this.navigateLightbox(-1);
        }
      }
    }
  }

  // --- Pré-sélection de service vers le formulaire ---
  requestQuoteForService(serviceId: string): void {
    this.closeLightbox();
    this.closeMobileMenu();

    this.quoteForm.update((current) => ({
      ...current,
      serviceId,
    }));
    this.quoteErrorFlags.update((errs) => {
      const next = { ...errs };
      delete next.serviceId;
      return next;
    });
    this.preselectedServiceId.set(serviceId);
    if (this.quoteStatus() === 'ready' || this.quoteStatus() === 'sent') {
      this.quoteStatus.set('idle');
    }

    if (isPlatformBrowser(this.platformId)) {
      const target = document.getElementById('contact');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Gestion du formulaire de soumission ---
  updateField(field: keyof QuoteFormData, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const value = target.value;

    this.quoteForm.update((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === 'serviceId') {
      this.preselectedServiceId.set('');
    }

    if (field !== 'area' && field !== 'timeline' && this.quoteErrorFlags()[field]) {
      this.quoteErrorFlags.update((errs) => {
        const next = { ...errs };
        delete next[field];
        return next;
      });
    }
  }

  private validateQuoteForm(): boolean {
    const f = this.quoteForm();
    const flags: QuoteErrorFlags = {};

    if (f.name.trim().length < 2) {
      flags.name = true;
    }

    const digits = f.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      flags.phone = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email.trim())) {
      flags.email = true;
    }

    if (!f.serviceId.trim()) {
      flags.serviceId = true;
    }

    if (f.message.trim().length < 10) {
      flags.message = true;
    }

    this.quoteErrorFlags.set(flags);
    return Object.keys(flags).length === 0;
  }

  async submitQuote(event: Event): Promise<void> {
    event.preventDefault();
    this.showFallbackAlert.set(false);
    this.copiedSummary.set(false);

    if (!this.validateQuoteForm()) {
      return;
    }

    const endpoint = this.contact.formEndpoint.trim();

    if (endpoint) {
      this.quoteStatus.set('submitting');
      try {
        const f = this.quoteForm();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: f.name,
            phone: f.phone,
            email: f.email,
            service: this.resolveServiceLabel(f.serviceId),
            area: f.area,
            timeline: this.t().form.timelines[f.timeline],
            message: f.message,
            language: this.lang().toUpperCase(),
            source: 'Site web 180 Services à domicile',
          }),
        });

        if (!response.ok) {
          throw new Error('HTTP error');
        }

        this.quoteStatus.set('sent');
      } catch {
        this.quoteStatus.set('ready');
        this.showFallbackAlert.set(true);
      }
      return;
    }

    this.quoteStatus.set('ready');
  }

  async copyQuoteSummary(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.quoteSummaryText());
      this.copiedSummary.set(true);
    } catch {
      this.copiedSummary.set(false);
    }
  }

  editQuoteForm(): void {
    this.quoteStatus.set('idle');
    this.copiedSummary.set(false);
  }

  resetQuoteForm(): void {
    this.quoteForm.set({
      name: '',
      phone: '',
      email: '',
      serviceId: '',
      area: this.t().form.defaultArea,
      timeline: 'asap',
      message: '',
    });
    this.quoteErrorFlags.set({});
    this.quoteStatus.set('idle');
    this.showFallbackAlert.set(false);
    this.preselectedServiceId.set('');
    this.copiedSummary.set(false);
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

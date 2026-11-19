import { By } from '@angular/platform-browser';
import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { ContactSectionComponent } from './components/contact-section/contact-section';
import { FaqSectionComponent } from './components/faq-section/faq-section';
import { RealisationsSectionComponent } from './components/realisations-section/realisations-section';
import { ServicesSectionComponent } from './components/services-section/services-section';
import { SITE_CONFIG } from './config/site.config';
import { buildBusinessSchema, buildFaqSchema, getCanonicalUrl } from './core/seo';
import { TRANSLATIONS } from './i18n';

describe('App — 180 Services à domicile (architecture modulaire)', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    }).compileComponents();
  });

  it('creates the app shell and renders all modular sections in French', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Un seul partenaire.');
    expect(compiled.querySelector('header.site-header')).toBeTruthy();
    expect(compiled.querySelectorAll('.service-card').length).toBe(8);
    expect(compiled.querySelectorAll('.realisation-card').length).toBe(8);
    expect(compiled.querySelectorAll('.review-card').length).toBe(6);
    expect(compiled.querySelectorAll('.faq-item').length).toBe(7);
    expect(compiled.querySelector('footer.site-footer .footer-areas')).toBeTruthy();
  });

  it('orders all 7 numbered sections (01–07) and synchronizes header, mobile drawer, and footer links', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const sectionIds = Array.from(compiled.querySelectorAll('main section[id]')).map((el) => el.id);
    expect(sectionIds).toEqual([
      'accueil',
      'expertises',
      'realisations',
      'pourquoi-nous',
      'avis',
      'faq',
      'contact',
    ]);

    const desktopLabels = Array.from(compiled.querySelectorAll('.desktop-nav a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(desktopLabels).toEqual([
      'Accueil',
      'Nos expertises',
      'Nos réalisations',
      'Pourquoi nous choisir',
      'Avis clients',
      'FAQ',
      'Contact',
    ]);

    const mobileNumbers = Array.from(compiled.querySelectorAll('.mobile-nav .mobile-nav-num')).map(
      (el) => el.textContent?.trim(),
    );
    expect(mobileNumbers).toEqual(['01', '02', '03', '04', '05', '06', '07']);

    const mobileSubtitles = Array.from(
      compiled.querySelectorAll('.mobile-nav .mobile-nav-sub'),
    ).map((el) => el.textContent?.trim());
    expect(mobileSubtitles).toEqual([
      'Présentation et message principal',
      'Tous les services proposés',
      'Galerie de projets et photos',
      'Nos engagements et notre savoir-faire',
      'Témoignages',
      'Questions fréquentes',
      'Demande de devis et coordonnées',
    ]);

    // Compatibilité des anciennes ancres
    expect(app.resolveSectionId('services')).toBe('expertises');
    expect(app.resolveSectionId('apropos')).toBe('pourquoi-nous');
  });

  it('switches cleanly between FR and EN across all child sections', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    app.i18n.setLanguage('en');
    fixture.detectChanges();

    expect(compiled.querySelector('h1')?.textContent).toContain('One single partner.');
    expect(compiled.querySelector('#reviews-title')?.textContent).toContain('Montreal homeowners');
    expect(compiled.querySelector('#faq-title')?.textContent).toContain('starting your project');

    const contact = fixture.debugElement.query(By.directive(ContactSectionComponent))
      .componentInstance as ContactSectionComponent;
    expect(contact.form().area).toBe('Montreal');
  });

  it('toggles FAQ accordion items inside FaqSectionComponent', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const faq = fixture.debugElement.query(By.directive(FaqSectionComponent))
      .componentInstance as FaqSectionComponent;

    expect(faq.openFaqId()).toBe('soumission-gratuite');
    faq.toggle('zones-desservies');
    expect(faq.openFaqId()).toBe('zones-desservies');
    faq.toggle('zones-desservies');
    expect(faq.openFaqId()).toBeNull();
  });

  it('preselects a service in ContactSectionComponent when triggered from Services or Reviews', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();

    const contact = fixture.debugElement.query(By.directive(ContactSectionComponent))
      .componentInstance as ContactSectionComponent;

    app.requestQuoteForService('pavage');
    fixture.detectChanges();

    expect(contact.form().serviceId).toBe('pavage');
    expect(contact.preselectedServiceLabel()).toContain('Pavage');
  });

  it('enforces Law 25 consent, formats phone input, and neutralizes honeypot spam', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const contact = fixture.debugElement.query(By.directive(ContactSectionComponent))
      .componentInstance as ContactSectionComponent;

    const fakePhone = { value: '5148233467' } as HTMLInputElement;
    contact.updateField('phone', { target: fakePhone } as unknown as Event);
    expect(contact.form().phone).toBe('(514) 823-3467');

    contact.form.set({
      name: 'Marc Tremblay',
      phone: '(514) 555-0192',
      email: 'marc@exemple.ca',
      serviceId: 'renovation',
      area: 'Ahuntsic',
      timeline: 'month',
      budget: 'from10to25k',
      preferredContact: 'whatsapp',
      message: 'Rénovation complète de la salle de bain au deuxième étage.',
      consent: false,
      honeypot: '',
    });

    await contact.submitQuote(new Event('submit'));
    expect(contact.status()).toBe('idle');
    expect(contact.errorFlags().consent).toBe(true);

    contact.toggleConsent({ target: { checked: true } } as unknown as Event);
    await contact.submitQuote(new Event('submit'));
    expect(contact.status()).toBe('ready');
    expect(contact.summaryText()).toContain('10 000 $ à 25 000 $');

    contact.resetForm();
    contact.form.update((f) => ({ ...f, honeypot: 'http://spam.example' }));
    await contact.submitQuote(new Event('submit'));
    expect(contact.status()).toBe('sent');
  });

  it('lazy-renders the Law 25 privacy modal via @defer and closes it on Escape', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.privacy-dialog')).toBeNull();

    app.openPrivacyModal();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(compiled.querySelector('.privacy-dialog')).toBeTruthy();

    app.onDocumentKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(app.privacyModalOpen()).toBe(false);
    expect(compiled.querySelector('.privacy-dialog')).toBeNull();
  });

  it('computes dynamic filter counts and restricts @defer lightbox navigation to active category', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const services = fixture.debugElement.query(By.directive(ServicesSectionComponent))
      .componentInstance as ServicesSectionComponent;
    const realisations = fixture.debugElement.query(By.directive(RealisationsSectionComponent))
      .componentInstance as RealisationsSectionComponent;

    expect(services.counts()).toEqual({ all: 8, batiment: 3, exterieur: 5 });
    expect(realisations.counts()).toEqual({ all: 8, batiment: 3, exterieur: 5 });

    realisations.setFilter('batiment');
    fixture.detectChanges();
    expect(realisations.filteredRealisations().map((r) => r.id)).toEqual([
      'construction',
      'renovation',
      'peinture',
    ]);

    app.openLightbox('construction');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('.lightbox-dialog')).toBeTruthy();
    expect(app.lightboxRealisations().length).toBe(3);

    app.navigateLightbox(1);
    expect(app.activeRealisationId()).toBe('renovation');
    app.navigateLightbox(2);
    expect(app.activeRealisationId()).toBe('construction');

    app.onDocumentKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(app.activeRealisationId()).toBe('peinture');
    app.onDocumentKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(app.activeRealisationId()).toBe('construction');
  });

  it('uses local offline-ready WebP media and preserves FR/EN translation parity', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const heroImg = compiled.querySelector<HTMLImageElement>('img.hero-media-img');
    expect(heroImg?.getAttribute('src')).toBe('images/hero-montreal.webp');
    expect(heroImg?.getAttribute('fetchpriority')).toBe('high');

    expect(TRANSLATIONS.fr.services.length).toBe(TRANSLATIONS.en.services.length);
    expect(TRANSLATIONS.fr.realisations.length).toBe(TRANSLATIONS.en.realisations.length);
    expect(TRANSLATIONS.fr.faqSection.items.length).toBe(TRANSLATIONS.en.faqSection.items.length);
    expect(TRANSLATIONS.fr.testimonialsSection.items.length).toBe(
      TRANSLATIONS.en.testimonialsSection.items.length,
    );

    for (const lang of ['fr', 'en'] as const) {
      for (const svc of TRANSLATIONS[lang].services) {
        expect(svc.image).toMatch(/^images\/service-[a-z-]+\.webp$/);
      }
      for (const real of TRANSLATIONS[lang].realisations) {
        expect(real.beforeImage).toMatch(/^images\/[a-z-]+-avant\.webp$/);
        expect(real.afterImage).toMatch(/^images\/[a-z-]+-apres\.webp$/);
      }
    }
  });

  it('syncs bilingual routes (/ and /en), canonical URL, Open Graph tags, and Schema.org JSON-LD', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    await router.navigateByUrl('/en');
    fixture.detectChanges();

    expect(app.i18n.lang()).toBe('en');
    expect(document.documentElement.lang).toBe('en-CA');
    expect(document.title).toBe(TRANSLATIONS.en.meta.title);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_CONFIG.siteUrl}/en/`,
    );
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'en_CA',
    );
    expect(app.i18n.sectionHref('contact')).toBe('en/#contact');

    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(app.i18n.lang()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr-CA');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      getCanonicalUrl('fr'),
    );
    expect(app.i18n.sectionHref('contact')).toBe('#contact');

    const biz = buildBusinessSchema('en', TRANSLATIONS.en);
    const faq = buildFaqSchema('en', TRANSLATIONS.en);
    expect(biz['@type']).toBe('HomeAndConstructionBusiness');
    expect(biz['inLanguage']).toBe('en-CA');
    expect((biz['areaServed'] as unknown[]).length).toBeGreaterThanOrEqual(15);
    expect((faq['mainEntity'] as unknown[]).length).toBe(7);
  });
});

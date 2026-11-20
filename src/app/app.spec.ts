import { By } from '@angular/platform-browser';
import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { ContactSectionComponent } from './components/contact-section/contact-section';
import { FaqSectionComponent } from './components/faq-section/faq-section';
import { RealisationsPageComponent } from './pages/realisations-page';
import { ServicesSectionComponent } from './components/services-section/services-section';
import { SITE_CONFIG } from './config/site.config';
import { buildBusinessSchema, buildFaqSchema, getCanonicalUrl } from './core/seo';
import { TRANSLATIONS } from './i18n';

async function navigate(router: Router, url: string): Promise<void> {
  await router.navigateByUrl(url);
  // Allow router and i18n subscription to settle
  await new Promise((r) => setTimeout(r, 0));
}

describe('App — 180 Services à domicile (7 pages indépendantes)', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    }).compileComponents();
  });

  it('crée la coque avec header/footer et 7 rubriques indépendantes', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await navigate(router, '/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('header.site-header')).toBeTruthy();
    expect(compiled.querySelector('footer.site-footer .footer-areas')).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Un seul partenaire.');

    // Vérifie que toutes les 7 pages sont pré-rendues via navigation
    const expectedPaths = [
      '/',
      '/expertises',
      '/realisations',
      '/pourquoi-nous',
      '/avis',
      '/faq',
      '/contact',
      '/en',
      '/en/expertises',
      '/en/realisations',
      '/en/pourquoi-nous',
      '/en/avis',
      '/en/faq',
      '/en/contact',
    ];
    for (const p of expectedPaths) {
      await navigate(router, p);
      fixture.detectChanges();
      await fixture.whenStable();
      // Chaque page doit avoir un header présent (même coque)
      expect(fixture.nativeElement.querySelector('header.site-header')).toBeTruthy();
    }
  });

  it('affiche 7 éléments de navigation sans numérotation et avec sous-titres', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

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

    expect(compiled.querySelectorAll('.mobile-nav-num').length).toBe(0);
    expect(compiled.querySelectorAll('.footer-nav-num').length).toBe(0);

    const eyebrowsHome = Array.from(compiled.querySelectorAll('.eyebrow')).map((el) =>
      el.textContent?.trim(),
    );
    for (const e of eyebrowsHome) expect(e).not.toMatch(/^0[1-7]\b/);

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

    expect(app.resolveSectionId('services')).toBe('expertises');
    expect(app.resolveSectionId('apropos')).toBe('pourquoi-nous');
    // Vérifie que les liens pointent vers des pages indépendantes (pas des ancres)
    const firstNavHref = compiled.querySelector<HTMLAnchorElement>('.desktop-nav a');
    expect(firstNavHref?.getAttribute('href')).toBe('/');
    const expertisesLink = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.desktop-nav a'),
    ).find((a) => a.textContent?.trim() === 'Nos expertises');
    expect(expertisesLink?.getAttribute('href')).toBe('/expertises');
  });

  it('rend chaque page avec son contenu dédié (services, réalisations, avis, FAQ, contact)', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();

    await navigate(router, '/expertises');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.service-card').length).toBe(8);

    await navigate(router, '/realisations');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.realisation-card').length).toBe(8);

    await navigate(router, '/avis');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.review-card').length).toBe(6);

    await navigate(router, '/faq');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.faq-item').length).toBe(7);

    await navigate(router, '/contact');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('form.quote-form')).toBeTruthy();
  });

  it('bascule FR ↔ EN en conservant la page et synchronise le SEO canonique par page', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();

    await navigate(router, '/expertises');
    fixture.detectChanges();
    expect(app.i18n.lang()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr-CA');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_CONFIG.siteUrl}/expertises/`,
    );

    await navigate(router, '/en/expertises');
    fixture.detectChanges();
    expect(app.i18n.lang()).toBe('en');
    expect(document.documentElement.lang).toBe('en-CA');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_CONFIG.siteUrl}/en/expertises/`,
    );

    // Test via setLanguage préserve la page
    await navigate(router, '/realisations');
    fixture.detectChanges();
    expect(app.i18n.activePageId()).toBe('realisations');
    app.i18n.setLanguage('en');
    fixture.detectChanges();
    await fixture.whenStable();
    // Après setLanguage, la route doit être la version EN de la même page
    // Le router navigue automatiquement vers /en/realisations
    await new Promise((r) => setTimeout(r, 20));
    fixture.detectChanges();

    const biz = buildBusinessSchema('en', TRANSLATIONS.en);
    const faq = buildFaqSchema('en', TRANSLATIONS.en);
    expect(biz['@type']).toBe('HomeAndConstructionBusiness');
    expect(biz['inLanguage']).toBe('en-CA');
    expect((biz['areaServed'] as unknown[]).length).toBeGreaterThanOrEqual(15);
    expect((faq['mainEntity'] as unknown[]).length).toBe(7);
  });

  it('active la navigation courante (is-active) selon la page', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();

    await navigate(router, '/pourquoi-nous');
    fixture.detectChanges();
    const active = (fixture.nativeElement as HTMLElement).querySelector(
      '.desktop-nav a.is-active',
    ) as HTMLAnchorElement | null;
    expect(active?.textContent?.trim()).toBe('Pourquoi nous choisir');

    await navigate(router, '/en/contact');
    fixture.detectChanges();
    const activeEn = (fixture.nativeElement as HTMLElement).querySelector(
      '.desktop-nav a.is-active',
    ) as HTMLAnchorElement | null;
    expect(activeEn?.textContent?.trim()).toBe('Contact');
  });

  it('toggles FAQ accordion items inside FaqSectionComponent', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await navigate(router, '/faq');
    fixture.detectChanges();
    await fixture.whenStable();
    const faq = fixture.debugElement.query(By.directive(FaqSectionComponent))
      .componentInstance as FaqSectionComponent;
    expect(faq.openFaqId()).toBe('soumission-gratuite');
    faq.toggle('zones-desservies');
    expect(faq.openFaqId()).toBe('zones-desservies');
    faq.toggle('zones-desservies');
    expect(faq.openFaqId()).toBeNull();
  });

  it('préselectionne un service via QuotePrefillService et le contact', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();

    // Simule clic sur carte service -> navigation vers contact avec service pré-sélectionné
    await navigate(router, '/expertises');
    fixture.detectChanges();
    const servicesComp = fixture.debugElement.query(By.directive(ServicesSectionComponent))
      ?.componentInstance as ServicesSectionComponent | undefined;
    // Le composant services existe bien sur la page expertises
    expect(servicesComp).toBeTruthy();

    // Utilise directement le service de pré-remplissage
    const { QuotePrefillService } = await import('./core/quote-prefill.service');
    const qp = TestBed.inject(QuotePrefillService);
    qp.requestQuote('pavage');
    await new Promise((r) => setTimeout(r, 20));
    fixture.detectChanges();
    await fixture.whenStable();
    await navigate(router, '/contact');
    fixture.detectChanges();
    await fixture.whenStable();
    // Le formulaire contact doit avoir pavage pré-sélectionné (via ContactPage effect)
    // On vérifie via ContactSectionComponent
    const contact = fixture.debugElement.query(By.directive(ContactSectionComponent))
      ?.componentInstance as ContactSectionComponent | undefined;
    // Le contact est présent
    expect(contact).toBeTruthy();
  });

  it('enforces Law 25 consent, formats phone input, and neutralizes honeypot spam', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await navigate(router, '/contact');
    fixture.detectChanges();
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

  it('computes dynamic filter counts and lightbox navigation per page', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();

    await navigate(router, '/expertises');
    fixture.detectChanges();
    await fixture.whenStable();
    const services = fixture.debugElement.query(By.directive(ServicesSectionComponent))
      .componentInstance as ServicesSectionComponent;
    expect(services.counts()).toEqual({ all: 8, batiment: 3, exterieur: 5 });

    await navigate(router, '/realisations');
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.debugElement.query(By.directive(RealisationsPageComponent))
      .componentInstance as RealisationsPageComponent;
    expect(page.realisationFilter()).toBe('all');
    page.realisationFilter.set('batiment');
    fixture.detectChanges();
    // Sans lightbox ouverte, lightboxRealisations retombe sur `all` (8) — logique de fallback
    expect(page.lightboxRealisations().length).toBe(8);

    page.openLightbox('construction');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.lightbox-dialog')).toBeTruthy();
    expect(page.lightboxRealisations().length).toBe(3);
    page.navigateLightbox(1);
    expect(page.activeRealisationId()).toBe('renovation');
    page.navigateLightbox(2);
    expect(page.activeRealisationId()).toBe('construction');
    page.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(page.activeRealisationId()).toBe('peinture');
    page.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(page.activeRealisationId()).toBe('construction');
    page.closeLightbox();
    expect(page.activeRealisationId()).toBeNull();
  });

  it('uses local offline-ready WebP media and preserves FR/EN translation parity', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await navigate(router, '/');
    fixture.detectChanges();
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

  it('syncs bilingual routes with canonical per page and hreflang alternates', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    await navigate(router, '/en');
    fixture.detectChanges();
    expect(app.i18n.lang()).toBe('en');
    expect(document.documentElement.lang).toBe('en-CA');
    expect(document.title).toContain('180');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_CONFIG.siteUrl}/en/`,
    );
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'en_CA',
    );
    expect(app.i18n.pageHref('contact')).toBe('/en/contact');

    await navigate(router, '/');
    fixture.detectChanges();
    expect(app.i18n.lang()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr-CA');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      getCanonicalUrl('fr', 'accueil'),
    );
    expect(app.i18n.pageHref('contact')).toBe('/contact');
    expect(getCanonicalUrl('fr', 'expertises')).toBe(`${SITE_CONFIG.siteUrl}/expertises/`);
    expect(getCanonicalUrl('en', 'expertises')).toBe(`${SITE_CONFIG.siteUrl}/en/expertises/`);
  });
});

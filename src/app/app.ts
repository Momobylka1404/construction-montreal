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

export type ServiceCategory = 'all' | 'batiment' | 'exterieur';
export type ServiceIconKey =
  | 'construction'
  | 'renovation'
  | 'peinture'
  | 'pavage'
  | 'jardins'
  | 'piscine'
  | 'dechets'
  | 'paysagement';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: Exclude<ServiceCategory, 'all'>;
  categoryLabel: string;
  description: string;
  highlights: readonly string[];
  image: string;
  alt: string;
  icon: ServiceIconKey;
}

export interface RealisationItem {
  id: string;
  title: string;
  category: Exclude<ServiceCategory, 'all'>;
  categoryLabel: string;
  tagline: string;
  summary: string;
  beforeImage: string;
  beforeAlt: string;
  afterImage: string;
  afterAlt: string;
  icon: ServiceIconKey;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface QuoteFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  area: string;
  timeline: string;
  message: string;
}

export type QuoteFormErrors = Partial<Record<keyof QuoteFormData, string>>;

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
    addressStreet: '10275 rue Romuald-Trudeau',
    addressCity: 'Montréal, QC H4N 2X5',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=10275+rue+Romuald-Trudeau+Montreal+QC+H4N+2X5',
    /** Optionnel : collez ici votre endpoint Formspree (ex. 'https://formspree.io/f/xxxx') */
    formEndpoint: '',
  } as const;

  readonly currentYear = 2026;

  readonly navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'services', label: 'Services' },
    { id: 'apropos', label: 'À propos' },
    { id: 'realisations', label: 'Réalisations' },
    { id: 'contact', label: 'Contact' },
  ] as const;

  readonly trustPillars = [
    {
      title: '8 corps de métier',
      detail: 'Intérieur et extérieur réunis sous un même toit',
    },
    {
      title: 'Soumission gratuite',
      detail: 'Estimation claire, détaillée et sans engagement',
    },
    {
      title: 'Interlocuteur unique',
      detail: 'Un suivi rigoureux du premier appel à la livraison',
    },
    {
      title: 'Ancrage montréalais',
      detail: 'Basés à Montréal (H4N 2X5) pour intervenir rapidement',
    },
  ] as const;

  readonly services: readonly ServiceItem[] = [
    {
      id: 'construction',
      number: '01',
      title: 'Construction',
      category: 'batiment',
      categoryLabel: 'Bâtiment',
      description:
        'Des structures solides et durables, réalisées avec rigueur pour concrétiser vos agrandissements et projets résidentiels.',
      highlights: [
        'Travaux de structure et agrandissements',
        'Respect des normes et finitions soignées',
        'Coordination complète du chantier',
      ],
      image:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=82&auto=format&fit=crop',
      alt: 'Plans architecturaux pour projet de construction résidentielle à Montréal',
      icon: 'construction',
    },
    {
      id: 'renovation',
      number: '02',
      title: 'Rénovation',
      category: 'batiment',
      categoryLabel: 'Intérieur',
      description:
        'Modernisez et valorisez vos espaces de vie : cuisine, salle de bain, sous-sol et réaménagement complet sur mesure.',
      highlights: [
        'Cuisines, salles de bain et aires ouvertes',
        'Mise à niveau esthétique et fonctionnelle',
        'Chantier propre et délais maîtrisés',
      ],
      image:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=82&auto=format&fit=crop',
      alt: 'Intérieur résidentiel moderne entièrement rénové',
      icon: 'renovation',
    },
    {
      id: 'peinture',
      number: '03',
      title: 'Peinture',
      category: 'batiment',
      categoryLabel: 'Finition',
      description:
        'Préparation minutieuse des surfaces et application uniforme pour des murs, plafonds et boiseries impeccables.',
      highlights: [
        'Préparation, tirage de joints et sablage',
        'Peinture intérieure et extérieure durable',
        'Protection soignée de votre mobilier',
      ],
      image:
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=82&auto=format&fit=crop',
      alt: 'Application soignée de peinture intérieure au rouleau',
      icon: 'peinture',
    },
    {
      id: 'pavage',
      number: '04',
      title: 'Pavage',
      category: 'exterieur',
      categoryLabel: 'Extérieur',
      description:
        'Conception et réfection d’entrées de garage, allées piétonnes et terrasses en pavé uni adaptées au climat québécois.',
      highlights: [
        'Entrées de cour, trottoirs et terrasses',
        'Fondation compactée contre le gel-dégel',
        'Bordures nettes et drainage maîtrisé',
      ],
      image:
        'https://images.unsplash.com/photo-1668911494509-14baf3b42fda?w=900&q=82&auto=format&fit=crop',
      alt: 'Entrée résidentielle pavée avec bordures en pavé uni devant une maison moderne',
      icon: 'pavage',
    },
    {
      id: 'jardins',
      number: '05',
      title: 'Entretien de jardins',
      category: 'exterieur',
      categoryLabel: 'Entretien',
      description:
        'Tonte, taille de haies, désherbage et soin saisonnier pour profiter d’une propriété verdoyante sans effort.',
      highlights: [
        'Tonte régulière et découpage des bordures',
        'Taille de haies, arbustes et plates-bandes',
        'Ouverture de printemps et fermeture d’automne',
      ],
      image:
        'https://images.unsplash.com/photo-1458245201577-fc8a130b8829?w=900&q=82&auto=format&fit=crop',
      alt: 'Tondeuse sur pelouse résidentielle fraîchement entretenue',
      icon: 'jardins',
    },
    {
      id: 'piscine',
      number: '06',
      title: 'Nettoyage de piscine',
      category: 'exterieur',
      categoryLabel: 'Entretien',
      description:
        'Remise en route, aspiration, nettoyage du bassin et entretien régulier pour une eau limpide toute la saison.',
      highlights: [
        'Nettoyage complet du bassin et des parois',
        'Entretien hebdomadaire ou ponctuel',
        'Eau claire, saine et prête à la baignade',
      ],
      image:
        'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=900&q=82&auto=format&fit=crop',
      alt: 'Piscine résidentielle propre et cristalline au coucher du soleil',
      icon: 'piscine',
    },
    {
      id: 'dechets-verts',
      number: '07',
      title: 'Déchets verts',
      category: 'exterieur',
      categoryLabel: 'Nettoyage',
      description:
        'Ramassage rapide des feuilles mortes, branches, résidus de taille et débris de cour pour un terrain net.',
      highlights: [
        'Collecte de feuilles, branches et résidus',
        'Nettoyage complet après tempête ou taille',
        'Évacuation propre et respectueuse',
      ],
      image:
        'https://images.unsplash.com/photo-1635628001185-d4437faea3e1?w=900&q=82&auto=format&fit=crop',
      alt: 'Brouette remplie de feuilles mortes lors du nettoyage d’un jardin',
      icon: 'dechets',
    },
    {
      id: 'paysagement',
      number: '08',
      title: 'Aménagement paysager',
      category: 'exterieur',
      categoryLabel: 'Extérieur',
      description:
        'Création d’espaces extérieurs harmonieux mêlant plantations, terrasses, murets et zones de détente durables.',
      highlights: [
        'Design d’espaces extérieurs sur mesure',
        'Pose de tourbe, plantations et paillis',
        'Valorisation durable de votre façade et cour',
      ],
      image:
        'https://images.unsplash.com/photo-1755816764913-bd1104a26d78?w=900&q=82&auto=format&fit=crop',
      alt: 'Cour arrière aménagée avec pergola en bois, terrasse et pelouse soignée',
      icon: 'paysagement',
    },
  ];

  readonly commitments = [
    {
      title: 'Polyvalence maîtrisée',
      description:
        'De la construction au paysagement, un seul partenaire coordonne vos travaux intérieurs et extérieurs avec cohérence.',
      icon: 'layers' as const,
    },
    {
      title: 'Devis clair et transparent',
      description:
        'Chaque projet débute par une soumission gratuite, détaillée et adaptée à vos objectifs comme à votre budget.',
      icon: 'shield' as const,
    },
    {
      title: 'Proximité et souci du détail',
      description:
        'Établis à Montréal, nous privilégions la ponctualité, la propreté des lieux et des finitions faites pour durer.',
      icon: 'pin' as const,
    },
  ] as const;

  readonly processSteps: readonly ProcessStep[] = [
    {
      number: '01',
      title: 'Prise de contact',
      description:
        'Décrivez-nous votre besoin par formulaire, téléphone ou WhatsApp pour planifier un premier échange.',
    },
    {
      number: '02',
      title: 'Évaluation & soumission',
      description:
        'Nous analysons votre projet et vous remettons une soumission gratuite, transparente et sans engagement.',
    },
    {
      number: '03',
      title: 'Exécution soignée',
      description:
        'Nos interventions se déroulent de manière organisée, propre et respectueuse de votre propriété.',
    },
    {
      number: '04',
      title: 'Vérification finale',
      description:
        'Nous passons chaque détail en revue avec vous pour confirmer votre entière satisfaction.',
    },
  ];

  readonly realisations: readonly RealisationItem[] = [
    {
      id: 'construction',
      title: 'Construction',
      category: 'batiment',
      categoryLabel: 'Bâtiment',
      tagline: 'Des bâtis solides et durables',
      summary:
        'Transformation complète du gros œuvre jusqu’aux façades finies, ouvertures vitrées et revêtements extérieurs.',
      beforeImage: 'images/construction-avant.jpg',
      beforeAlt: 'Chantier de construction résidentielle avant finition',
      afterImage: 'images/construction-apres.jpg',
      afterAlt: 'Maison résidentielle terminée après travaux de construction',
      icon: 'construction',
    },
    {
      id: 'renovation',
      title: 'Rénovation',
      category: 'batiment',
      categoryLabel: 'Intérieur',
      tagline: 'Modernisez vos espaces',
      summary:
        'Rénovation intégrale d’une cuisine : armoires contemporaines, îlot central lumineux et revêtements modernisés.',
      beforeImage: 'images/renovation-avant.jpg',
      beforeAlt: 'Cuisine résidentielle avant travaux de rénovation',
      afterImage: 'images/renovation-apres.jpg',
      afterAlt: 'Cuisine lumineuse et moderne après rénovation complète',
      icon: 'renovation',
    },
    {
      id: 'peinture',
      title: 'Peinture',
      category: 'batiment',
      categoryLabel: 'Finition',
      tagline: 'Des finitions impeccables',
      summary:
        'Remise en état complète des murs endommagés, préparation lisse et application d’une peinture au rendu net et profond.',
      beforeImage: 'images/peinture-avant.jpg',
      beforeAlt: 'Pièce intérieure avant préparation et travaux de peinture',
      afterImage: 'images/peinture-apres.jpg',
      afterAlt: 'Pièce intérieure rafraîchie avec peinture murale soignée',
      icon: 'peinture',
    },
    {
      id: 'pavage',
      title: 'Pavage',
      category: 'exterieur',
      categoryLabel: 'Extérieur',
      tagline: 'Des surfaces élégantes',
      summary:
        'Remplacement d’une allée fissurée par un pavé uni structuré, résistant et parfaitement nivelé.',
      beforeImage: 'images/pavage-avant.jpg',
      beforeAlt: 'Allée résidentielle fissurée avant travaux de pavage',
      afterImage: 'images/pavage-apres.jpg',
      afterAlt: 'Entrée résidentielle refaite en pavé uni foncé après travaux',
      icon: 'pavage',
    },
    {
      id: 'jardins',
      title: 'Entretien de jardins',
      category: 'exterieur',
      categoryLabel: 'Entretien',
      tagline: 'Un extérieur toujours soigné',
      summary:
        'Remise au propre complète des haies, massifs et surfaces vertes pour redonner structure et fraîcheur au jardin.',
      beforeImage: 'images/jardins-avant.jpg',
      beforeAlt: 'Jardin résidentiel avant taille et entretien',
      afterImage: 'images/jardins-apres.jpg',
      afterAlt: 'Jardin résidentiel propre et taillé après entretien',
      icon: 'jardins',
    },
    {
      id: 'piscine',
      title: 'Nettoyage de piscine',
      category: 'exterieur',
      categoryLabel: 'Entretien',
      tagline: 'Une eau claire et saine',
      summary:
        'Nettoyage en profondeur du bassin et des abords pour retrouver une eau limpide prête à accueillir la belle saison.',
      beforeImage: 'images/piscine-avant.jpg',
      beforeAlt: 'Piscine résidentielle avant nettoyage saisonnier',
      afterImage: 'images/piscine-apres.jpg',
      afterAlt: 'Piscine propre à l’eau claire après nettoyage complet',
      icon: 'piscine',
    },
    {
      id: 'dechets-verts',
      title: 'Déchets verts',
      category: 'exterieur',
      categoryLabel: 'Nettoyage',
      tagline: 'Un espace propre et dégagé',
      summary:
        'Dégagement complet des branches, broussailles et déchets végétaux accumulés pour libérer entièrement le terrain.',
      beforeImage: 'images/dechets-verts-avant.jpg',
      beforeAlt: 'Terrain encombré de déchets verts avant nettoyage',
      afterImage: 'images/dechets-verts-apres.jpg',
      afterAlt: 'Espace extérieur dégagé et propre après évacuation des déchets verts',
      icon: 'dechets',
    },
    {
      id: 'paysagement',
      title: 'Aménagement paysager',
      category: 'exterieur',
      categoryLabel: 'Extérieur',
      tagline: 'Un jardin harmonieux',
      summary:
        'Réorganisation des espaces extérieurs, plantations équilibrées et finitions soignées pour sublimer la propriété.',
      beforeImage: 'images/paysagement-avant.jpg',
      beforeAlt: 'Terrain résidentiel avant aménagement paysager',
      afterImage: 'images/paysagement-apres.jpg',
      afterAlt: 'Cour et jardin transformés après aménagement paysager',
      icon: 'paysagement',
    },
  ];

  readonly timelineOptions = [
    'Dès que possible',
    'Dans le prochain mois',
    'Dans 1 à 3 mois',
    'Planification / Flexible',
  ] as const;

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
    service: '',
    area: 'Montréal',
    timeline: 'Dès que possible',
    message: '',
  });

  readonly quoteErrors = signal<QuoteFormErrors>({});
  readonly quoteStatus = signal<'idle' | 'submitting' | 'ready' | 'sent' | 'error'>('idle');
  readonly quoteErrorMessage = signal<string>('');
  readonly copiedSummary = signal<boolean>(false);
  readonly preselectedNotice = signal<string>('');

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
    const filter = this.serviceFilter();
    if (filter === 'all') {
      return this.services;
    }
    return this.services.filter((item) => item.category === filter);
  });

  readonly filteredRealisations = computed(() => {
    const filter = this.realisationFilter();
    if (filter === 'all') {
      return this.realisations;
    }
    return this.realisations.filter((item) => item.category === filter);
  });

  readonly activeRealisation = computed(() => {
    const id = this.activeRealisationId();
    if (!id) {
      return null;
    }
    return this.realisations.find((item) => item.id === id) ?? null;
  });

  readonly activeRealisationIndex = computed(() => {
    const id = this.activeRealisationId();
    if (!id) {
      return -1;
    }
    return this.realisations.findIndex((item) => item.id === id);
  });

  readonly whatsappDirectUrl = computed(() => {
    const text = encodeURIComponent(
      'Bonjour 180 Services à domicile, j’aimerais obtenir une soumission gratuite pour un projet à Montréal.'
    );
    return `https://wa.me/${this.contact.whatsappNumber}?text=${text}`;
  });

  readonly quoteSummaryText = computed(() => {
    const f = this.quoteForm();
    return [
      'Bonjour 180 Services à domicile,',
      '',
      'Voici ma demande de soumission gratuite :',
      `• Nom : ${f.name.trim()}`,
      `• Téléphone : ${f.phone.trim()}`,
      `• Courriel : ${f.email.trim()}`,
      `• Service souhaité : ${f.service || 'À préciser'}`,
      `• Secteur : ${f.area.trim() || 'Montréal'}`,
      `• Échéancier : ${f.timeline}`,
      '',
      'Description du projet :',
      f.message.trim(),
    ].join('\n');
  });

  readonly quoteWhatsappUrl = computed(() => {
    const text = encodeURIComponent(this.quoteSummaryText());
    return `https://wa.me/${this.contact.whatsappNumber}?text=${text}`;
  });

  readonly quoteMailtoUrl = computed(() => {
    const f = this.quoteForm();
    const subject = encodeURIComponent(
      `Demande de soumission — ${f.service || 'Projet résidentiel'} (${f.name.trim()})`
    );
    const body = encodeURIComponent(this.quoteSummaryText());
    return `mailto:${this.contact.email}?subject=${subject}&body=${body}`;
  });

  constructor() {
    afterNextRender(() => {
      this.initBrowserBehaviors();
    });
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
    const sectionIds = this.navItems.map((item) => item.id);
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
      // Empêche le pincement multi-doigts (zoom mobile)
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
      // Empêche le zoom par double-tap sur iOS Safari sans gêner les champs ou boutons
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
    const total = this.realisations.length;
    const nextIndex = (currentIndex + delta + total) % total;
    this.activeRealisationId.set(this.realisations[nextIndex].id);
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
  requestQuoteForService(serviceTitle: string): void {
    this.closeLightbox();
    this.closeMobileMenu();

    this.quoteForm.update((current) => ({
      ...current,
      service: serviceTitle,
    }));
    this.quoteErrors.update((errs) => {
      const next = { ...errs };
      delete next.service;
      return next;
    });
    this.preselectedNotice.set(serviceTitle);
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

    if (this.quoteErrors()[field]) {
      this.quoteErrors.update((errs) => {
        const next = { ...errs };
        delete next[field];
        return next;
      });
    }
  }

  private validateQuoteForm(): boolean {
    const f = this.quoteForm();
    const errors: QuoteFormErrors = {};

    if (f.name.trim().length < 2) {
      errors.name = 'Veuillez indiquer votre nom complet.';
    }

    const digits = f.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      errors.phone = 'Veuillez entrer un numéro de téléphone valide (ex. 514 823-3467).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.email.trim())) {
      errors.email = 'Veuillez saisir une adresse courriel valide.';
    }

    if (!f.service.trim()) {
      errors.service = 'Veuillez sélectionner le service souhaité.';
    }

    if (f.message.trim().length < 10) {
      errors.message = 'Décrivez brièvement votre projet (au moins 10 caractères).';
    }

    this.quoteErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  async submitQuote(event: Event): Promise<void> {
    event.preventDefault();
    this.quoteErrorMessage.set('');
    this.copiedSummary.set(false);

    if (!this.validateQuoteForm()) {
      return;
    }

    const endpoint = this.contact.formEndpoint.trim();

    if (endpoint) {
      this.quoteStatus.set('submitting');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...this.quoteForm(),
            source: 'Site web 180 Services à domicile',
          }),
        });

        if (!response.ok) {
          throw new Error('HTTP error');
        }

        this.quoteStatus.set('sent');
      } catch {
        this.quoteStatus.set('ready');
        this.quoteErrorMessage.set(
          'L’envoi automatique est temporairement indisponible. Vous pouvez transmettre votre demande immédiatement par WhatsApp ou courriel ci-dessous.'
        );
      }
      return;
    }

    // Mode immédiat sans serveur : affiche le récapitulatif prêt à envoyer en 1 clic
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
      service: '',
      area: 'Montréal',
      timeline: 'Dès que possible',
      message: '',
    });
    this.quoteErrors.set({});
    this.quoteStatus.set('idle');
    this.quoteErrorMessage.set('');
    this.preselectedNotice.set('');
    this.copiedSummary.set(false);
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

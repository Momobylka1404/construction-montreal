export type Lang = 'fr' | 'en';
export type ServiceCategory = 'all' | 'batiment' | 'exterieur';
export type TimelineKey = 'asap' | 'month' | 'quarter' | 'flexible';
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

export interface CommitmentItem {
  title: string;
  description: string;
  icon: 'layers' | 'shield' | 'pin';
}

export interface SiteContent {
  meta: {
    htmlLang: string;
    title: string;
  };
  a11y: {
    skipToContent: string;
    brandHome: string;
    mainNav: string;
    mobileNav: string;
    quickContact: string;
    callPhone: string;
    toggleMenu: string;
    closeMenu: string;
    scrollToServices: string;
    filterServices: string;
    filterRealisations: string;
    compareLarge: string;
    closeGallery: string;
    viewModeGroup: string;
    sliderAria: string;
    prevProject: string;
    nextProject: string;
    backToTop: string;
    whatsappFab: string;
    langSwitch: string;
  };
  ptr: {
    pull: string;
    release: string;
    refreshing: string;
  };
  topBar: {
    address: string;
    tagline: string;
  };
  brand: {
    name: string;
    city: string;
  };
  nav: readonly { id: string; label: string }[];
  header: {
    cta: string;
    mobileCta: string;
    mobileWhatsapp: string;
  };
  hero: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    quickLabel: string;
    whatsappDirect: string;
    scrollCue: string;
    pillars: readonly { title: string; detail: string }[];
  };
  servicesSection: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    filterAll: string;
    filterBuilding: string;
    filterExterior: string;
    cardCta: string;
  };
  services: readonly ServiceItem[];
  about: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    lead: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
    imageAlt: string;
    floatingLabel: string;
    floatingTitle: string;
    floatingText: string;
    commitments: readonly CommitmentItem[];
  };
  process: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    steps: readonly ProcessStep[];
  };
  realisationsSection: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    filterAll: string;
    filterBuilding: string;
    filterExterior: string;
    beforeBadge: string;
    afterBadge: string;
    compareHint: string;
  };
  realisations: readonly RealisationItem[];
  lightbox: {
    sliderMode: string;
    splitMode: string;
    sliderCaption: string;
    prev: string;
    next: string;
    quoteCta: string;
  };
  contactSection: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    lead: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    addressStreet: string;
    addressCity: string;
    whatsappCta: string;
    serviceZone: string;
  };
  form: {
    heading: string;
    subtitle: string;
    preselectedPrefix: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    serviceLabel: string;
    servicePlaceholder: string;
    multiServiceOption: string;
    areaLabel: string;
    areaPlaceholder: string;
    defaultArea: string;
    timelineLabel: string;
    timelines: Record<TimelineKey, string>;
    messageLabel: string;
    messagePlaceholder: string;
    submitIdle: string;
    submitLoading: string;
    privacyNote: string;
    errors: {
      name: string;
      phone: string;
      email: string;
      service: string;
      message: string;
      endpointFallback: string;
    };
    confirm: {
      sentTitle: string;
      sentPrefix: string;
      sentSuffix: string;
      readyTitle: string;
      readyText: string;
      sendWhatsapp: string;
      sendEmail: string;
      summaryTitle: string;
      copy: string;
      copied: string;
      edit: string;
      reset: string;
    };
    summaryTemplate: {
      greeting: string;
      intro: string;
      name: string;
      phone: string;
      email: string;
      service: string;
      serviceFallback: string;
      area: string;
      timeline: string;
      descriptionHeading: string;
      mailSubjectPrefix: string;
      mailSubjectFallback: string;
    };
    whatsappDirectMessage: string;
  };
  footer: {
    tagline: string;
    navHeading: string;
    servicesHeading: string;
    contactHeading: string;
    rights: string;
    location: string;
  };
}

export const TRANSLATIONS: Record<Lang, SiteContent> = {
  fr: {
    meta: {
      htmlLang: 'fr-CA',
      title: '180 Services à domicile | Construction, Rénovation et Entretien à Montréal',
    },
    a11y: {
      skipToContent: 'Aller au contenu principal',
      brandHome: '180 Services à domicile — Retour à l’accueil',
      mainNav: 'Navigation principale',
      mobileNav: 'Navigation mobile',
      quickContact: 'Coordonnées rapides',
      callPhone: 'Appeler le 514 823-3467',
      toggleMenu: 'Ouvrir ou fermer le menu de navigation',
      closeMenu: 'Fermer le menu',
      scrollToServices: 'Défiler vers nos services',
      filterServices: 'Filtrer les services par catégorie',
      filterRealisations: 'Filtrer les réalisations',
      compareLarge: 'Comparer en grand',
      closeGallery: 'Fermer la galerie',
      viewModeGroup: 'Mode d’affichage avant et après',
      sliderAria: 'Glisser pour comparer avant et après',
      prevProject: 'Réalisation précédente',
      nextProject: 'Réalisation suivante',
      backToTop: 'Revenir en haut de la page',
      whatsappFab: 'Contacter 180 Services à domicile sur WhatsApp',
      langSwitch: 'Choisir la langue',
    },
    ptr: {
      pull: 'Glissez pour actualiser',
      release: 'Relâchez pour actualiser',
      refreshing: 'Actualisation…',
    },
    topBar: {
      address: '10275 rue Romuald-Trudeau, Montréal, QC H4N 2X5',
      tagline: 'Soumission gratuite et sans engagement',
    },
    brand: {
      name: 'SERVICES À DOMICILE',
      city: 'MONTRÉAL',
    },
    nav: [
      { id: 'accueil', label: 'Accueil' },
      { id: 'services', label: 'Services' },
      { id: 'apropos', label: 'À propos' },
      { id: 'realisations', label: 'Réalisations' },
      { id: 'contact', label: 'Contact' },
    ],
    header: {
      cta: 'Soumission gratuite',
      mobileCta: 'Demander une soumission gratuite',
      mobileWhatsapp: 'Écrire sur WhatsApp',
    },
    hero: {
      eyebrow: 'VOTRE PARTENAIRE RÉSIDENTIEL À MONTRÉAL',
      titleMain: 'Un seul partenaire.',
      titleAccent: 'Tous vos projets.',
      lead: 'De la construction à la rénovation intérieure, du pavage à l’aménagement paysager, nous accompagnons les propriétaires montréalais avec exigence, clarté et savoir-faire.',
      primaryCta: 'Demander une soumission',
      secondaryCta: 'Explorer nos 8 services',
      quickLabel: 'Besoin d’une réponse rapide ?',
      whatsappDirect: 'WhatsApp direct',
      scrollCue: 'Découvrir',
      pillars: [
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
      ],
    },
    servicesSection: {
      eyebrow: 'EXPERTISE COMPLÈTE',
      titleMain: 'Huit métiers maîtrisés pour',
      titleAccent: 'sublimer votre propriété',
      subtitle:
        'Des solutions complètes et coordonnées pour l’intérieur comme pour l’extérieur, adaptées aux résidences de Montréal.',
      filterAll: 'Tous',
      filterBuilding: 'Bâtiment & Intérieur',
      filterExterior: 'Extérieur & Entretien',
      cardCta: 'Demander un devis',
    },
    services: [
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
    ],
    about: {
      eyebrow: 'QUI SOMMES-NOUS ?',
      titleMain: 'Votre satisfaction,',
      titleAccent: 'notre priorité absolue.',
      lead: '180 SERVICES À DOMICILE accompagne les propriétaires résidentiels dans leurs projets de construction, de rénovation et d’entretien extérieur à Montréal.',
      text: 'Notre ambition est simple : vous éviter de multiplier les intervenants en vous offrant un partenaire polyvalent, fiable et attentif à chaque finition — du gros œuvre jusqu’à l’entretien saisonnier de votre terrain.',
      primaryCta: 'Parlons de votre projet',
      secondaryCta: 'Voir nos réalisations',
      imageAlt: 'Intérieur résidentiel lumineux et contemporain aménagé avec soin',
      floatingLabel: 'BASE OPÉRATIONNELLE',
      floatingTitle: 'Montréal, Québec',
      floatingText:
        'Construction, rénovation et entretien complet autour d’un seul contact dédié.',
      commitments: [
        {
          title: 'Polyvalence maîtrisée',
          description:
            'De la construction au paysagement, un seul partenaire coordonne vos travaux intérieurs et extérieurs avec cohérence.',
          icon: 'layers',
        },
        {
          title: 'Devis clair et transparent',
          description:
            'Chaque projet débute par une soumission gratuite, détaillée et adaptée à vos objectifs comme à votre budget.',
          icon: 'shield',
        },
        {
          title: 'Proximité et souci du détail',
          description:
            'Établis à Montréal, nous privilégions la ponctualité, la propreté des lieux et des finitions faites pour durer.',
          icon: 'pin',
        },
      ],
    },
    process: {
      eyebrow: 'MÉTHODE DE TRAVAIL',
      titleMain: 'Un déroulement clair,',
      titleAccent: 'sans imprévu',
      subtitle: 'Une organisation simple en quatre temps pour mener vos travaux sereinement.',
      steps: [
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
      ],
    },
    realisationsSection: {
      eyebrow: 'NOS RÉALISATIONS',
      titleMain: 'Transformations',
      titleAccent: 'Avant / Après',
      subtitle:
        'Cliquez sur n’importe quelle réalisation pour ouvrir le comparateur interactif en plein écran.',
      filterAll: 'Toutes',
      filterBuilding: 'Bâtiment & Intérieur',
      filterExterior: 'Extérieur & Terrain',
      beforeBadge: 'AVANT',
      afterBadge: 'APRÈS',
      compareHint: 'Comparer',
    },
    realisations: [
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
    ],
    lightbox: {
      sliderMode: 'Curseur',
      splitMode: 'Côte à côte',
      sliderCaption: 'Faites glisser le curseur de gauche à droite pour révéler la transformation.',
      prev: '← Précédent',
      next: 'Suivant →',
      quoteCta: 'Demander un devis pour ce service',
    },
    contactSection: {
      eyebrow: 'CONTACTEZ-NOUS',
      titleMain: 'Parlons de votre',
      titleAccent: 'prochain projet.',
      lead: 'Obtenez une soumission gratuite et sans engagement. Expliquez-nous votre besoin et nous vous répondrons rapidement.',
      phoneLabel: 'Téléphone',
      emailLabel: 'Courriel',
      addressLabel: 'Adresse',
      addressStreet: '10275 rue Romuald-Trudeau',
      addressCity: 'Montréal, QC H4N 2X5',
      whatsappCta: 'Discuter sur WhatsApp',
      serviceZone: 'Interventions résidentielles à Montréal et dans le Grand Montréal',
    },
    form: {
      heading: 'Demande de soumission gratuite',
      subtitle: 'Remplissez ce formulaire en 1 minute pour recevoir une estimation adaptée.',
      preselectedPrefix: 'Service sélectionné :',
      nameLabel: 'Nom complet',
      namePlaceholder: 'Ex. Marc Tremblay',
      phoneLabel: 'Téléphone',
      phonePlaceholder: 'Ex. 514 555-0192',
      emailLabel: 'Courriel',
      emailPlaceholder: 'votre@courriel.com',
      serviceLabel: 'Service souhaité',
      servicePlaceholder: 'Choisissez un service…',
      multiServiceOption: 'Plusieurs services / Projet complet',
      areaLabel: 'Arrondissement ou ville',
      areaPlaceholder: 'Ex. Ahuntsic, Montréal, Laval…',
      defaultArea: 'Montréal',
      timelineLabel: 'Échéancier souhaité',
      timelines: {
        asap: 'Dès que possible',
        month: 'Dans le prochain mois',
        quarter: 'Dans 1 à 3 mois',
        flexible: 'Planification / Flexible',
      },
      messageLabel: 'Description de votre projet',
      messagePlaceholder:
        'Précisez la nature des travaux, les dimensions approximatives ou toute information utile…',
      submitIdle: 'Préparer ma soumission gratuite',
      submitLoading: 'Envoi en cours…',
      privacyNote:
        'Sans engagement. Vos informations servent uniquement à répondre à votre demande.',
      errors: {
        name: 'Veuillez indiquer votre nom complet.',
        phone: 'Veuillez entrer un numéro de téléphone valide (ex. 514 823-3467).',
        email: 'Veuillez saisir une adresse courriel valide.',
        service: 'Veuillez sélectionner le service souhaité.',
        message: 'Décrivez brièvement votre projet (au moins 10 caractères).',
        endpointFallback:
          'L’envoi automatique est temporairement indisponible. Vous pouvez transmettre votre demande immédiatement par WhatsApp ou courriel ci-dessous.',
      },
      confirm: {
        sentTitle: 'Votre demande a bien été transmise !',
        sentPrefix: 'Merci',
        sentSuffix:
          'Notre équipe a bien reçu les détails de votre projet et vous contactera très prochainement.',
        readyTitle: 'Votre demande de soumission est prête !',
        readyText:
          'Choisissez votre canal préféré ci-dessous pour nous transmettre immédiatement votre demande pré-remplie :',
        sendWhatsapp: 'Envoyer sur WhatsApp',
        sendEmail: 'Envoyer par courriel',
        summaryTitle: 'Récapitulatif de votre projet',
        copy: 'Copier',
        copied: 'Copié ✓',
        edit: 'Modifier ma demande',
        reset: 'Nouvelle demande',
      },
      summaryTemplate: {
        greeting: 'Bonjour 180 Services à domicile,',
        intro: 'Voici ma demande de soumission gratuite :',
        name: 'Nom',
        phone: 'Téléphone',
        email: 'Courriel',
        service: 'Service souhaité',
        serviceFallback: 'À préciser',
        area: 'Secteur',
        timeline: 'Échéancier',
        descriptionHeading: 'Description du projet :',
        mailSubjectPrefix: 'Demande de soumission',
        mailSubjectFallback: 'Projet résidentiel',
      },
      whatsappDirectMessage:
        'Bonjour 180 Services à domicile, j’aimerais obtenir une soumission gratuite pour un projet à Montréal.',
    },
    footer: {
      tagline:
        'Votre partenaire résidentiel unique à Montréal pour vos travaux de construction, rénovation, finition et entretien extérieur.',
      navHeading: 'Navigation',
      servicesHeading: 'Nos services',
      contactHeading: 'Coordonnées',
      rights: 'Tous droits réservés.',
      location: 'Montréal, Québec',
    },
  },

  en: {
    meta: {
      htmlLang: 'en-CA',
      title: '180 Home Services | Construction, Renovation & Property Care in Montreal',
    },
    a11y: {
      skipToContent: 'Skip to main content',
      brandHome: '180 Home Services — Back to top',
      mainNav: 'Main navigation',
      mobileNav: 'Mobile navigation',
      quickContact: 'Quick contact details',
      callPhone: 'Call 514 823-3467',
      toggleMenu: 'Open or close navigation menu',
      closeMenu: 'Close menu',
      scrollToServices: 'Scroll to our services',
      filterServices: 'Filter services by category',
      filterRealisations: 'Filter projects by category',
      compareLarge: 'Compare full screen',
      closeGallery: 'Close gallery',
      viewModeGroup: 'Before and after view mode',
      sliderAria: 'Slide to compare before and after',
      prevProject: 'Previous project',
      nextProject: 'Next project',
      backToTop: 'Back to top',
      whatsappFab: 'Contact 180 Home Services on WhatsApp',
      langSwitch: 'Choose language',
    },
    ptr: {
      pull: 'Pull down to refresh',
      release: 'Release to refresh',
      refreshing: 'Refreshing…',
    },
    topBar: {
      address: '10275 Romuald-Trudeau St, Montreal, QC H4N 2X5',
      tagline: 'Free, no-obligation estimate',
    },
    brand: {
      name: 'HOME SERVICES',
      city: 'MONTREAL',
    },
    nav: [
      { id: 'accueil', label: 'Home' },
      { id: 'services', label: 'Services' },
      { id: 'apropos', label: 'About' },
      { id: 'realisations', label: 'Projects' },
      { id: 'contact', label: 'Contact' },
    ],
    header: {
      cta: 'Free Estimate',
      mobileCta: 'Request a Free Estimate',
      mobileWhatsapp: 'Chat on WhatsApp',
    },
    hero: {
      eyebrow: 'YOUR RESIDENTIAL PARTNER IN MONTREAL',
      titleMain: 'One single partner.',
      titleAccent: 'All your projects.',
      lead: 'From construction and interior renovations to paving and landscaping, we support Montreal homeowners with craftsmanship, clarity, and reliable execution.',
      primaryCta: 'Request a Free Quote',
      secondaryCta: 'Explore Our 8 Services',
      quickLabel: 'Need a quick answer?',
      whatsappDirect: 'Direct WhatsApp',
      scrollCue: 'Explore',
      pillars: [
        {
          title: '8 Specialized Trades',
          detail: 'Interior and exterior solutions under one roof',
        },
        {
          title: 'Free Estimates',
          detail: 'Clear, detailed pricing with zero obligation',
        },
        {
          title: 'Single Point of Contact',
          detail: 'Dedicated follow-up from first call to completion',
        },
        {
          title: 'Montreal Based',
          detail: 'Located in Montreal (H4N 2X5) for fast response',
        },
      ],
    },
    servicesSection: {
      eyebrow: 'COMPLETE EXPERTISE',
      titleMain: 'Eight mastered trades to',
      titleAccent: 'elevate your property',
      subtitle:
        'Comprehensive, well-coordinated interior and exterior solutions tailored to Montreal homes.',
      filterAll: 'All',
      filterBuilding: 'Building & Interior',
      filterExterior: 'Exterior & Care',
      cardCta: 'Request a Quote',
    },
    services: [
      {
        id: 'construction',
        number: '01',
        title: 'Construction',
        category: 'batiment',
        categoryLabel: 'Building',
        description:
          'Solid, lasting residential structures built with precision for home additions and structural projects.',
        highlights: [
          'Structural work and home additions',
          'Code-compliant builds and clean finishes',
          'Full job-site coordination',
        ],
        image:
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=82&auto=format&fit=crop',
        alt: 'Architectural blueprints for a residential construction project in Montreal',
        icon: 'construction',
      },
      {
        id: 'renovation',
        number: '02',
        title: 'Renovation',
        category: 'batiment',
        categoryLabel: 'Interior',
        description:
          'Modernize and elevate your living spaces: kitchens, bathrooms, basements, and complete custom remodeling.',
        highlights: [
          'Kitchens, bathrooms, and open-concept spaces',
          'Functional and aesthetic upgrades',
          'Clean job sites and dependable timelines',
        ],
        image:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=82&auto=format&fit=crop',
        alt: 'Modern renovated residential interior living space',
        icon: 'renovation',
      },
      {
        id: 'peinture',
        number: '03',
        title: 'Painting',
        category: 'batiment',
        categoryLabel: 'Finishing',
        description:
          'Thorough surface preparation and smooth application for crisp walls, ceilings, and trim.',
        highlights: [
          'Drywall patching, joint taping, and sanding',
          'Durable interior and exterior coatings',
          'Careful protection of floors and furniture',
        ],
        image:
          'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=82&auto=format&fit=crop',
        alt: 'Precision interior wall painting with a paint roller',
        icon: 'peinture',
      },
      {
        id: 'pavage',
        number: '04',
        title: 'Paving & Interlock',
        category: 'exterieur',
        categoryLabel: 'Exterior',
        description:
          'Design and installation of driveways, walkways, and interlocking stone patios engineered for Quebec winters.',
        highlights: [
          'Driveways, walkways, and stone terraces',
          'Compacted base built for freeze-thaw cycles',
          'Crisp edging and proper water drainage',
        ],
        image:
          'https://images.unsplash.com/photo-1668911494509-14baf3b42fda?w=900&q=82&auto=format&fit=crop',
        alt: 'Modern residential paved driveway with interlocking stone borders',
        icon: 'pavage',
      },
      {
        id: 'jardins',
        number: '05',
        title: 'Garden Maintenance',
        category: 'exterieur',
        categoryLabel: 'Maintenance',
        description:
          'Lawn mowing, hedge trimming, weeding, and seasonal upkeep for a lush, effortless property all year.',
        highlights: [
          'Regular mowing and clean lawn edging',
          'Hedge, shrub, and flower-bed trimming',
          'Spring opening and fall cleanup',
        ],
        image:
          'https://images.unsplash.com/photo-1458245201577-fc8a130b8829?w=900&q=82&auto=format&fit=crop',
        alt: 'Lawnmower on a freshly maintained green residential lawn',
        icon: 'jardins',
      },
      {
        id: 'piscine',
        number: '06',
        title: 'Pool Cleaning',
        category: 'exterieur',
        categoryLabel: 'Maintenance',
        description:
          'Seasonal opening, vacuuming, basin scrubbing, and ongoing care for crystal-clear water all summer.',
        highlights: [
          'Full pool floor and wall cleaning',
          'Weekly or one-time maintenance visits',
          'Clear, balanced, swim-ready water',
        ],
        image:
          'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=900&q=82&auto=format&fit=crop',
        alt: 'Clean residential swimming pool at golden hour',
        icon: 'piscine',
      },
      {
        id: 'dechets-verts',
        number: '07',
        title: 'Green Waste Removal',
        category: 'exterieur',
        categoryLabel: 'Cleanup',
        description:
          'Fast pickup of fallen leaves, branches, pruning debris, and yard waste for a spotless lot.',
        highlights: [
          'Leaf, branch, and garden debris collection',
          'Post-storm and post-pruning yard clearing',
          'Clean and responsible haul-away',
        ],
        image:
          'https://images.unsplash.com/photo-1635628001185-d4437faea3e1?w=900&q=82&auto=format&fit=crop',
        alt: 'Wheelbarrow filled with autumn leaves during residential yard cleanup',
        icon: 'dechets',
      },
      {
        id: 'paysagement',
        number: '08',
        title: 'Landscaping',
        category: 'exterieur',
        categoryLabel: 'Exterior',
        description:
          'Thoughtfully designed outdoor living spaces combining greenery, patios, retaining walls, and relaxation areas.',
        highlights: [
          'Custom front and backyard outdoor design',
          'Sod installation, plantings, and mulch',
          'Lasting curb appeal and property value',
        ],
        image:
          'https://images.unsplash.com/photo-1755816764913-bd1104a26d78?w=900&q=82&auto=format&fit=crop',
        alt: 'Landscaped residential backyard with wooden pergola, patio, and green lawn',
        icon: 'paysagement',
      },
    ],
    about: {
      eyebrow: 'ABOUT US',
      titleMain: 'Your satisfaction,',
      titleAccent: 'our top priority.',
      lead: '180 SERVICES À DOMICILE supports homeowners across Montreal with residential construction, renovation, and full exterior care.',
      text: 'Our goal is straightforward: save you the hassle of juggling multiple contractors by providing one versatile, dependable partner focused on every finish — from structural builds to seasonal property maintenance.',
      primaryCta: 'Discuss Your Project',
      secondaryCta: 'View Our Projects',
      imageAlt: 'Bright contemporary residential living room interior',
      floatingLabel: 'SERVICE HUB',
      floatingTitle: 'Montreal, Quebec',
      floatingText:
        'Construction, renovation, and complete property care managed through one dedicated contact.',
      commitments: [
        {
          title: 'Versatile Craftsmanship',
          description:
            'From construction to landscaping, one trusted team coordinates your indoor and outdoor work seamlessly.',
          icon: 'layers',
        },
        {
          title: 'Clear, Transparent Quotes',
          description:
            'Every project starts with a free, itemized estimate tailored to your goals and budget.',
          icon: 'shield',
        },
        {
          title: 'Local Care & Attention to Detail',
          description:
            'Based in Montreal, we value punctuality, tidy work areas, and durable, clean finishes.',
          icon: 'pin',
        },
      ],
    },
    process: {
      eyebrow: 'OUR PROCESS',
      titleMain: 'A clear process,',
      titleAccent: 'no surprises',
      subtitle: 'Four straightforward steps to bring your project from idea to completion smoothly.',
      steps: [
        {
          number: '01',
          title: 'Initial Contact',
          description:
            'Share your project needs via our form, phone, or WhatsApp to schedule a quick conversation.',
        },
        {
          number: '02',
          title: 'Assessment & Quote',
          description:
            'We evaluate your scope and provide a free, transparent, no-obligation written estimate.',
        },
        {
          number: '03',
          title: 'Careful Execution',
          description:
            'Work is carried out in an organized, clean manner with full respect for your home and schedule.',
        },
        {
          number: '04',
          title: 'Final Walkthrough',
          description:
            'We review every detail together upon completion to confirm your complete satisfaction.',
        },
      ],
    },
    realisationsSection: {
      eyebrow: 'OUR WORK',
      titleMain: 'Before & After',
      titleAccent: 'Transformations',
      subtitle:
        'Click any project below to open the interactive full-screen before-and-after comparison.',
      filterAll: 'All',
      filterBuilding: 'Building & Interior',
      filterExterior: 'Exterior & Yard',
      beforeBadge: 'BEFORE',
      afterBadge: 'AFTER',
      compareHint: 'Compare',
    },
    realisations: [
      {
        id: 'construction',
        title: 'Construction',
        category: 'batiment',
        categoryLabel: 'Building',
        tagline: 'Solid, lasting structures',
        summary:
          'Complete transformation from structural framing to finished facades, glazing, and exterior cladding.',
        beforeImage: 'images/construction-avant.jpg',
        beforeAlt: 'Residential construction site before finishing',
        afterImage: 'images/construction-apres.jpg',
        afterAlt: 'Completed modern residential home after construction',
        icon: 'construction',
      },
      {
        id: 'renovation',
        title: 'Renovation',
        category: 'batiment',
        categoryLabel: 'Interior',
        tagline: 'Modernized living spaces',
        summary:
          'Full kitchen remodel featuring contemporary cabinetry, a bright central island, and updated surfaces.',
        beforeImage: 'images/renovation-avant.jpg',
        beforeAlt: 'Residential kitchen before renovation',
        afterImage: 'images/renovation-apres.jpg',
        afterAlt: 'Bright modernized kitchen after full renovation',
        icon: 'renovation',
      },
      {
        id: 'peinture',
        title: 'Painting',
        category: 'batiment',
        categoryLabel: 'Finishing',
        tagline: 'Flawless finishes',
        summary:
          'Full wall restoration, smooth plaster preparation, and crisp multi-coat paint application.',
        beforeImage: 'images/peinture-avant.jpg',
        beforeAlt: 'Interior room before wall preparation and painting',
        afterImage: 'images/peinture-apres.jpg',
        afterAlt: 'Freshly painted interior room with clean finish',
        icon: 'peinture',
      },
      {
        id: 'pavage',
        title: 'Paving & Interlock',
        category: 'exterieur',
        categoryLabel: 'Exterior',
        tagline: 'Refined outdoor surfaces',
        summary:
          'Cracked driveway replaced with structured, durable, perfectly leveled dark interlocking stone pavers.',
        beforeImage: 'images/pavage-avant.jpg',
        beforeAlt: 'Cracked residential driveway before paving work',
        afterImage: 'images/pavage-apres.jpg',
        afterAlt: 'Newly paved interlocking stone driveway after completion',
        icon: 'pavage',
      },
      {
        id: 'jardins',
        title: 'Garden Maintenance',
        category: 'exterieur',
        categoryLabel: 'Maintenance',
        tagline: 'Always well-kept greenery',
        summary:
          'Complete hedge trimming, garden bed edging, and lawn restoration for a structured, vibrant yard.',
        beforeImage: 'images/jardins-avant.jpg',
        beforeAlt: 'Overgrown residential garden before maintenance',
        afterImage: 'images/jardins-apres.jpg',
        afterAlt: 'Trimmed and neatly maintained residential garden',
        icon: 'jardins',
      },
      {
        id: 'piscine',
        title: 'Pool Cleaning',
        category: 'exterieur',
        categoryLabel: 'Maintenance',
        tagline: 'Crystal-clear, healthy water',
        summary:
          'Deep pool basin and deck cleaning restoring sparkling, swim-ready water for the warm season.',
        beforeImage: 'images/piscine-avant.jpg',
        beforeAlt: 'Residential swimming pool before seasonal cleaning',
        afterImage: 'images/piscine-apres.jpg',
        afterAlt: 'Clean residential pool with clear blue water after service',
        icon: 'piscine',
      },
      {
        id: 'dechets-verts',
        title: 'Green Waste Removal',
        category: 'exterieur',
        categoryLabel: 'Cleanup',
        tagline: 'Clean and cleared grounds',
        summary:
          'Complete removal of fallen branches, brush, and accumulated yard waste to fully open up the lot.',
        beforeImage: 'images/dechets-verts-avant.jpg',
        beforeAlt: 'Yard filled with green waste before cleanup',
        afterImage: 'images/dechets-verts-apres.jpg',
        afterAlt: 'Clean, cleared outdoor space after green waste removal',
        icon: 'dechets',
      },
      {
        id: 'paysagement',
        title: 'Landscaping',
        category: 'exterieur',
        categoryLabel: 'Exterior',
        tagline: 'Harmonious outdoor living',
        summary:
          'Redesigned outdoor spaces with balanced plantings, clean edging, and tailored finishing touches.',
        beforeImage: 'images/paysagement-avant.jpg',
        beforeAlt: 'Residential yard before landscaping transformation',
        afterImage: 'images/paysagement-apres.jpg',
        afterAlt: 'Transformed backyard and garden after landscaping',
        icon: 'paysagement',
      },
    ],
    lightbox: {
      sliderMode: 'Slider',
      splitMode: 'Side by side',
      sliderCaption: 'Drag the handle left or right to reveal the full transformation.',
      prev: '← Previous',
      next: 'Next →',
      quoteCta: 'Request a quote for this service',
    },
    contactSection: {
      eyebrow: 'CONTACT US',
      titleMain: 'Let’s talk about your',
      titleAccent: 'next project.',
      lead: 'Get a free, no-obligation estimate. Tell us about your project and we will get back to you promptly.',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      addressLabel: 'Address',
      addressStreet: '10275 Romuald-Trudeau St',
      addressCity: 'Montreal, QC H4N 2X5',
      whatsappCta: 'Chat on WhatsApp',
      serviceZone: 'Residential services across Montreal and Greater Montreal',
    },
    form: {
      heading: 'Free Estimate Request',
      subtitle: 'Fill out this 1-minute form to receive a tailored estimate for your project.',
      preselectedPrefix: 'Selected service:',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Mark Tremblay',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'e.g. 514 555-0192',
      emailLabel: 'Email Address',
      emailPlaceholder: 'your@email.com',
      serviceLabel: 'Service Needed',
      servicePlaceholder: 'Select a service…',
      multiServiceOption: 'Multiple Services / Full Project',
      areaLabel: 'Borough or City',
      areaPlaceholder: 'e.g. Ahuntsic, Montreal, Laval…',
      defaultArea: 'Montreal',
      timelineLabel: 'Preferred Timeline',
      timelines: {
        asap: 'As soon as possible',
        month: 'Within the next month',
        quarter: 'Within 1 to 3 months',
        flexible: 'Planning / Flexible',
      },
      messageLabel: 'Project Description',
      messagePlaceholder:
        'Describe the work you have in mind, approximate dimensions, or any helpful details…',
      submitIdle: 'Prepare My Free Estimate',
      submitLoading: 'Sending…',
      privacyNote: 'No obligation. Your details are used solely to respond to your request.',
      errors: {
        name: 'Please enter your full name.',
        phone: 'Please enter a valid phone number (e.g. 514 823-3467).',
        email: 'Please enter a valid email address.',
        service: 'Please select the service you need.',
        message: 'Please briefly describe your project (at least 10 characters).',
        endpointFallback:
          'Automatic submission is temporarily unavailable. You can send your request immediately via WhatsApp or email below.',
      },
      confirm: {
        sentTitle: 'Your request has been sent!',
        sentPrefix: 'Thank you,',
        sentSuffix:
          'Our team has received your project details and will reach out very shortly.',
        readyTitle: 'Your estimate request is ready!',
        readyText:
          'Choose your preferred channel below to send your pre-filled request right away:',
        sendWhatsapp: 'Send via WhatsApp',
        sendEmail: 'Send via Email',
        summaryTitle: 'Your Project Summary',
        copy: 'Copy',
        copied: 'Copied ✓',
        edit: 'Edit My Request',
        reset: 'New Request',
      },
      summaryTemplate: {
        greeting: 'Hello 180 Services à domicile,',
        intro: 'Here is my free estimate request:',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        service: 'Service requested',
        serviceFallback: 'To be specified',
        area: 'Area',
        timeline: 'Timeline',
        descriptionHeading: 'Project description:',
        mailSubjectPrefix: 'Free Estimate Request',
        mailSubjectFallback: 'Residential Project',
      },
      whatsappDirectMessage:
        'Hello 180 Services à domicile, I would like to request a free estimate for a project in Montreal.',
    },
    footer: {
      tagline:
        'Your single residential partner in Montreal for construction, renovation, finishing, and exterior property care.',
      navHeading: 'Navigation',
      servicesHeading: 'Our Services',
      contactHeading: 'Contact Info',
      rights: 'All rights reserved.',
      location: 'Montreal, Quebec',
    },
  },
};

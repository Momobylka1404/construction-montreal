export type Lang = 'fr' | 'en';
export type ServiceCategory = 'all' | 'batiment' | 'exterieur';
export type TimelineKey = 'asap' | 'month' | 'quarter' | 'flexible';
export type BudgetKey = 'undecided' | 'under2k' | 'from2to10k' | 'from10to25k' | 'over25k';
export type ContactMethodKey = 'phone' | 'whatsapp' | 'email';
export type ServiceIconKey =
  | 'construction'
  | 'renovation'
  | 'peinture'
  | 'pavage'
  | 'jardins'
  | 'piscine'
  | 'dechets'
  | 'paysagement';

export interface NavItem {
  id: string;
  number: string;
  label: string;
  subtitle: string;
}

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

export interface TestimonialItem {
  id: string;
  initials: string;
  author: string;
  area: string;
  serviceId: string;
  serviceLabel: string;
  rating: number;
  period: string;
  quote: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PrivacyPolicySection {
  title: string;
  body: string;
  items?: readonly string[];
}

export interface SiteContent {
  meta: {
    htmlLang: string;
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImageAlt: string;
    ogLocale: string;
    ogAlternateLocale: string;
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
    closePrivacy: string;
    viewModeGroup: string;
    sliderAria: string;
    prevProject: string;
    nextProject: string;
    backToTop: string;
    whatsappFab: string;
    langSwitch: string;
    starRating: string;
    removePhoto: string;
  };
  ptr: {
    pull: string;
    release: string;
    refreshing: string;
  };
  pwa: {
    installAria: string;
    installLead: string;
    installAction: string;
    howToInstall: string;
    hideSteps: string;
    dismissInstallAria: string;
    iosSteps: readonly { prefix: string; strong: string; suffix: string }[];
    updateMessage: string;
    updateAction: string;
    updateDismissAria: string;
  };
  topBar: {
    address: string;
    tagline: string;
  };
  brand: {
    name: string;
    city: string;
  };
  nav: readonly NavItem[];
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
  testimonialsSection: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    badgeScore: string;
    badgeLabel: string;
    trustHighlights: readonly string[];
    googleCta: string;
    serviceTagAria: string;
    swipeHint: string;
    items: readonly TestimonialItem[];
  };
  faqSection: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    cardEyebrow: string;
    cardTitle: string;
    cardText: string;
    cardCallCta: string;
    cardWhatsappCta: string;
    cardQuoteCta: string;
    items: readonly FaqItem[];
  };
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
    budgetLabel: string;
    budgetOptional: string;
    budgets: Record<BudgetKey, string>;
    preferredContactLabel: string;
    contactMethods: Record<ContactMethodKey, string>;
    messageLabel: string;
    messagePlaceholder: string;
    photosLabel: string;
    photosOptional: string;
    photosButton: string;
    photosHint: string;
    consentPrefix: string;
    consentLink: string;
    consentSuffix: string;
    honeypotLabel: string;
    submitIdle: string;
    submitLoading: string;
    privacyNote: string;
    errors: {
      name: string;
      phone: string;
      email: string;
      service: string;
      message: string;
      consent: string;
      photos: string;
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
      shareWithPhotos: string;
      photosReminder: string;
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
      preferredContact: string;
      service: string;
      serviceFallback: string;
      area: string;
      timeline: string;
      budget: string;
      photos: string;
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
    areasLabel: string;
    areasList: string;
    altLangLabel: string;
    rights: string;
    privacyLink: string;
    location: string;
  };
  privacyModal: {
    eyebrow: string;
    title: string;
    updatedAt: string;
    intro: string;
    sections: readonly PrivacyPolicySection[];
    officerBoxTitle: string;
    officerRole: string;
    closeCta: string;
  };
}

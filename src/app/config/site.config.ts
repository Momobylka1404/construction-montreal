/**
 * Configuration centralisée — 180 Services à domicile (Montréal).
 *
 * Point unique de maintenance pour :
 * - Coordonnées (téléphone, WhatsApp, courriel, adresse, Google Maps)
 * - Lien d'avis Google Business (`googleReviewsUrl`)
 * - Envoi automatique optionnel du formulaire (`formEndpoint` Formspree ou `web3formsAccessKey`)
 * - Domaine de production (`siteUrl` — modifiable en 1 commande via `npm run set-domain -- https://votredomaine.ca`)
 * - Coordonnées GPS, horaires d'ouverture et villes/arrondissements desservis (SEO Schema.org)
 */
export const SITE_CONFIG = {
  companyName: '180 SERVICES À DOMICILE',
  legalDisplayName: '180 Services à domicile',
  alternateName: '180 Home Services',
  currentYear: 2026,

  // --- URL canonique de production (sans barre oblique finale) ---
  siteUrl: 'https://momobylka1404.github.io/construction-montreal',

  // --- Coordonnées directes ---
  phoneDisplay: '514 823-3467',
  phoneHref: 'tel:+15148233467',
  phoneSchema: '+1-514-823-3467',
  whatsappNumber: '15148233467',
  email: '180servicesenr@gmail.com',

  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=10275+rue+Romuald-Trudeau+Montreal+QC+H4N+2X5',
  /** Optionnel : remplacez par le lien direct de votre fiche Google Business / Google Avis */
  googleReviewsUrl:
    'https://www.google.com/maps/search/?api=1&query=10275+rue+Romuald-Trudeau+Montreal+QC+H4N+2X5',

  // --- Envoi automatique optionnel du formulaire (laissez vide pour WhatsApp + courriel pré-remplis) ---
  /** Optionnel : collez ici votre endpoint Formspree (ex. 'https://formspree.io/f/xxxx') */
  formEndpoint: '',
  /** Optionnel : collez ici votre clé d'accès Web3Forms (ex. 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx') */
  web3formsAccessKey: '',

  // --- Paramètres du formulaire de soumission ---
  quote: {
    maxPhotos: 4,
    maxPhotoBytes: 10 * 1024 * 1024,
    minFormFillMs: 1200,
  },

  // --- Données locales & SEO Schema.org ---
  priceRange: '$$',
  currency: 'CAD',
  address: {
    streetAddress: '10275 rue Romuald-Trudeau',
    addressLocality: 'Montréal',
    addressRegion: 'QC',
    postalCode: 'H4N 2X5',
    addressCountry: 'CA',
  },
  /** Coordonnées approximatives — secteur rue Romuald-Trudeau, Saint-Laurent (Montréal) */
  geo: {
    latitude: 45.5298,
    longitude: -73.6819,
    serviceRadiusMeters: 35000,
  },
  /** Horaires d'ouverture affichés aux moteurs de recherche (modifiables à tout moment) */
  openingHours: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:30',
      closes: '19:00',
    },
    {
      dayOfWeek: ['Saturday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
  areasServed: [
    { type: 'City', name: 'Montréal' },
    { type: 'AdministrativeArea', name: 'Saint-Laurent' },
    { type: 'AdministrativeArea', name: 'Ahuntsic-Cartierville' },
    { type: 'AdministrativeArea', name: 'Rosemont–La Petite-Patrie' },
    { type: 'AdministrativeArea', name: 'Le Plateau-Mont-Royal' },
    { type: 'AdministrativeArea', name: 'Villeray–Saint-Michel–Parc-Extension' },
    { type: 'AdministrativeArea', name: 'Verdun' },
    { type: 'AdministrativeArea', name: 'Côte-des-Neiges–Notre-Dame-de-Grâce' },
    { type: 'AdministrativeArea', name: 'Lachine' },
    { type: 'AdministrativeArea', name: 'Mercier–Hochelaga-Maisonneuve' },
    { type: 'AdministrativeArea', name: 'Anjou' },
    { type: 'City', name: 'Mont-Royal' },
    { type: 'City', name: 'Westmount' },
    { type: 'City', name: 'Laval' },
    { type: 'City', name: 'Longueuil' },
    { type: 'City', name: 'Brossard' },
  ],
} as const;

export type SiteConfig = typeof SITE_CONFIG;

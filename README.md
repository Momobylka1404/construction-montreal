# 180 Services à domicile — Montréal

Site web officiel de **180 Services à domicile** (construction, rénovation, peinture, pavage, aménagement paysager, entretien de jardins et de piscine dans le Grand Montréal).

Construit avec **Angular 22** (composants autonomes `OnPush` + Signals), **pré-rendu statique SSR bilingue** (`/` en `fr-CA` et `/en/` en `en-CA`), **PWA hors ligne** (`@angular/service-worker`), conformité **Loi 25 (Québec)** et déploiement continu sur **GitHub Pages**.

- **URL de production** : <https://momobylka1404.github.io/construction-montreal/>
- **Version anglaise indexée** : <https://momobylka1404.github.io/construction-montreal/en/>

---

## Architecture du projet

```text
src/
├── app/
│   ├── config/
│   │   └── site.config.ts        # Point unique : téléphone, courriel, adresse, GPS, horaires, avis Google, Formspree/Web3Forms, domaine
│   ├── i18n/
│   │   ├── i18n.types.ts         # Interfaces TypeScript du contenu bilingue
│   │   ├── fr.ts                 # Textes français (services, réalisations, avis, FAQ, Loi 25, meta SEO)
│   │   ├── en.ts                 # Textes anglais correspondants
│   │   └── index.ts              # Dictionnaire TRANSLATIONS
│   ├── models/
│   │   └── quote.models.ts       # Modèles et constantes du formulaire de soumission & de la galerie
│   ├── core/
│   │   ├── i18n.service.ts       # Langue réactive, persistance localStorage & synchro des routes / et /en
│   │   ├── seo.ts                # SeoService + générateurs Schema.org (HomeAndConstructionBusiness & FAQPage)
│   │   ├── pwa.service.ts        # Installation PWA (Android/iOS), mise à jour SwUpdate & Pull-to-Refresh
│   │   ├── focus.util.ts         # Accessibilité clavier (piège et restauration du focus, verrouillage scroll)
│   │   └── quote.util.ts         # Formatage téléphone, validation, résumé WhatsApp/courriel & payload API
│   └── components/               # Composants autonomes OnPush par section et modale (@defer)
│       ├── site-header/          # Bannière PWA, barre supérieure, header sticky & tiroir mobile
│       ├── hero-section/         # Accueil — Présentation et message principal (image LCP préchargée)
│       ├── services-section/     # Nos expertises — Tous les services proposés (8 services filtrables)
│       ├── realisations-section/ # Nos réalisations — Galerie de projets et photos Avant / Après
│       ├── about-process-section/# Pourquoi nous choisir — Nos engagements, savoir-faire & méthode en 4 étapes
│       ├── reviews-section/      # Avis clients — Témoignages Grand Montréal & lien Google
│       ├── faq-section/          # FAQ — Questions fréquentes (accordéon accessible)
│       ├── contact-section/      # Contact — Demande de devis (photos, budget, Loi 25) & coordonnées
│       ├── site-footer/          # Pied de page, secteurs desservis & bascule de langue
│       ├── lightbox-modal/       # Comparateur Avant / Après (curseur + côte à côte, chargé en @defer)
│       ├── privacy-modal/        # Politique de confidentialité Loi 25 (chargée en @defer)
│       └── pwa-overlays/         # Pull-to-Refresh, notification de mise à jour PWA & bouton WhatsApp flottant
├── styles/                       # Feuilles de style modulaires (tokens, header/hero, sections, avis/FAQ, contact/footer, modales/PWA, responsive)
└── styles.css                    # Point d'entrée CSS compilé en un seul bundle minifié
public/
├── images/                       # Photos optimisées WebP + couverture Open Graph (100 % locales)
├── icons/                        # Icônes PWA (any, maskable & apple-touch-icon)
├── manifest.webmanifest          # Manifest PWA avec raccourcis d'écran d'accueil
├── robots.txt                    # Directives d'indexation
└── sitemap.xml                   # Sitemap bilingue (hreflang FR/EN) + sitemap images
scripts/
├── build-pages.mjs               # Build SSR + PWA (détection automatique CNAME) + fallback 404.html
├── verify-seo.mjs                # Audit automatisé post-build (HTML FR/EN, canonical, hreflang, JSON-LD, sitemap, PWA)
└── set-domain.mjs                # Bascule en 1 commande vers un domaine personnalisé (ex. https://180services.ca)
```

---

## Commandes principales

```bash
npm ci                 # Installer les dépendances
npm start              # Serveur de développement (http://localhost:4200)
npm run typecheck      # Vérification stricte TypeScript & templates Angular
npm run test:ci        # Exécuter la suite de tests unitaires (Vitest)
npm run build:pages    # Build de production SSR pré-rendu + PWA + 404.html
npm run verify:seo     # Vérifier le SEO bilingue, Schema.org, sitemap et PWA du build
npm run format         # Formater le code avec Prettier
```

---

## Guide de personnalisation rapide

### 1. Coordonnées, horaires & fiche Google Avis
Tout est regroupé dans `src/app/config/site.config.ts` :
- `phoneDisplay`, `phoneHref`, `whatsappNumber`, `email`, `address`, `openingHours`
- `googleReviewsUrl` : collez le lien direct de votre fiche **Google Business Profile** dès qu'elle est active.
- Pour remplacer les témoignages exemples par vos avis réels, modifiez `testimonialsSection.items` dans `src/app/i18n/fr.ts` et `src/app/i18n/en.ts`.

### 2. Activer l'envoi automatique du formulaire (optionnel)
Par défaut, la soumission prépare un message complet prêt à envoyer en un clic par **WhatsApp** ou **courriel** (avec partage natif des photos sur mobile). Pour recevoir aussi les demandes directement sans quitter le site, renseignez dans `src/app/config/site.config.ts` :
- `formEndpoint` : votre URL Formspree (ex. `'https://formspree.io/f/xxxx'`), **ou**
- `web3formsAccessKey` : votre clé gratuite Web3Forms (<https://web3forms.com>).

### 3. Connecter un nom de domaine personnalisé (ex. `180services.ca`)
```bash
npm run set-domain -- https://180services.ca
```
Le script met automatiquement à jour `site.config.ts`, `src/index.html`, `public/robots.txt`, `public/sitemap.xml`, crée `public/CNAME` et affiche les enregistrements DNS (`A` et `CNAME`) à configurer chez votre registraire. Les workflows GitHub Actions détectent automatiquement `public/CNAME` et compilent avec `--base-href /`.

Pour revenir à l'URL GitHub Pages par défaut :
```bash
npm run set-domain -- --github-pages
```

---

## Intégration & déploiement continus (GitHub Actions)

- **`.github/workflows/ci.yml`** *(branches de travail & Pull Requests)* : vérification TypeScript stricte, tests unitaires Vitest, build SSR + PWA avec contrôle des budgets, audit SEO/PWA (`verify:seo`) et audit **Lighthouse CI** sur les routes `/` (FR) et `/en/` (EN).
- **`.github/workflows/deploy.yml`** *(push sur `master`)* : exécute l'ensemble des vérifications qualité et SEO avant de publier automatiquement le site sur GitHub Pages.

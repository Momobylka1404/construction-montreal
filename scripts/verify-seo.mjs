#!/usr/bin/env node
/**
 * Audit automatisé post-build (SEO bilingue, Schema.org, Sitemap, PWA & intégrité des médias).
 * Exécuté en CI sur chaque PR et avant chaque déploiement GitHub Pages.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const browserDir = resolve(root, 'dist/construction-montreal/browser');
const configSource = readFileSync(resolve(root, 'src/app/config/site.config.ts'), 'utf8');
const siteUrlMatch = configSource.match(/siteUrl:\s*'([^']+)'/);

if (!siteUrlMatch) {
  throw new Error('Impossible de lire `siteUrl` dans src/app/config/site.config.ts');
}

const siteUrl = siteUrlMatch[1].replace(/\/+$/, '');
const basePath = new URL(`${siteUrl}/`).pathname; // '/' ou '/construction-montreal/'
const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

check(existsSync(browserDir), `Dossier de build introuvable : ${browserDir}`);
if (errors.length > 0) {
  console.error('✗ Échec de la vérification :\n  - ' + errors.join('\n  - '));
  process.exit(1);
}

// 1. Audit des deux routes statiques pré-rendues (/ FR-CA & /en/ EN-CA)
const expectedRoutes = [
  {
    label: 'FR (/)',
    file: 'index.html',
    htmlLang: 'fr-CA',
    canonical: `${siteUrl}/`,
    ogLocale: 'fr_CA',
    ogAltLocale: 'en_CA',
  },
  {
    label: 'EN (/en/)',
    file: 'en/index.html',
    htmlLang: 'en-CA',
    canonical: `${siteUrl}/en/`,
    ogLocale: 'en_CA',
    ogAltLocale: 'fr_CA',
  },
];

const expectedHreflangs = ['fr-CA', 'fr', 'en-CA', 'en', 'x-default'];

for (const route of expectedRoutes) {
  const fullPath = resolve(browserDir, route.file);
  check(existsSync(fullPath), `[${route.label}] Fichier pré-rendu manquant : ${route.file}`);
  if (!existsSync(fullPath)) continue;

  const html = readFileSync(fullPath, 'utf8');
  const htmlLang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1];
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
  const ogLocale = html.match(/<meta\s+property="og:locale"\s+content="([^"]+)"/)?.[1];
  const ogAlt = html.match(/<meta\s+property="og:locale:alternate"\s+content="([^"]+)"/)?.[1];
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/)?.[1];
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/)?.[1];
  const h1 = html
    .match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  check(
    htmlLang === route.htmlLang,
    `[${route.label}] html[lang] attendu "${route.htmlLang}", reçu "${htmlLang}"`,
  );
  check(Boolean(title && title.length >= 25), `[${route.label}] <title> manquant ou trop court`);
  check(
    Boolean(desc && desc.length >= 80),
    `[${route.label}] meta description manquante ou trop courte`,
  );
  check(
    canonical === route.canonical,
    `[${route.label}] canonical attendu "${route.canonical}", reçu "${canonical}"`,
  );
  check(
    ogLocale === route.ogLocale,
    `[${route.label}] og:locale attendu "${route.ogLocale}", reçu "${ogLocale}"`,
  );
  check(
    ogAlt === route.ogAltLocale,
    `[${route.label}] og:locale:alternate attendu "${route.ogAltLocale}", reçu "${ogAlt}"`,
  );
  check(
    ogUrl === route.canonical,
    `[${route.label}] og:url attendu "${route.canonical}", reçu "${ogUrl}"`,
  );
  check(
    ogImage === `${siteUrl}/images/og-cover.jpg`,
    `[${route.label}] og:image attendu "${siteUrl}/images/og-cover.jpg", reçu "${ogImage}"`,
  );
  check(Boolean(h1 && h1.length >= 10), `[${route.label}] <h1> pré-rendu manquant`);

  const hreflangMap = new Map(
    [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*>/g)].map(
      (m) => [m[1], m[2]],
    ),
  );
  for (const code of expectedHreflangs) {
    const href = hreflangMap.get(code);
    const expectedHref = code.startsWith('en') ? `${siteUrl}/en/` : `${siteUrl}/`;
    check(
      href === expectedHref,
      `[${route.label}] hreflang="${code}" attendu "${expectedHref}", reçu "${href}"`,
    );
  }

  // Validation JSON-LD (HomeAndConstructionBusiness + FAQPage)
  const rawSchemas = [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];
  check(rawSchemas.length === 2, `[${route.label}] 2 blocs JSON-LD attendus, reçu ${rawSchemas.length}`);

  const parsedSchemas = rawSchemas.map((m, idx) => {
    try {
      return JSON.parse(m[1]);
    } catch (err) {
      errors.push(`[${route.label}] JSON-LD #${idx + 1} invalide : ${err.message}`);
      return null;
    }
  }).filter(Boolean);

  const biz = parsedSchemas.find((s) => s['@type'] === 'HomeAndConstructionBusiness');
  const faq = parsedSchemas.find((s) => s['@type'] === 'FAQPage');

  check(Boolean(biz), `[${route.label}] Schéma HomeAndConstructionBusiness manquant`);
  check(
    biz?.inLanguage === route.htmlLang,
    `[${route.label}] HomeAndConstructionBusiness.inLanguage invalide`,
  );
  check(
    Array.isArray(biz?.areaServed) && biz.areaServed.length >= 15,
    `[${route.label}] HomeAndConstructionBusiness.areaServed incomplet`,
  );
  check(Boolean(faq), `[${route.label}] Schéma FAQPage manquant`);
  check(
    faq?.inLanguage === route.htmlLang && Array.isArray(faq?.mainEntity) && faq.mainEntity.length >= 5,
    `[${route.label}] FAQPage invalide ou incomplet`,
  );
}

// 2. Fallback GitHub Pages, robots.txt & sitemap.xml
check(existsSync(resolve(browserDir, '404.html')), 'Fallback SPA 404.html manquant');

const robotsPath = resolve(browserDir, 'robots.txt');
check(existsSync(robotsPath), 'robots.txt manquant');
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8');
  check(
    robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
    `robots.txt ne pointe pas vers ${siteUrl}/sitemap.xml`,
  );
}

const sitemapPath = resolve(browserDir, 'sitemap.xml');
check(existsSync(sitemapPath), 'sitemap.xml manquant');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(locs.includes(`${siteUrl}/`), `sitemap.xml ne contient pas ${siteUrl}/`);
  check(locs.includes(`${siteUrl}/en/`), `sitemap.xml ne contient pas ${siteUrl}/en/`);

  const imageLocs = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
  check(imageLocs.length >= 8, `sitemap.xml contient trop peu d'images (${imageLocs.length})`);
  for (const imgUrl of imageLocs) {
    const rel = imgUrl.replace(`${siteUrl}/`, '');
    check(existsSync(resolve(browserDir, rel)), `Image du sitemap introuvable : ${rel}`);
  }
}

// 3. Manifest PWA & Service Worker ngsw.json
const manifestPath = resolve(browserDir, 'manifest.webmanifest');
check(existsSync(manifestPath), 'manifest.webmanifest manquant');
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  check(Array.isArray(manifest.icons) && manifest.icons.length >= 6, 'Icônes PWA incomplètes');
  for (const icon of manifest.icons ?? []) {
    check(existsSync(resolve(browserDir, icon.src)), `Icône PWA introuvable : ${icon.src}`);
  }
}

const ngswPath = resolve(browserDir, 'ngsw.json');
check(existsSync(ngswPath), 'Configuration Service Worker ngsw.json manquante');
if (existsSync(ngswPath)) {
  const ngsw = JSON.parse(readFileSync(ngswPath, 'utf8'));
  const shellUrls = ngsw.assetGroups?.find((g) => g.name === 'app-shell')?.urls ?? [];
  check(
    shellUrls.includes(`${basePath}index.html`),
    `ngsw.json ne met pas en cache ${basePath}index.html`,
  );
  check(
    shellUrls.includes(`${basePath}en/index.html`),
    `ngsw.json ne met pas en cache ${basePath}en/index.html`,
  );
}

// 4. Aucune dépendance d'image externe (100 % autonome hors ligne)
for (const entry of readdirSync(browserDir)) {
  if (!/\.(html|js|css)$/.test(entry)) continue;
  const text = readFileSync(join(browserDir, entry), 'utf8');
  check(
    !text.includes('images.unsplash.com'),
    `Référence externe images.unsplash.com détectée dans ${entry}`,
  );
}

if (errors.length > 0) {
  console.error(`\n✗ Audit SEO / PWA échoué (${errors.length} erreur(s)) :`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `✓ Audit SEO, Schema.org, Sitemap & PWA réussi pour ${siteUrl} (routes FR + EN, images, manifest et ngsw.json vérifiés).`,
);

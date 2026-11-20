import { Lang } from '../i18n';

/**
 * Configuration centralisée des 7 pages indépendantes
 * FR : / , /expertises, /realisations, /pourquoi-nous, /avis, /faq, /contact
 * EN : /en, /en/expertises, /en/realisations, /en/pourquoi-nous, /en/avis, /en/faq, /en/contact
 * - Chaque page a sa propre adresse (bilingue)
 * - Alias historiques : #services -> expertises, #apropos -> pourquoi-nous
 */
export interface PageDef {
  id: string;
  slug: string;
  pathFr: string;
  pathEn: string;
  legacyAliases?: readonly string[];
}

export const PAGE_DEFS: readonly PageDef[] = [
  {
    id: 'accueil',
    slug: '',
    pathFr: '',
    pathEn: 'en',
    legacyAliases: ['accueil', 'home'],
  },
  {
    id: 'expertises',
    slug: 'expertises',
    pathFr: 'expertises',
    pathEn: 'en/expertises',
    legacyAliases: ['services'],
  },
  {
    id: 'realisations',
    slug: 'realisations',
    pathFr: 'realisations',
    pathEn: 'en/realisations',
    legacyAliases: ['realisations', 'projects'],
  },
  {
    id: 'pourquoi-nous',
    slug: 'pourquoi-nous',
    pathFr: 'pourquoi-nous',
    pathEn: 'en/pourquoi-nous',
    legacyAliases: ['apropos', 'about', 'pourquoi-nous-choisir', 'why-choose-us'],
  },
  {
    id: 'avis',
    slug: 'avis',
    pathFr: 'avis',
    pathEn: 'en/avis',
    legacyAliases: ['avis-clients', 'reviews', 'temoignages'],
  },
  {
    id: 'faq',
    slug: 'faq',
    pathFr: 'faq',
    pathEn: 'en/faq',
    legacyAliases: [],
  },
  {
    id: 'contact',
    slug: 'contact',
    pathFr: 'contact',
    pathEn: 'en/contact',
    legacyAliases: [],
  },
] as const;

export const PAGE_IDS = PAGE_DEFS.map((p) => p.id);

function normalizePath(path: string): string {
  let norm = (path || '').split(/[?#]/)[0].replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
  // Strip GitHub Pages base path prefix if present (construction-montreal)
  if (norm.startsWith('construction-montreal/')) {
    norm = norm.slice('construction-montreal/'.length);
  } else if (norm === 'construction-montreal') {
    norm = '';
  }
  return norm;
}

export function getPageDefById(id: string): PageDef | undefined {
  const norm = id.toLowerCase().trim();
  return PAGE_DEFS.find((p) => p.id === norm || p.legacyAliases?.includes(norm));
}

export function getPagePath(id: string, lang: Lang): string {
  const def = getPageDefById(id);
  if (!def) return lang === 'en' ? 'en' : '';
  return lang === 'en' ? def.pathEn : def.pathFr;
}

export function getPageHref(id: string, lang: Lang, withLeadingSlash = true): string {
  const raw = getPagePath(id, lang);
  if (raw === '') return '/';
  return withLeadingSlash ? `/${raw}` : raw;
}

export function getAlternatePagePath(currentPath: string, targetLang: Lang): string {
  const id = getPageIdFromPath(currentPath) ?? 'accueil';
  return getPagePath(id, targetLang);
}

export function getPageIdFromPath(path: string): string | null {
  const norm = normalizePath(path);
  // Handle root and /en
  if (norm === '' || norm === 'en') return 'accueil';
  // Direct match on FR/EN paths
  for (const def of PAGE_DEFS) {
    if (normalizePath(def.pathFr) === norm || normalizePath(def.pathEn) === norm) {
      return def.id;
    }
  }
  // Fallback: match slug only (without en prefix) for EN
  const slugOnly = norm.startsWith('en/') ? norm.slice(3) : norm;
  for (const def of PAGE_DEFS) {
    if (def.slug && normalizePath(def.slug) === slugOnly) {
      return def.id;
    }
    if (def.legacyAliases?.includes(slugOnly)) {
      return def.id;
    }
  }
  return null;
}

export function detectLangFromPath(path: string): Lang {
  const norm = normalizePath(path);
  if (norm === 'en' || norm.startsWith('en/') || norm.endsWith('/en') || norm.includes('/en/'))
    return 'en';
  // Also check raw path contains /en segment (for full URLs with base)
  const raw = (path || '').toLowerCase();
  if (raw.includes('/en/') || raw.endsWith('/en') || raw.endsWith('/en/')) return 'en';
  return 'fr';
}

export function getCanonicalPathForPage(id: string, lang: Lang, siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const pagePath = getPagePath(id, lang);
  if (pagePath === '') return `${base}/`;
  return `${base}/${pagePath}/`;
}

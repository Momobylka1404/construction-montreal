#!/usr/bin/env node
/**
 * Bascule l'URL canonique du site vers un nom de domaine personnalisé (ou revient à GitHub Pages).
 *
 * Exemples :
 *   npm run set-domain -- https://180services.ca
 *   npm run set-domain -- --github-pages
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_GH_PAGES_URL = 'https://momobylka1404.github.io/construction-montreal';
const arg = process.argv[2]?.trim();

if (!arg) {
  console.error(
    'Usage :\n  npm run set-domain -- https://votredomaine.ca\n  npm run set-domain -- --github-pages',
  );
  process.exit(1);
}

const isReset = arg === '--github-pages';
let nextUrl = DEFAULT_GH_PAGES_URL;
let customHost = '';

if (!isReset) {
  const normalized = /^https?:\/\//i.test(arg) ? arg : `https://${arg}`;
  const parsed = new URL(normalized);
  if (parsed.protocol !== 'https:') {
    console.error('Erreur : veuillez utiliser une URL en https:// (ex. https://180services.ca).');
    process.exit(1);
  }
  const cleanPath = parsed.pathname.replace(/\/+$/, '');
  nextUrl = `${parsed.origin}${cleanPath}`;
  if (!parsed.hostname.endsWith('.github.io')) {
    customHost = parsed.hostname;
  }
}

const root = process.cwd();
const configPath = resolve(root, 'src/app/config/site.config.ts');
const currentUrl = readFileSync(configPath, 'utf8')
  .match(/siteUrl:\s*'([^']+)'/)?.[1]
  ?.replace(/\/+$/, '');

if (!currentUrl) {
  console.error('Impossible de détecter le `siteUrl` actuel dans src/app/config/site.config.ts.');
  process.exit(1);
}

const targets = [
  'src/app/config/site.config.ts',
  'src/index.html',
  'public/robots.txt',
  'public/sitemap.xml',
];

for (const rel of targets) {
  const full = resolve(root, rel);
  const before = readFileSync(full, 'utf8');
  const after = before.replaceAll(currentUrl, nextUrl);
  writeFileSync(full, after);
  console.log(`  ✓ Mis à jour : ${rel}`);
}

const cnamePath = resolve(root, 'public/CNAME');
if (customHost) {
  writeFileSync(cnamePath, `${customHost}\n`);
  console.log(`  ✓ Créé : public/CNAME (${customHost})`);
  console.log(`
Prochaines étapes DNS chez votre registraire de domaine :
  1. Domaine racine (apex, ex. 180services.ca) — ajoutez 4 enregistrements A :
       185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
  2. Sous-domaine www — ajoutez un enregistrement CNAME :
       www  ->  momobylka1404.github.io
  3. Poussez sur master, puis activez « Enforce HTTPS » dans Settings → Pages sur GitHub.`);
} else if (existsSync(cnamePath)) {
  rmSync(cnamePath);
  console.log('  ✓ Supprimé : public/CNAME (retour à GitHub Pages)');
}

console.log(`\n✓ Domaine configuré : ${nextUrl}`);

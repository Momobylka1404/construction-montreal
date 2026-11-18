#!/usr/bin/env node
/**
 * Compile l'application Angular en mode production SSR + PWA pour GitHub Pages.
 * - Détecte automatiquement un domaine personnalisé via `public/CNAME` (`--base-href /`)
 *   ou utilise `/construction-montreal/` pour l'URL GitHub Pages par défaut.
 * - Génère `404.html` à partir de `index.html` pour assurer le fallback SPA sur GitHub Pages.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const cnamePath = resolve(root, 'public/CNAME');
const hasCustomDomain =
  existsSync(cnamePath) && readFileSync(cnamePath, 'utf8').trim().length > 0;

const baseHref = hasCustomDomain ? '/' : '/construction-montreal/';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

console.log(
  `[build:pages] Building production SSR + PWA bundle (baseHref="${baseHref}", customDomain=${hasCustomDomain})...`,
);

execFileSync(npxCmd, ['ng', 'build', '--base-href', baseHref], {
  cwd: root,
  stdio: 'inherit',
});

const browserDir = resolve(root, 'dist/construction-montreal/browser');
const indexHtml = resolve(browserDir, 'index.html');
const fallbackHtml = resolve(browserDir, '404.html');

if (!existsSync(indexHtml)) {
  throw new Error(`[build:pages] Missing generated index.html at ${indexHtml}`);
}

copyFileSync(indexHtml, fallbackHtml);
console.log('[build:pages] Created GitHub Pages SPA fallback: dist/construction-montreal/browser/404.html');

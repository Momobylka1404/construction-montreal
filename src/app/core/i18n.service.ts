import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  detectLangFromPath,
  getAlternatePagePath,
  getPageHref,
  getPageIdFromPath,
} from '../config/pages.config';
import { SITE_CONFIG } from '../config/site.config';
import { Lang, SiteContent, TRANSLATIONS } from '../i18n';
import { isPlainLeftClick } from './focus.util';
import { SeoService } from './seo';

export const LANG_STORAGE_KEY = '180services-lang';

export function detectRouteLang(url: string): Lang {
  const cleanPath = (url || '').split(/[?#]/)[0].replace(/\/+$/, '');
  if (
    cleanPath === '/en' ||
    cleanPath === 'en' ||
    cleanPath.startsWith('/en/') ||
    cleanPath.startsWith('en/') ||
    cleanPath.endsWith('/en') ||
    cleanPath.includes('/en/')
  ) {
    return 'en';
  }
  return 'fr';
}

export function detectRoutePageId(url: string): string {
  const path = (url || '').split(/[?#]/)[0];
  return getPageIdFromPath(path) ?? 'accueil';
}

/**
 * Gère la langue active (`fr` / `en`), les traductions réactives, la persistance
 * `localStorage`, la synchronisation avec les routes multi-pages et le SEO associé.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router, { optional: true });
  private readonly seo = inject(SeoService);

  readonly lang = signal<Lang>('fr');
  readonly activePageId = signal<string>('accueil');
  readonly t = computed<SiteContent>(() => TRANSLATIONS[this.lang()]);

  readonly whatsappDirectUrl = computed(() => {
    const text = encodeURIComponent(this.t().form.whatsappDirectMessage);
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
  });

  constructor() {
    if (this.router) {
      const initialLang = detectLangFromPath(this.router.url);
      const initialPage = detectRoutePageId(this.router.url);
      this.applyLanguage(initialLang, initialPage, false, false);

      const sub = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const lang = detectLangFromPath(event.urlAfterRedirects);
          const pageId = detectRoutePageId(event.urlAfterRedirects);
          this.applyLanguage(lang, pageId, false, false);
        }
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    } else {
      this.seo.sync(this.lang(), this.activePageId());
    }
  }

  /** Lien SEO explorable pour basculer entre FR et EN en conservant la page courante */
  langHref(targetLang: Lang): string {
    if (!isPlatformBrowser(this.platformId) && this.router) {
      const currentPath = this.router.url || '/';
      const alt = getAlternatePagePath(currentPath, targetLang);
      return alt === '' ? '/' : `/${alt}/`;
    }
    if (isPlatformBrowser(this.platformId)) {
      const currentPath = window.location.pathname;
      const alt = getAlternatePagePath(currentPath, targetLang);
      return alt === '' ? '/' : `/${alt}/`;
    }
    // Fallback SSR
    const pageId = this.activePageId();
    const href = getPageHref(pageId, targetLang, true);
    return href.endsWith('/') ? href : `${href}/`;
  }

  /** Lien d'ancre legacy — maintenant redirige vers la page dédiée */
  sectionHref(sectionId: string): string {
    return this.pageHref(sectionId);
  }

  /** Lien vers une page indépendante (FR: /expertises, EN: /en/expertises) */
  pageHref(pageId: string): string {
    return getPageHref(pageId, this.lang(), true);
  }

  restoreSavedLanguage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentRouteLang = detectLangFromPath(this.router?.url || window.location.pathname);
    if (currentRouteLang === 'en') {
      this.applyLanguage('en', detectRoutePageId(window.location.pathname), true, false);
      return;
    }

    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en') {
        this.applyLanguage('en', detectRoutePageId(window.location.pathname), false, true, true);
      }
    } catch {
      // Ignore storage restrictions
    }
  }

  setLanguage(nextLang: Lang): void {
    if (this.lang() === nextLang) return;
    this.applyLanguage(nextLang, this.activePageId(), true, true);
  }

  onSwitchLanguage(event: MouseEvent, nextLang: Lang): void {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    this.setLanguage(nextLang);
  }

  private applyLanguage(
    nextLang: Lang,
    pageId: string,
    persist: boolean,
    syncRoute: boolean,
    replaceUrl = false,
  ): void {
    if (this.lang() !== nextLang) this.lang.set(nextLang);
    if (this.activePageId() !== pageId) this.activePageId.set(pageId);

    this.seo.sync(nextLang, pageId);

    if (!isPlatformBrowser(this.platformId)) return;

    if (persist) {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      } catch {
        // Ignore
      }
    }

    if (syncRoute && this.router) {
      const targetPath = getPageHref(pageId, nextLang, false);
      const targetUrl = targetPath === '' ? '/' : `/${targetPath}`;
      const currentNorm = (this.router.url || '').split(/[?#]/)[0].replace(/\/+$/, '');
      const targetNorm = targetUrl.replace(/\/+$/, '');
      if (currentNorm !== targetNorm) {
        void this.router.navigateByUrl(targetUrl, { replaceUrl });
      }
    }
  }
}

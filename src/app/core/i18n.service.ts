import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SITE_CONFIG } from '../config/site.config';
import { Lang, SiteContent, TRANSLATIONS } from '../i18n';
import { isPlainLeftClick } from './focus.util';
import { SeoService } from './seo';

export const LANG_STORAGE_KEY = '180services-lang';

export function detectRouteLang(url: string): Lang {
  const cleanPath = (url || '').split(/[?#]/)[0].replace(/\/+$/, '');
  return cleanPath === '/en' || cleanPath.endsWith('/en') ? 'en' : 'fr';
}

/**
 * Gère la langue active (`fr` / `en`), les traductions réactives, la persistance
 * `localStorage`, la synchronisation avec les routes `/` et `/en` ainsi que le SEO associé.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router, { optional: true });
  private readonly seo = inject(SeoService);

  readonly lang = signal<Lang>('fr');
  readonly t = computed<SiteContent>(() => TRANSLATIONS[this.lang()]);

  readonly whatsappDirectUrl = computed(() => {
    const text = encodeURIComponent(this.t().form.whatsappDirectMessage);
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
  });

  constructor() {
    if (this.router) {
      const initialLang = detectRouteLang(this.router.url);
      this.applyLanguage(initialLang, false, false);

      const sub = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.applyLanguage(detectRouteLang(event.urlAfterRedirects), false, false);
        }
      });
      this.destroyRef.onDestroy(() => sub.unsubscribe());
    } else {
      this.seo.sync(this.lang());
    }
  }

  /** Lien SEO explorable pour basculer entre la route FR (`./`) et EN (`en/`). */
  langHref(targetLang: Lang): string {
    return targetLang === 'en' ? 'en/' : './';
  }

  /** Lien d'ancrage compatible avec `<base href>` sur `/` comme sur `/en/`. */
  sectionHref(sectionId: string): string {
    return this.lang() === 'en' ? `en/#${sectionId}` : `#${sectionId}`;
  }

  restoreSavedLanguage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentRouteLang = detectRouteLang(this.router?.url || window.location.pathname);

    if (currentRouteLang === 'en') {
      this.applyLanguage('en', true, false);
      return;
    }

    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en') {
        this.applyLanguage('en', false, true, true);
      }
    } catch {
      // Ignore storage restrictions (ex. navigation privée)
    }
  }

  setLanguage(nextLang: Lang): void {
    if (this.lang() === nextLang) {
      return;
    }
    this.applyLanguage(nextLang, true, true);
  }

  onSwitchLanguage(event: MouseEvent, nextLang: Lang): void {
    if (!isPlainLeftClick(event)) {
      return;
    }
    event.preventDefault();
    this.setLanguage(nextLang);
  }

  private applyLanguage(
    nextLang: Lang,
    persist: boolean,
    syncRoute: boolean,
    replaceUrl = false,
  ): void {
    if (this.lang() !== nextLang) {
      this.lang.set(nextLang);
    }

    this.seo.sync(nextLang);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (persist) {
      try {
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      } catch {
        // Ignore storage restrictions
      }
    }

    if (syncRoute && this.router) {
      const targetRoute = nextLang === 'en' ? '/en' : '/';
      if (detectRouteLang(this.router.url) !== nextLang) {
        void this.router.navigateByUrl(targetRoute, { replaceUrl });
      }
    }
  }
}

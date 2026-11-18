import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_CONFIG } from '../config/site.config';
import { Lang, SiteContent, TRANSLATIONS } from '../i18n';

export function getCanonicalUrl(lang: Lang): string {
  return lang === 'en' ? `${SITE_CONFIG.siteUrl}/en/` : `${SITE_CONFIG.siteUrl}/`;
}

export function getOgImageUrl(): string {
  return `${SITE_CONFIG.siteUrl}/images/og-cover.jpg`;
}

export function buildBusinessSchema(lang: Lang, content: SiteContent): Record<string, unknown> {
  const base = SITE_CONFIG.siteUrl;
  const pageUrl = getCanonicalUrl(lang);
  const isFr = lang === 'fr';

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${base}/#organization`,
    name: SITE_CONFIG.legalDisplayName,
    alternateName: SITE_CONFIG.alternateName,
    url: pageUrl,
    inLanguage: content.meta.htmlLang,
    description: content.meta.description,
    logo: `${base}/icons/icon-512x512.png`,
    image: [
      `${base}/images/og-cover.jpg`,
      `${base}/images/hero-montreal.webp`,
      `${base}/images/apropos-residence.webp`,
    ],
    telephone: SITE_CONFIG.phoneSchema,
    email: SITE_CONFIG.email,
    priceRange: SITE_CONFIG.priceRange,
    currenciesAccepted: SITE_CONFIG.currency,
    availableLanguage: ['fr-CA', 'en-CA'],
    hasMap: SITE_CONFIG.mapsUrl,
    address: {
      '@type': 'PostalAddress',
      ...SITE_CONFIG.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE_CONFIG.geo.latitude,
      longitude: SITE_CONFIG.geo.longitude,
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: SITE_CONFIG.geo.latitude,
        longitude: SITE_CONFIG.geo.longitude,
      },
      geoRadius: SITE_CONFIG.geo.serviceRadiusMeters,
    },
    areaServed: SITE_CONFIG.areasServed.map((area) => ({
      '@type': area.type,
      name: area.name,
    })),
    openingHoursSpecification: SITE_CONFIG.openingHours.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.dayOfWeek,
      opens: slot.opens,
      closes: slot.closes,
    })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: SITE_CONFIG.phoneSchema,
      email: SITE_CONFIG.email,
      areaServed: 'CA-QC',
      availableLanguage: ['French', 'English'],
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isFr ? 'Services résidentiels à Montréal' : 'Residential Services in Montreal',
      itemListElement: content.services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.description,
          areaServed: {
            '@type': 'City',
            name: isFr ? 'Montréal' : 'Montreal',
          },
        },
      })),
    },
  };
}

export function buildFaqSchema(lang: Lang, content: SiteContent): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: content.meta.htmlLang,
    mainEntity: content.faqSection.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Synchronise `<html lang>`, `<title>`, meta SEO / Open Graph / Twitter,
 * `<link rel="canonical">` et les schémas JSON-LD lors du pré-rendu SSR comme côté navigateur.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  sync(lang: Lang): void {
    const content = TRANSLATIONS[lang];
    const meta = content.meta;
    const canonicalUrl = getCanonicalUrl(lang);
    const ogImageUrl = getOgImageUrl();

    if (this.doc.documentElement) {
      this.doc.documentElement.lang = meta.htmlLang;
    }

    this.title.setTitle(meta.title);

    this.meta.updateTag({ name: 'description', content: meta.description });
    this.meta.updateTag({ name: 'keywords', content: meta.keywords });
    this.meta.updateTag({ property: 'og:title', content: meta.ogTitle });
    this.meta.updateTag({ property: 'og:description', content: meta.ogDescription });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:locale', content: meta.ogLocale });
    this.meta.updateTag({
      property: 'og:locale:alternate',
      content: meta.ogAlternateLocale,
    });
    this.meta.updateTag({ property: 'og:image', content: ogImageUrl });
    this.meta.updateTag({ property: 'og:image:alt', content: meta.ogImageAlt });
    this.meta.updateTag({ name: 'twitter:title', content: meta.ogTitle });
    this.meta.updateTag({ name: 'twitter:description', content: meta.ogDescription });
    this.meta.updateTag({ name: 'twitter:image', content: ogImageUrl });
    this.meta.updateTag({ name: 'twitter:image:alt', content: meta.ogImageAlt });

    if (this.doc.head) {
      let canonicalEl = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = this.doc.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        this.doc.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);
    }

    const businessScript = this.doc.getElementById('schema-business');
    if (businessScript) {
      businessScript.textContent = JSON.stringify(buildBusinessSchema(lang, content));
    }

    const faqScript = this.doc.getElementById('schema-faq');
    if (faqScript) {
      faqScript.textContent = JSON.stringify(buildFaqSchema(lang, content));
    }
  }
}

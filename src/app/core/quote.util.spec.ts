import { TRANSLATIONS } from '../i18n';
import { QuoteFormData, createInitialQuoteForm } from '../models/quote.models';
import { detectRouteLang } from './i18n.service';
import {
  buildQuoteMailtoUrl,
  buildQuoteSubmissionPayload,
  buildQuoteSummaryText,
  buildQuoteWhatsappUrl,
  formatFileSize,
  formatPhoneNumber,
  resolveServiceLabel,
  validateQuoteForm,
} from './quote.util';

describe('quote.util & route language helpers', () => {
  it('formats North American and international phone numbers cleanly', () => {
    expect(formatPhoneNumber('514')).toBe('514');
    expect(formatPhoneNumber('514823')).toBe('(514) 823');
    expect(formatPhoneNumber('5148233467')).toBe('(514) 823-3467');
    expect(formatPhoneNumber('15148233467')).toBe('+1 (514) 823-3467');
    expect(formatPhoneNumber('+33 6 12 34 56 78')).toBe('+33 6 12 34 56 78');
  });

  it('formats file sizes in localized units (Ko/Mo in FR, KB/MB in EN)', () => {
    expect(formatFileSize(512 * 1024, 'fr')).toBe('512 Ko');
    expect(formatFileSize(512 * 1024, 'en')).toBe('512 KB');
    expect(formatFileSize(2.5 * 1024 * 1024, 'fr')).toBe('2.5 Mo');
    expect(formatFileSize(2.5 * 1024 * 1024, 'en')).toBe('2.5 MB');
  });

  it('validates all required fields including Law 25 consent', () => {
    const empty = createInitialQuoteForm('Montréal');
    expect(validateQuoteForm(empty)).toEqual({
      name: true,
      phone: true,
      email: true,
      serviceId: true,
      message: true,
      consent: true,
    });

    const valid: QuoteFormData = {
      name: 'Sophie Gagnon',
      phone: '(514) 555-0148',
      email: 'sophie@exemple.ca',
      serviceId: 'paysagement',
      area: 'Outremont',
      timeline: 'month',
      budget: 'from10to25k',
      preferredContact: 'email',
      message: 'Réaménagement complet de la cour arrière avec pavé uni.',
      consent: true,
      honeypot: '',
    };
    expect(validateQuoteForm(valid)).toEqual({});
  });

  it('builds localized summaries, WhatsApp/mailto links, and API submission payloads', () => {
    const form: QuoteFormData = {
      name: 'Marc Tremblay',
      phone: '(514) 555-0192',
      email: 'marc@exemple.ca',
      serviceId: 'multi',
      area: 'Rosemont',
      timeline: 'asap',
      budget: 'over25k',
      preferredContact: 'whatsapp',
      message: 'Rénovation de cuisine et peinture intérieure complète.',
      consent: true,
      honeypot: '',
    };

    expect(resolveServiceLabel('multi', TRANSLATIONS.fr)).toBe(
      TRANSLATIONS.fr.form.multiServiceOption,
    );

    const summary = buildQuoteSummaryText(form, [], TRANSLATIONS.fr);
    expect(summary).toContain('Marc Tremblay');
    expect(summary).toContain('WhatsApp');
    expect(summary).toContain('Rosemont');
    expect(buildQuoteWhatsappUrl(summary)).toMatch(/^https:\/\/wa\.me\/15148233467\?text=/);
    expect(buildQuoteMailtoUrl(form, summary, TRANSLATIONS.fr)).toMatch(
      /^mailto:180servicesenr@gmail\.com\?subject=/,
    );

    const payload = buildQuoteSubmissionPayload(form, [], 'en', TRANSLATIONS.en, 'test-key', false);
    expect(payload['access_key']).toBe('test-key');
    expect(payload['language']).toBe('EN');
    expect(payload['law25_consent']).toBe('Oui / Yes');
  });

  it('detects route language accurately across root, /en, hashes, and query strings', () => {
    expect(detectRouteLang('/')).toBe('fr');
    expect(detectRouteLang('/#contact')).toBe('fr');
    expect(detectRouteLang('/en')).toBe('en');
    expect(detectRouteLang('/en/')).toBe('en');
    expect(detectRouteLang('/en/#services')).toBe('en');
    expect(detectRouteLang('/construction-montreal/en/?utm=google')).toBe('en');
  });
});

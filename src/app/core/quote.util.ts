import { SITE_CONFIG } from '../config/site.config';
import { Lang, SiteContent } from '../i18n';
import { AttachedPhoto, QuoteErrorFlags, QuoteFormData } from '../models/quote.models';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formate automatiquement un numéro nord-américain en `(514) 823-3467` ou `+1 (514) 823-3467`
 * tout en préservant les numéros internationaux hors `+1` (ex. `+33 6 12 34 56 78`).
 */
export function formatPhoneNumber(raw: string): string {
  const trimmed = raw.trimStart();

  if (trimmed.startsWith('+') && !/^\+\s*1/.test(trimmed)) {
    return trimmed.replace(/[^\d+\s()-]/g, '').slice(0, 20);
  }

  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) {
    return trimmed.startsWith('+') ? '+' : '';
  }

  if (digits.startsWith('1') && digits.length <= 11) {
    const local = digits.slice(1, 11);
    if (local.length === 0) {
      return '+1';
    }
    if (local.length <= 3) {
      return `+1 ${local}`;
    }
    if (local.length <= 6) {
      return `+1 (${local.slice(0, 3)}) ${local.slice(3)}`;
    }
    return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
  }

  if (digits.length <= 10) {
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  return digits.slice(0, 15);
}

export function formatFileSize(bytes: number, lang: Lang): string {
  const isFr = lang === 'fr';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} ${isFr ? 'Ko' : 'KB'}`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${isFr ? 'Mo' : 'MB'}`;
}

export function resolveServiceLabel(serviceId: string, content: SiteContent): string {
  if (!serviceId) {
    return '';
  }
  if (serviceId === 'multi') {
    return content.form.multiServiceOption;
  }
  return content.services.find((s) => s.id === serviceId)?.title ?? '';
}

export function validateQuoteForm(form: QuoteFormData): QuoteErrorFlags {
  const flags: QuoteErrorFlags = {};

  if (form.name.trim().length < 2) {
    flags.name = true;
  }

  if (form.phone.replace(/\D/g, '').length < 10) {
    flags.phone = true;
  }

  if (!EMAIL_REGEX.test(form.email.trim())) {
    flags.email = true;
  }

  if (!form.serviceId.trim()) {
    flags.serviceId = true;
  }

  if (form.message.trim().length < 10) {
    flags.message = true;
  }

  if (!form.consent) {
    flags.consent = true;
  }

  return flags;
}

export function buildQuoteSummaryText(
  form: QuoteFormData,
  photos: readonly AttachedPhoto[],
  content: SiteContent,
): string {
  const formContent = content.form;
  const tpl = formContent.summaryTemplate;
  const serviceLabel = resolveServiceLabel(form.serviceId, content) || tpl.serviceFallback;

  const lines = [
    tpl.greeting,
    '',
    tpl.intro,
    `• ${tpl.name} : ${form.name.trim()}`,
    `• ${tpl.phone} : ${form.phone.trim()}`,
    `• ${tpl.email} : ${form.email.trim()}`,
    `• ${tpl.preferredContact} : ${formContent.contactMethods[form.preferredContact]}`,
    `• ${tpl.service} : ${serviceLabel}`,
    `• ${tpl.area} : ${form.area.trim() || formContent.defaultArea}`,
    `• ${tpl.timeline} : ${formContent.timelines[form.timeline]}`,
    `• ${tpl.budget} : ${formContent.budgets[form.budget]}`,
  ];

  if (photos.length > 0) {
    lines.push(`• ${tpl.photos} : ${photos.length} (${photos.map((p) => p.name).join(', ')})`);
  }

  lines.push('', tpl.descriptionHeading, form.message.trim());
  return lines.join('\n');
}

export function buildQuoteWhatsappUrl(summaryText: string): string {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(summaryText)}`;
}

export function buildQuoteMailtoUrl(
  form: QuoteFormData,
  summaryText: string,
  content: SiteContent,
): string {
  const tpl = content.form.summaryTemplate;
  const serviceLabel = resolveServiceLabel(form.serviceId, content) || tpl.mailSubjectFallback;
  const subject = encodeURIComponent(
    `${tpl.mailSubjectPrefix} — ${serviceLabel} (${form.name.trim()})`,
  );
  return `mailto:${SITE_CONFIG.email}?subject=${subject}&body=${encodeURIComponent(summaryText)}`;
}

export function buildQuoteSubmissionPayload(
  form: QuoteFormData,
  photos: readonly AttachedPhoto[],
  lang: Lang,
  content: SiteContent,
  web3Key: string,
  hasCustomEndpoint: boolean,
): Record<string, string | boolean> {
  const formContent = content.form;
  const serviceLabel = resolveServiceLabel(form.serviceId, content);

  const payload: Record<string, string | boolean> = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    preferred_contact: formContent.contactMethods[form.preferredContact],
    service: serviceLabel,
    area: form.area.trim() || formContent.defaultArea,
    timeline: formContent.timelines[form.timeline],
    budget: formContent.budgets[form.budget],
    photos: photos.length > 0 ? `${photos.length} (${photos.map((p) => p.name).join(', ')})` : '0',
    message: form.message.trim(),
    law25_consent: 'Oui / Yes',
    language: lang.toUpperCase(),
    source: `Site web ${SITE_CONFIG.legalDisplayName}`,
  };

  if (web3Key && !hasCustomEndpoint) {
    payload['access_key'] = web3Key;
    payload['subject'] =
      `${formContent.summaryTemplate.mailSubjectPrefix} — ${serviceLabel} (${form.name.trim()})`;
    payload['botcheck'] = false;
  }

  return payload;
}

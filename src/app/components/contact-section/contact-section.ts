import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';
import {
  buildQuoteMailtoUrl,
  buildQuoteSubmissionPayload,
  buildQuoteSummaryText,
  buildQuoteWhatsappUrl,
  formatFileSize,
  formatPhoneNumber,
  resolveServiceLabel,
  validateQuoteForm,
} from '../../core/quote.util';
import { ContactMethodKey, Lang, TRANSLATIONS } from '../../i18n';
import {
  AttachedPhoto,
  BUDGET_KEYS,
  CONTACT_METHOD_KEYS,
  QuoteErrorField,
  QuoteErrorFlags,
  QuoteErrorMessages,
  QuoteFormData,
  QuoteStatus,
  ServiceSelectionEvent,
  TIMELINE_KEYS,
  createInitialQuoteForm,
} from '../../models/quote.models';

@Component({
  selector: 'app-contact-section',
  templateUrl: './contact-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ContactSectionComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly config = SITE_CONFIG;

  readonly timelineKeys = TIMELINE_KEYS;
  readonly budgetKeys = BUDGET_KEYS;
  readonly contactMethodKeys = CONTACT_METHOD_KEYS;
  readonly maxQuotePhotos = SITE_CONFIG.quote.maxPhotos;

  readonly selectedService = input<ServiceSelectionEvent | null>(null);
  readonly openPrivacy = output<void>();

  readonly form = signal<QuoteFormData>(createInitialQuoteForm(TRANSLATIONS.fr.form.defaultArea));
  readonly attachedPhotos = signal<AttachedPhoto[]>([]);
  readonly errorFlags = signal<QuoteErrorFlags>({});
  readonly status = signal<QuoteStatus>('idle');
  readonly showFallbackAlert = signal(false);
  readonly copiedSummary = signal(false);
  readonly preselectedServiceId = signal('');

  private formInteractedAt = 0;
  private lastLang: Lang = 'fr';
  private lastSelectionSeq = 0;

  readonly preselectedServiceLabel = computed(() => {
    const id = this.preselectedServiceId();
    return id ? resolveServiceLabel(id, this.i18n.t()) : '';
  });

  readonly errors = computed<QuoteErrorMessages>(() => {
    const flags = this.errorFlags();
    const errs = this.i18n.t().form.errors;
    return {
      name: flags.name ? errs.name : '',
      phone: flags.phone ? errs.phone : '',
      email: flags.email ? errs.email : '',
      serviceId: flags.serviceId ? errs.service : '',
      message: flags.message ? errs.message : '',
      consent: flags.consent ? errs.consent : '',
      photos: flags.photos ? errs.photos : '',
    };
  });

  readonly canNativeSharePhotos = computed(() => {
    const photos = this.attachedPhotos();
    if (!isPlatformBrowser(this.platformId) || photos.length === 0) {
      return false;
    }
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data?: ShareData) => Promise<void>;
    };
    if (typeof nav.share !== 'function' || typeof nav.canShare !== 'function') {
      return false;
    }
    try {
      return nav.canShare({ files: photos.map((p) => p.file) });
    } catch {
      return false;
    }
  });

  readonly summaryText = computed(() =>
    buildQuoteSummaryText(this.form(), this.attachedPhotos(), this.i18n.t()),
  );

  readonly quoteWhatsappUrl = computed(() => buildQuoteWhatsappUrl(this.summaryText()));

  readonly quoteMailtoUrl = computed(() =>
    buildQuoteMailtoUrl(this.form(), this.summaryText(), this.i18n.t()),
  );

  constructor() {
    // Synchronise la ville par défaut (Montréal ↔ Montreal) si non personnalisée par le client
    effect(() => {
      const nextLang = this.i18n.lang();
      if (nextLang === this.lastLang) {
        return;
      }
      const prevDefault = TRANSLATIONS[this.lastLang].form.defaultArea;
      const nextDefault = TRANSLATIONS[nextLang].form.defaultArea;
      this.lastLang = nextLang;

      untracked(() => {
        if (this.form().area.trim() === prevDefault) {
          this.form.update((current) => ({ ...current, area: nextDefault }));
        }
      });
    });

    // Réagit aux demandes de pré-sélection provenant des cartes Services, Réalisations, Avis ou Footer
    effect(() => {
      const selection = this.selectedService();
      if (!selection || selection.seq === this.lastSelectionSeq) {
        return;
      }
      this.lastSelectionSeq = selection.seq;
      untracked(() => this.preselectService(selection.serviceId));
    });

    afterNextRender(() => {
      this.formInteractedAt = Date.now();
    });

    this.destroyRef.onDestroy(() => this.clearAttachedPhotos());
  }

  preselectService(serviceId: string): void {
    this.form.update((current) => ({ ...current, serviceId }));
    this.clearErrorFlag('serviceId');
    this.preselectedServiceId.set(serviceId);
    if (this.status() === 'ready' || this.status() === 'sent') {
      this.status.set('idle');
    }
  }

  updateField(
    field: Exclude<keyof QuoteFormData, 'consent' | 'preferredContact'>,
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    let value = target.value;

    if (field === 'phone') {
      value = formatPhoneNumber(value);
      target.value = value;
    }

    this.form.update((current) => ({ ...current, [field]: value }));

    if (field === 'serviceId') {
      this.preselectedServiceId.set('');
    }

    if (
      field === 'name' ||
      field === 'phone' ||
      field === 'email' ||
      field === 'serviceId' ||
      field === 'message'
    ) {
      this.clearErrorFlag(field);
    }
  }

  setPreferredContact(method: ContactMethodKey): void {
    this.form.update((current) => ({ ...current, preferredContact: method }));
  }

  toggleConsent(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.update((current) => ({ ...current, consent: checked }));
    if (checked) {
      this.clearErrorFlag('consent');
    }
  }

  onPhotosSelected(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    if (files.length === 0) {
      return;
    }

    const current = this.attachedPhotos();
    const remaining = SITE_CONFIG.quote.maxPhotos - current.length;
    let hadInvalid = false;

    if (remaining <= 0) {
      hadInvalid = true;
    } else {
      const additions: AttachedPhoto[] = [];
      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        const withinSize = file.size > 0 && file.size <= SITE_CONFIG.quote.maxPhotoBytes;
        if (!isImage || !withinSize) {
          hadInvalid = true;
          continue;
        }
        if (additions.length >= remaining) {
          hadInvalid = true;
          break;
        }
        additions.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          sizeLabel: formatFileSize(file.size, this.i18n.lang()),
          previewUrl: URL.createObjectURL(file),
          file,
        });
      }

      if (additions.length > 0) {
        this.attachedPhotos.set([...current, ...additions]);
      }
    }

    if (hadInvalid) {
      this.errorFlags.update((errs) => ({ ...errs, photos: true }));
    } else {
      this.clearErrorFlag('photos');
    }

    inputEl.value = '';
  }

  removePhoto(photoId: string): void {
    const target = this.attachedPhotos().find((p) => p.id === photoId);
    if (target && isPlatformBrowser(this.platformId)) {
      URL.revokeObjectURL(target.previewUrl);
    }
    this.attachedPhotos.update((list) => list.filter((p) => p.id !== photoId));
    this.clearErrorFlag('photos');
  }

  async shareQuoteWithPhotos(): Promise<void> {
    if (!this.canNativeSharePhotos()) {
      return;
    }
    const content = this.i18n.t();
    const tpl = content.form.summaryTemplate;
    const serviceLabel =
      resolveServiceLabel(this.form().serviceId, content) || tpl.mailSubjectFallback;
    try {
      await navigator.share({
        title: `${tpl.mailSubjectPrefix} — ${serviceLabel}`,
        text: this.summaryText(),
        files: this.attachedPhotos().map((p) => p.file),
      });
    } catch {
      // Annulation volontaire du partage par l'utilisateur
    }
  }

  async submitQuote(event: Event): Promise<void> {
    event.preventDefault();
    this.showFallbackAlert.set(false);
    this.copiedSummary.set(false);

    const data = this.form();

    // Protection anti-spam silencieuse (honeypot)
    if (data.honeypot.trim().length > 0) {
      this.status.set('sent');
      return;
    }

    const flags = validateQuoteForm(data);
    this.errorFlags.set(flags);
    if (Object.keys(flags).length > 0) {
      return;
    }

    const customEndpoint = SITE_CONFIG.formEndpoint.trim();
    const web3Key = SITE_CONFIG.web3formsAccessKey.trim();
    const endpoint = customEndpoint || (web3Key ? 'https://api.web3forms.com/submit' : '');

    if (endpoint) {
      const filledTooFast =
        this.formInteractedAt > 0 &&
        Date.now() - this.formInteractedAt < SITE_CONFIG.quote.minFormFillMs;
      if (filledTooFast) {
        this.status.set('sent');
        return;
      }

      this.status.set('submitting');
      try {
        const payload = buildQuoteSubmissionPayload(
          data,
          this.attachedPhotos(),
          this.i18n.lang(),
          this.i18n.t(),
          web3Key,
          Boolean(customEndpoint),
        );

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('HTTP error');
        }

        this.status.set('sent');
      } catch {
        this.status.set('ready');
        this.showFallbackAlert.set(true);
      }
      return;
    }

    this.status.set('ready');
  }

  async copySummary(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.summaryText());
      this.copiedSummary.set(true);
    } catch {
      this.copiedSummary.set(false);
    }
  }

  editForm(): void {
    this.status.set('idle');
    this.copiedSummary.set(false);
  }

  resetForm(): void {
    this.clearAttachedPhotos();
    this.form.set(createInitialQuoteForm(this.i18n.t().form.defaultArea));
    this.errorFlags.set({});
    this.status.set('idle');
    this.showFallbackAlert.set(false);
    this.preselectedServiceId.set('');
    this.copiedSummary.set(false);
  }

  private clearErrorFlag(field: QuoteErrorField): void {
    if (!this.errorFlags()[field]) {
      return;
    }
    this.errorFlags.update((errs) => {
      const next = { ...errs };
      delete next[field];
      return next;
    });
  }

  private clearAttachedPhotos(): void {
    const list = this.attachedPhotos();
    if (isPlatformBrowser(this.platformId)) {
      for (const item of list) {
        URL.revokeObjectURL(item.previewUrl);
      }
    }
    if (list.length > 0) {
      this.attachedPhotos.set([]);
    }
  }
}

import { BudgetKey, ContactMethodKey, TimelineKey } from '../i18n';

export interface AttachedPhoto {
  id: string;
  name: string;
  sizeLabel: string;
  previewUrl: string;
  file: File;
}

export interface QuoteFormData {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  area: string;
  timeline: TimelineKey;
  budget: BudgetKey;
  preferredContact: ContactMethodKey;
  message: string;
  consent: boolean;
  honeypot: string;
}

export type QuoteStatus = 'idle' | 'submitting' | 'ready' | 'sent' | 'error';

export type QuoteErrorField =
  'name' | 'phone' | 'email' | 'serviceId' | 'message' | 'consent' | 'photos';

export type QuoteErrorFlags = Partial<Record<QuoteErrorField, boolean>>;

export type QuoteErrorMessages = Record<QuoteErrorField, string>;

export type LightboxMode = 'slider' | 'split';

export interface CategoryCounts {
  all: number;
  batiment: number;
  exterieur: number;
}

export interface ServiceSelectionEvent {
  serviceId: string;
  seq: number;
}

export const STAR_INDICES: readonly number[] = [1, 2, 3, 4, 5];
export const TIMELINE_KEYS: readonly TimelineKey[] = ['asap', 'month', 'quarter', 'flexible'];
export const BUDGET_KEYS: readonly BudgetKey[] = [
  'undecided',
  'under2k',
  'from2to10k',
  'from10to25k',
  'over25k',
];
export const CONTACT_METHOD_KEYS: readonly ContactMethodKey[] = ['phone', 'whatsapp', 'email'];

export function createInitialQuoteForm(defaultArea: string): QuoteFormData {
  return {
    name: '',
    phone: '',
    email: '',
    serviceId: '',
    area: defaultArea,
    timeline: 'asap',
    budget: 'undecided',
    preferredContact: 'phone',
    message: '',
    consent: false,
    honeypot: '',
  };
}

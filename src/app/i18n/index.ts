import { EN_CONTENT } from './en';
import { FR_CONTENT } from './fr';
import { Lang, SiteContent } from './i18n.types';

export * from './i18n.types';
export { FR_CONTENT } from './fr';
export { EN_CONTENT } from './en';

export const TRANSLATIONS: Record<Lang, SiteContent> = {
  fr: FR_CONTENT,
  en: EN_CONTENT,
};

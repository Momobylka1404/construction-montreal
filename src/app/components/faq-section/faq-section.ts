import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-faq-section',
  templateUrl: './faq-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class FaqSectionComponent {
  readonly i18n = inject(I18nService);
  readonly config = SITE_CONFIG;

  readonly openFaqId = signal<string | null>('soumission-gratuite');

  toggle(faqId: string): void {
    this.openFaqId.update((current) => (current === faqId ? null : faqId));
  }
}

import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';
import { STAR_INDICES } from '../../models/quote.models';

@Component({
  selector: 'app-reviews-section',
  templateUrl: './reviews-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ReviewsSectionComponent {
  readonly i18n = inject(I18nService);
  readonly config = SITE_CONFIG;
  readonly starIndices = STAR_INDICES;

  readonly requestQuote = output<string>();
}

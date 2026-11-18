import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';
import { PwaService } from '../../core/pwa.service';

@Component({
  selector: 'app-pwa-overlays',
  templateUrl: './pwa-overlays.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class PwaOverlaysComponent {
  readonly i18n = inject(I18nService);
  readonly pwa = inject(PwaService);
  readonly config = SITE_CONFIG;

  readonly showBackToTop = input.required<boolean>();
  readonly scrollToTop = output<void>();
}

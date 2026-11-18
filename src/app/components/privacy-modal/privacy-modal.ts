import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  output,
} from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class PrivacyModalComponent {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly i18n = inject(I18nService);
  readonly config = SITE_CONFIG;

  readonly close = output<void>();

  constructor() {
    afterNextRender(() => {
      const firstBtn =
        this.hostEl.nativeElement.querySelector<HTMLElement>('button:not([disabled])');
      firstBtn?.focus({ preventScroll: true });
    });
  }
}

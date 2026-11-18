import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { RealisationItem } from '../../i18n';
import { LightboxMode } from '../../models/quote.models';

@Component({
  selector: 'app-lightbox-modal',
  templateUrl: './lightbox-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class LightboxModalComponent {
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly i18n = inject(I18nService);

  readonly project = input.required<RealisationItem>();
  readonly index = input.required<number>();
  readonly total = input.required<number>();

  readonly close = output<void>();
  readonly navigate = output<number>();
  readonly requestQuote = output<string>();

  readonly mode = signal<LightboxMode>('slider');
  readonly sliderPosition = signal(50);

  private lastProjectId = '';

  constructor() {
    effect(() => {
      const id = this.project().id;
      if (id !== this.lastProjectId) {
        this.lastProjectId = id;
        untracked(() => this.sliderPosition.set(50));
      }
    });

    afterNextRender(() => {
      const firstBtn =
        this.hostEl.nativeElement.querySelector<HTMLElement>('button:not([disabled])');
      firstBtn?.focus({ preventScroll: true });
    });
  }

  setMode(next: LightboxMode): void {
    this.mode.set(next);
  }

  onSliderInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) {
      this.sliderPosition.set(Math.min(100, Math.max(0, value)));
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ContactSectionComponent } from '../components/contact-section/contact-section';
import { QuotePrefillService } from '../core/quote-prefill.service';
import { ServiceSelectionEvent } from '../models/quote.models';

@Component({
  selector: 'app-contact-page',
  imports: [ContactSectionComponent],
  template: `
    <app-contact-section [selectedService]="selectedService()" (openPrivacy)="onOpenPrivacy()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ContactPageComponent {
  private readonly quotePrefill = inject(QuotePrefillService);

  readonly selectedService = signal<ServiceSelectionEvent | null>(null);
  private seq = 0;

  readonly contactSection = viewChild(ContactSectionComponent);

  constructor() {
    afterNextRender(() => {
      const pending = this.quotePrefill.consume();
      if (pending) {
        this.selectedService.set({ serviceId: pending, seq: ++this.seq });
      }
    });

    effect(() => {
      const peek = this.quotePrefill.peek();
      if (peek) {
        const consumed = this.quotePrefill.consume();
        if (consumed) {
          this.selectedService.set({ serviceId: consumed, seq: ++this.seq });
        }
      }
    });
  }

  onOpenPrivacy(): void {
    // Relay to App layout via global event
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('openPrivacy'));
    }
  }
}

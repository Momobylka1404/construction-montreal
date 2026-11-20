import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReviewsSectionComponent } from '../components/reviews-section/reviews-section';
import { QuotePrefillService } from '../core/quote-prefill.service';

@Component({
  selector: 'app-avis-page',
  imports: [ReviewsSectionComponent],
  template: `<app-reviews-section (requestQuote)="onRequestQuote($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class AvisPageComponent {
  private readonly quotePrefill = inject(QuotePrefillService);

  onRequestQuote(serviceId: string): void {
    this.quotePrefill.requestQuote(serviceId);
  }
}

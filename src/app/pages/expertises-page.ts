import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ServicesSectionComponent } from '../components/services-section/services-section';
import { QuotePrefillService } from '../core/quote-prefill.service';

@Component({
  selector: 'app-expertises-page',
  imports: [ServicesSectionComponent],
  template: `<app-services-section (requestQuote)="onRequestQuote($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ExpertisesPageComponent {
  private readonly quotePrefill = inject(QuotePrefillService);

  onRequestQuote(serviceId: string): void {
    this.quotePrefill.requestQuote(serviceId);
  }
}

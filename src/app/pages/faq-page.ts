import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FaqSectionComponent } from '../components/faq-section/faq-section';

@Component({
  selector: 'app-faq-page',
  imports: [FaqSectionComponent],
  template: `<app-faq-section />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class FaqPageComponent {}

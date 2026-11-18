import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { ServiceCategory } from '../../i18n';
import { CategoryCounts } from '../../models/quote.models';

@Component({
  selector: 'app-services-section',
  templateUrl: './services-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class ServicesSectionComponent {
  readonly i18n = inject(I18nService);

  readonly filter = signal<ServiceCategory>('all');
  readonly requestQuote = output<string>();

  readonly counts = computed<CategoryCounts>(() => {
    const all = this.i18n.t().services;
    return {
      all: all.length,
      batiment: all.filter((item) => item.category === 'batiment').length,
      exterieur: all.filter((item) => item.category === 'exterieur').length,
    };
  });

  readonly filteredServices = computed(() => {
    const all = this.i18n.t().services;
    const active = this.filter();
    return active === 'all' ? all : all.filter((item) => item.category === active);
  });

  setFilter(next: ServiceCategory): void {
    this.filter.set(next);
  }
}

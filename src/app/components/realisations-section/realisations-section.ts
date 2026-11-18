import { ChangeDetectionStrategy, Component, computed, inject, model, output } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { ServiceCategory } from '../../i18n';
import { CategoryCounts } from '../../models/quote.models';

@Component({
  selector: 'app-realisations-section',
  templateUrl: './realisations-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class RealisationsSectionComponent {
  readonly i18n = inject(I18nService);

  readonly filter = model<ServiceCategory>('all');
  readonly openProject = output<string>();

  readonly counts = computed<CategoryCounts>(() => {
    const all = this.i18n.t().realisations;
    return {
      all: all.length,
      batiment: all.filter((item) => item.category === 'batiment').length,
      exterieur: all.filter((item) => item.category === 'exterieur').length,
    };
  });

  readonly filteredRealisations = computed(() => {
    const all = this.i18n.t().realisations;
    const active = this.filter();
    return active === 'all' ? all : all.filter((item) => item.category === active);
  });

  setFilter(next: ServiceCategory): void {
    this.filter.set(next);
  }
}

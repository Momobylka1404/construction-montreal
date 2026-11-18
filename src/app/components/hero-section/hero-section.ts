import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class HeroSectionComponent {
  readonly i18n = inject(I18nService);
  readonly config = SITE_CONFIG;

  readonly navigateSection = output<{ event: MouseEvent; sectionId: string }>();

  onSectionClick(event: MouseEvent, sectionId: string): void {
    this.navigateSection.emit({ event, sectionId });
  }
}

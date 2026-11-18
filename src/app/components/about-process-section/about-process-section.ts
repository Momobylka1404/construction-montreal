import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-about-process-section',
  templateUrl: './about-process-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class AboutProcessSectionComponent {
  readonly i18n = inject(I18nService);
  readonly marqueeGroups: readonly boolean[] = [false, true];

  readonly navigateSection = output<{ event: MouseEvent; sectionId: string }>();

  onSectionClick(event: MouseEvent, sectionId: string): void {
    this.navigateSection.emit({ event, sectionId });
  }
}

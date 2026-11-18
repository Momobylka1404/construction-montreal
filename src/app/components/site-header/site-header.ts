import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';
import { PwaService } from '../../core/pwa.service';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SiteHeaderComponent {
  readonly i18n = inject(I18nService);
  readonly pwa = inject(PwaService);
  readonly config = SITE_CONFIG;

  readonly isScrolled = input.required<boolean>();
  readonly activeSection = input.required<string>();
  readonly mobileMenuOpen = input.required<boolean>();

  readonly toggleMenu = output<void>();
  readonly closeMenu = output<void>();
  readonly navigateSection = output<{ event: MouseEvent; sectionId: string }>();

  onSectionClick(event: MouseEvent, sectionId: string): void {
    this.navigateSection.emit({ event, sectionId });
  }
}

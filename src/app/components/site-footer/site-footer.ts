import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { SITE_CONFIG } from '../../config/site.config';
import { I18nService } from '../../core/i18n.service';
import { Lang } from '../../i18n';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class SiteFooterComponent {
  readonly i18n = inject(I18nService);
  readonly config = SITE_CONFIG;

  readonly alternateLang = computed<Lang>(() => (this.i18n.lang() === 'fr' ? 'en' : 'fr'));
  readonly alternateHrefLang = computed(() => (this.alternateLang() === 'en' ? 'en-CA' : 'fr-CA'));

  readonly navigateSection = output<{ event: MouseEvent; sectionId: string }>();
  readonly requestQuote = output<string>();
  readonly openPrivacy = output<void>();

  onSectionClick(event: MouseEvent, sectionId: string): void {
    this.navigateSection.emit({ event, sectionId });
  }
}

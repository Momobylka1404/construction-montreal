import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeroSectionComponent } from '../components/hero-section/hero-section';
import { getPagePath } from '../config/pages.config';
import { isPlainLeftClick } from '../core/focus.util';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-home-page',
  imports: [HeroSectionComponent],
  template: `<app-hero-section (navigateSection)="onNavigate($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  onNavigate(payload: { event: MouseEvent; sectionId: string }): void {
    if (!isPlainLeftClick(payload.event)) return;
    payload.event.preventDefault();
    const target = getPagePath(payload.sectionId, this.i18n.lang());
    const url = target === '' ? '/' : `/${target}`;
    void this.router.navigateByUrl(url);
  }
}

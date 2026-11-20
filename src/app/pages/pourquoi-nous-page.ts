import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AboutProcessSectionComponent } from '../components/about-process-section/about-process-section';
import { getPagePath } from '../config/pages.config';
import { isPlainLeftClick } from '../core/focus.util';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-pourquoi-nous-page',
  imports: [AboutProcessSectionComponent],
  template: `<app-about-process-section (navigateSection)="onNavigate($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class PourquoiNousPageComponent {
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

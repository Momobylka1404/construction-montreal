import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * Composant d'ancrage léger permettant au routeur Angular SSR de pré-générer
 * distinctement la route française (`/`) et la route anglaise (`/en`).
 */
@Component({
  selector: 'app-lang-route-anchor',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangRouteAnchorComponent {}

export const routes: Routes = [
  {
    path: '',
    component: LangRouteAnchorComponent,
    data: { lang: 'fr' },
  },
  {
    path: 'en',
    component: LangRouteAnchorComponent,
    data: { lang: 'en' },
  },
  {
    path: 'fr',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

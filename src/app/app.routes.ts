import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * Composant d'ancrage léger permettant au routeur Angular SSR de pré-générer
 * distinctement chaque route FR / EN.
 */
@Component({
  selector: 'app-lang-route-anchor',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangRouteAnchorComponent {}

export const routes: Routes = [
  // --- FR : 7 pages indépendantes ---
  {
    path: '',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePageComponent),
    data: { lang: 'fr', pageId: 'accueil' },
  },
  {
    path: 'expertises',
    loadComponent: () => import('./pages/expertises-page').then((m) => m.ExpertisesPageComponent),
    data: { lang: 'fr', pageId: 'expertises' },
  },
  {
    path: 'realisations',
    loadComponent: () =>
      import('./pages/realisations-page').then((m) => m.RealisationsPageComponent),
    data: { lang: 'fr', pageId: 'realisations' },
  },
  {
    path: 'pourquoi-nous',
    loadComponent: () =>
      import('./pages/pourquoi-nous-page').then((m) => m.PourquoiNousPageComponent),
    data: { lang: 'fr', pageId: 'pourquoi-nous' },
  },
  {
    path: 'avis',
    loadComponent: () => import('./pages/avis-page').then((m) => m.AvisPageComponent),
    data: { lang: 'fr', pageId: 'avis' },
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq-page').then((m) => m.FaqPageComponent),
    data: { lang: 'fr', pageId: 'faq' },
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact-page').then((m) => m.ContactPageComponent),
    data: { lang: 'fr', pageId: 'contact' },
  },

  // --- EN : 7 pages indépendantes ---
  {
    path: 'en',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePageComponent),
    data: { lang: 'en', pageId: 'accueil' },
  },
  {
    path: 'en/expertises',
    loadComponent: () => import('./pages/expertises-page').then((m) => m.ExpertisesPageComponent),
    data: { lang: 'en', pageId: 'expertises' },
  },
  {
    path: 'en/realisations',
    loadComponent: () =>
      import('./pages/realisations-page').then((m) => m.RealisationsPageComponent),
    data: { lang: 'en', pageId: 'realisations' },
  },
  {
    path: 'en/pourquoi-nous',
    loadComponent: () =>
      import('./pages/pourquoi-nous-page').then((m) => m.PourquoiNousPageComponent),
    data: { lang: 'en', pageId: 'pourquoi-nous' },
  },
  {
    path: 'en/avis',
    loadComponent: () => import('./pages/avis-page').then((m) => m.AvisPageComponent),
    data: { lang: 'en', pageId: 'avis' },
  },
  {
    path: 'en/faq',
    loadComponent: () => import('./pages/faq-page').then((m) => m.FaqPageComponent),
    data: { lang: 'en', pageId: 'faq' },
  },
  {
    path: 'en/contact',
    loadComponent: () => import('./pages/contact-page').then((m) => m.ContactPageComponent),
    data: { lang: 'en', pageId: 'contact' },
  },

  // --- Alias & redirections historiques ---
  {
    path: 'fr',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'services',
    redirectTo: 'expertises',
  },
  {
    path: 'apropos',
    redirectTo: 'pourquoi-nous',
  },
  {
    path: 'en/services',
    redirectTo: 'en/expertises',
  },
  {
    path: 'en/apropos',
    redirectTo: 'en/pourquoi-nous',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

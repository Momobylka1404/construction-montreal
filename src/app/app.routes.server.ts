import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'expertises', renderMode: RenderMode.Prerender },
  { path: 'realisations', renderMode: RenderMode.Prerender },
  { path: 'pourquoi-nous', renderMode: RenderMode.Prerender },
  { path: 'avis', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'en', renderMode: RenderMode.Prerender },
  { path: 'en/expertises', renderMode: RenderMode.Prerender },
  { path: 'en/realisations', renderMode: RenderMode.Prerender },
  { path: 'en/pourquoi-nous', renderMode: RenderMode.Prerender },
  { path: 'en/avis', renderMode: RenderMode.Prerender },
  { path: 'en/faq', renderMode: RenderMode.Prerender },
  { path: 'en/contact', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];

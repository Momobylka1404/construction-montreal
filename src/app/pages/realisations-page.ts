import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LightboxModalComponent } from '../components/lightbox-modal/lightbox-modal';
import { RealisationsSectionComponent } from '../components/realisations-section/realisations-section';
import { QuotePrefillService } from '../core/quote-prefill.service';
import { I18nService } from '../core/i18n.service';
import { ServiceCategory } from '../i18n';

@Component({
  selector: 'app-realisations-page',
  imports: [RealisationsSectionComponent, LightboxModalComponent],
  template: `
    <app-realisations-section [(filter)]="realisationFilter" (openProject)="openLightbox($event)" />
    @if (activeRealisation(); as project) {
      <app-lightbox-modal
        [project]="project"
        [index]="activeRealisationIndex()"
        [total]="lightboxRealisations().length"
        (close)="closeLightbox()"
        (navigate)="navigateLightbox($event)"
        (requestQuote)="onRequestQuote($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents',
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class RealisationsPageComponent {
  private readonly i18n = inject(I18nService);
  private readonly quotePrefill = inject(QuotePrefillService);

  readonly realisationFilter = signal<ServiceCategory>('all');
  readonly activeRealisationId = signal<string | null>(null);
  private bodyOverflowPrev = '';

  readonly lightboxRealisations = computed(() => {
    const all = this.i18n.t().realisations;
    const filter = this.realisationFilter();
    const filtered = filter === 'all' ? all : all.filter((item) => item.category === filter);
    const id = this.activeRealisationId();
    return id && filtered.some((item) => item.id === id) ? filtered : all;
  });

  readonly activeRealisation = computed(() => {
    const id = this.activeRealisationId();
    return id ? (this.i18n.t().realisations.find((item) => item.id === id) ?? null) : null;
  });

  readonly activeRealisationIndex = computed(() => {
    const id = this.activeRealisationId();
    return id ? this.lightboxRealisations().findIndex((item) => item.id === id) : -1;
  });

  openLightbox(realisationId: string): void {
    this.activeRealisationId.set(realisationId);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox(): void {
    this.activeRealisationId.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  navigateLightbox(delta: number): void {
    const items = this.lightboxRealisations();
    const currentIndex = this.activeRealisationIndex();
    if (currentIndex === -1 || items.length === 0) return;
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    this.activeRealisationId.set(items[nextIndex].id);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.activeRealisationId() === null) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowRight') this.navigateLightbox(1);
    else if (event.key === 'ArrowLeft') this.navigateLightbox(-1);
    else if (event.key === 'Home') {
      const first = this.lightboxRealisations()[0];
      if (first) this.activeRealisationId.set(first.id);
    } else if (event.key === 'End') {
      const items = this.lightboxRealisations();
      const last = items[items.length - 1];
      if (last) this.activeRealisationId.set(last.id);
    }
  }

  onRequestQuote(serviceId: string): void {
    this.closeLightbox();
    this.quotePrefill.requestQuote(serviceId);
  }
}

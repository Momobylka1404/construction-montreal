import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getPagePath } from '../config/pages.config';
import { I18nService } from './i18n.service';

@Injectable({ providedIn: 'root' })
export class QuotePrefillService {
  private readonly router = inject(Router, { optional: true });
  private readonly i18n = inject(I18nService, { optional: true });

  readonly selectedServiceId = signal<string | null>(null);

  requestQuote(serviceId: string): void {
    this.selectedServiceId.set(serviceId);
    if (this.router && this.i18n) {
      const lang = this.i18n.lang();
      const target = getPagePath('contact', lang);
      const url = target === '' ? '/' : `/${target}`;
      void this.router.navigateByUrl(url);
    }
  }

  consume(): string | null {
    const id = this.selectedServiceId();
    if (id) this.selectedServiceId.set(null);
    return id;
  }

  peek(): string | null {
    return this.selectedServiceId();
  }
}

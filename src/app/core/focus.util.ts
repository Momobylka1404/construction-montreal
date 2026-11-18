const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function isPlainLeftClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Utilitaire d'accessibilité clavier (WCAG 2.1 AA) pour les modales et tiroirs :
 * mémorisation de l'élément déclencheur, focus initial, piège de focus `Tab` / `Shift+Tab`,
 * restauration du focus à la fermeture et verrouillage du défilement du `body`.
 */
export class FocusController {
  private lastFocused: HTMLElement | null = null;

  constructor(
    private readonly doc: Document,
    private readonly isBrowser: boolean,
  ) {}

  captureOrigin(): void {
    if (!this.isBrowser) {
      return;
    }
    const active = this.doc.activeElement;
    if (active instanceof HTMLElement && active !== this.doc.body) {
      this.lastFocused = active;
    }
  }

  clearOrigin(): void {
    this.lastFocused = null;
  }

  focusFirstInside(selector: string): void {
    if (!this.isBrowser) {
      return;
    }
    requestAnimationFrame(() => {
      const container = this.doc.querySelector<HTMLElement>(selector);
      const target = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      target?.focus({ preventScroll: true });
    });
  }

  restore(): void {
    if (!this.isBrowser) {
      return;
    }
    const origin = this.lastFocused;
    this.lastFocused = null;
    if (origin && this.doc.contains(origin)) {
      requestAnimationFrame(() => origin.focus({ preventScroll: true }));
    }
  }

  trapTab(event: KeyboardEvent, containerSelector: string): void {
    if (!this.isBrowser) {
      return;
    }
    const container = this.doc.querySelector<HTMLElement>(containerSelector);
    if (!container) {
      return;
    }
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null || el === this.doc.activeElement);

    if (focusables.length === 0) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.doc.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!active || active === first || !container.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (!active || active === last || !container.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  setBodyScrollLocked(locked: boolean): void {
    if (!this.isBrowser || !this.doc.body) {
      return;
    }
    this.doc.body.style.overflow = locked ? 'hidden' : '';
  }
}

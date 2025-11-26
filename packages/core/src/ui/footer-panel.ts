/**
 * Footer Panel - displays footer text and copyright
 */

import type { FooterConfig } from '../types';
import type { LayoutComponent } from './layout-manager';

/** Footer panel options */
export interface FooterPanelOptions {
  config?: FooterConfig;
}

/**
 * Footer Panel component
 */
export class FooterPanel implements LayoutComponent {
  private config: FooterConfig;
  private element: HTMLElement | null = null;

  constructor(options: FooterPanelOptions = {}) {
    this.config = options.config || {};
  }

  /**
   * Render the footer panel
   */
  render(): HTMLElement {
    this.element = document.createElement('footer');
    this.element.className = 'animflow-footer';

    const style = this.config.style || {};
    const background = style.background || '#212529';
    const color = style.color || '#adb5bd';
    const padding = style.padding || '16px 24px';

    this.element.style.cssText = `
      background: ${background};
      color: ${color};
      padding: ${padding};
      text-align: center;
      font-size: 14px;
    `;

    if (this.config.text) {
      this.element.textContent = this.config.text;
    }

    return this.element;
  }

  /**
   * Update the footer text
   */
  setText(text: string): void {
    this.config.text = text;
    if (this.element) {
      this.element.textContent = text;
    }
  }

  /**
   * Update the footer config
   */
  update(data: unknown): void {
    if (data && typeof data === 'object' && 'footer' in data) {
      this.config = (data as { footer: FooterConfig }).footer;
      if (this.element && this.element.parentNode) {
        const parent = this.element.parentNode;
        const newElement = this.render();
        parent.replaceChild(newElement, this.element);
      }
    }
  }

  /**
   * Destroy the footer panel
   */
  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

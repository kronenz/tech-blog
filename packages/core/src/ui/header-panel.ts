/**
 * Header Panel - displays title and subtitle
 */

import type { HeaderConfig } from '../types';
import type { LayoutComponent } from './layout-manager';

/** Header panel options */
export interface HeaderPanelOptions {
  config?: HeaderConfig;
}

/**
 * Header Panel component
 */
export class HeaderPanel implements LayoutComponent {
  private config: HeaderConfig;
  private element: HTMLElement | null = null;

  constructor(options: HeaderPanelOptions = {}) {
    this.config = options.config || {};
  }

  /**
   * Render the header panel
   */
  render(): HTMLElement {
    this.element = document.createElement('header');
    this.element.className = 'animflow-header';

    const style = this.config.style || {};
    const background = style.background || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    const color = style.color || '#ffffff';
    const padding = style.padding || '30px';

    this.element.style.cssText = `
      background: ${background};
      color: ${color};
      padding: ${padding};
      text-align: center;
    `;

    // Title
    if (this.config.title) {
      const title = document.createElement('h1');
      title.className = 'animflow-header-title';
      title.textContent = this.config.title;
      title.style.cssText = `
        font-size: 2em;
        font-weight: 700;
        margin: 0 0 8px 0;
        line-height: 1.2;
      `;
      this.element.appendChild(title);
    }

    // Subtitle
    if (this.config.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'animflow-header-subtitle';
      subtitle.textContent = this.config.subtitle;
      subtitle.style.cssText = `
        font-size: 1.1em;
        margin: 0;
        opacity: 0.9;
      `;
      this.element.appendChild(subtitle);
    }

    return this.element;
  }

  /**
   * Update the header config
   */
  update(data: unknown): void {
    if (data && typeof data === 'object' && 'header' in data) {
      this.config = (data as { header: HeaderConfig }).header;
      // Re-render if element exists
      if (this.element && this.element.parentNode) {
        const parent = this.element.parentNode;
        const newElement = this.render();
        parent.replaceChild(newElement, this.element);
      }
    }
  }

  /**
   * Destroy the header panel
   */
  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

/**
 * Legend Panel - displays color legend for diagram elements
 */

import type { LegendConfig, LegendItemConfig } from '../types';
import type { LayoutComponent } from './layout-manager';

/** Legend panel options */
export interface LegendPanelOptions {
  config?: LegendConfig;
}

/**
 * Legend Panel component
 */
export class LegendPanel implements LayoutComponent {
  private config: LegendConfig;
  private element: HTMLElement | null = null;

  constructor(options: LegendPanelOptions = {}) {
    this.config = options.config || {};
  }

  /**
   * Render the legend panel
   */
  render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'animflow-legend';
    this.element.style.cssText = `
      padding: 16px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    `;

    // Title
    if (this.config.title) {
      const title = document.createElement('div');
      title.className = 'animflow-legend-title';
      title.textContent = this.config.title;
      title.style.cssText = `
        font-weight: 700;
        font-size: 1em;
        margin-bottom: 12px;
        color: #212529;
      `;
      this.element.appendChild(title);
    }

    // Items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'animflow-legend-items';
    itemsContainer.style.cssText = `
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    `;

    // Render items
    const items = this.config.items || [];
    items.forEach((item) => {
      const itemElement = this.createLegendItem(item);
      itemsContainer.appendChild(itemElement);
    });

    this.element.appendChild(itemsContainer);

    return this.element;
  }

  /**
   * Create a legend item element
   */
  private createLegendItem(item: LegendItemConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'animflow-legend-item';
    element.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #495057;
    `;

    // Color indicator
    const colorBox = document.createElement('div');
    colorBox.className = 'animflow-legend-color';
    colorBox.style.cssText = `
      width: 28px;
      height: 4px;
      border-radius: 2px;
      background: ${item.color};
    `;
    element.appendChild(colorBox);

    // Label
    const label = document.createElement('span');
    label.className = 'animflow-legend-label';
    label.textContent = item.label;
    element.appendChild(label);

    return element;
  }

  /**
   * Add a legend item dynamically
   */
  addItem(item: LegendItemConfig): void {
    if (!this.config.items) {
      this.config.items = [];
    }
    this.config.items.push(item);

    // Update DOM if rendered
    if (this.element) {
      const itemsContainer = this.element.querySelector('.animflow-legend-items');
      if (itemsContainer) {
        const itemElement = this.createLegendItem(item);
        itemsContainer.appendChild(itemElement);
      }
    }
  }

  /**
   * Remove a legend item by label
   */
  removeItem(label: string): void {
    if (this.config.items) {
      this.config.items = this.config.items.filter((item) => item.label !== label);

      // Update DOM if rendered - re-render for simplicity
      if (this.element && this.element.parentNode) {
        const parent = this.element.parentNode;
        const newElement = this.render();
        parent.replaceChild(newElement, this.element);
      }
    }
  }

  /**
   * Update the legend config
   */
  update(data: unknown): void {
    if (data && typeof data === 'object' && 'legend' in data) {
      this.config = (data as { legend: LegendConfig }).legend;
      if (this.element && this.element.parentNode) {
        const parent = this.element.parentNode;
        const newElement = this.render();
        parent.replaceChild(newElement, this.element);
      }
    }
  }

  /**
   * Destroy the legend panel
   */
  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

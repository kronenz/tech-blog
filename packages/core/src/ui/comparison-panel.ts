/**
 * Comparison Panel - displays performance comparison between presets
 */

import type { ComparisonConfig, ComparisonItemConfig } from '../types';
import type { LayoutComponent } from './layout-manager';

/** Comparison panel options */
export interface ComparisonPanelOptions {
  config?: ComparisonConfig;
  activePresetId?: string;
  onPresetClick?: (presetId: string) => void;
}

/**
 * Comparison Panel component - displays performance comparison cards
 */
export class ComparisonPanel implements LayoutComponent {
  private config: ComparisonConfig;
  private activePresetId: string | null;
  private onPresetClick?: (presetId: string) => void;
  private element: HTMLElement | null = null;
  private cards: Map<string, HTMLElement> = new Map();

  constructor(options: ComparisonPanelOptions = {}) {
    this.config = options.config || {};
    this.activePresetId = options.activePresetId || null;
    this.onPresetClick = options.onPresetClick;
  }

  /**
   * Set the active preset
   */
  setActivePreset(presetId: string | null): void {
    this.activePresetId = presetId;
    this.updateActiveState();
  }

  /**
   * Get the active preset ID
   */
  getActivePreset(): string | null {
    return this.activePresetId;
  }

  /**
   * Render the comparison panel
   */
  render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'animflow-comparison';
    this.element.style.cssText = `
      padding: 20px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    `;

    // Title
    const title = this.config.title || 'Performance Comparison';
    const titleEl = document.createElement('h3');
    titleEl.className = 'animflow-comparison-title';
    titleEl.textContent = title;
    titleEl.style.cssText = `
      font-size: 1em;
      font-weight: 700;
      color: #212529;
      margin: 0 0 16px 0;
    `;
    this.element.appendChild(titleEl);

    // Cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'animflow-comparison-cards';
    cardsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    `;

    // Render cards
    const items = this.config.items || [];
    items.forEach((item) => {
      const card = this.createCard(item);
      this.cards.set(item.preset, card);
      cardsContainer.appendChild(card);
    });

    this.element.appendChild(cardsContainer);
    this.updateActiveState();

    return this.element;
  }

  /**
   * Create a comparison card
   */
  private createCard(item: ComparisonItemConfig): HTMLElement {
    const card = document.createElement('div');
    card.className = 'animflow-comparison-card';
    card.setAttribute('data-preset-id', item.preset);

    const color = item.color || '#6c757d';
    const isActive = item.preset === this.activePresetId;

    card.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid ${color};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      ${isActive ? 'transform: scale(1.02); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);' : ''}
    `;

    // Value (large text)
    const valueEl = document.createElement('div');
    valueEl.className = 'animflow-comparison-value';
    valueEl.textContent = item.value;
    valueEl.style.cssText = `
      font-size: 1.5em;
      font-weight: 700;
      color: ${color};
      margin-bottom: 4px;
    `;
    card.appendChild(valueEl);

    // Label
    const labelEl = document.createElement('div');
    labelEl.className = 'animflow-comparison-label';
    labelEl.textContent = item.label;
    labelEl.style.cssText = `
      font-size: 14px;
      font-weight: 600;
      color: #212529;
      margin-bottom: 4px;
    `;
    card.appendChild(labelEl);

    // Description
    if (item.description) {
      const descEl = document.createElement('div');
      descEl.className = 'animflow-comparison-desc';
      descEl.textContent = item.description;
      descEl.style.cssText = `
        font-size: 12px;
        color: #6c757d;
        line-height: 1.4;
      `;
      card.appendChild(descEl);
    }

    // Hover effects
    card.addEventListener('mouseenter', () => {
      if (item.preset !== this.activePresetId) {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (item.preset !== this.activePresetId) {
        card.style.transform = 'none';
        card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
      }
    });

    // Click handler
    card.addEventListener('click', () => {
      if (this.onPresetClick) {
        this.onPresetClick(item.preset);
      }
    });

    // Focus for accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', String(isActive));

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onPresetClick) {
          this.onPresetClick(item.preset);
        }
      }
    });

    card.addEventListener('focus', () => {
      card.style.outline = '3px solid rgba(30, 60, 114, 0.3)';
      card.style.outlineOffset = '2px';
    });

    card.addEventListener('blur', () => {
      card.style.outline = 'none';
    });

    return card;
  }

  /**
   * Update active state styling
   */
  private updateActiveState(): void {
    const items = this.config.items || [];

    this.cards.forEach((card, presetId) => {
      const isActive = presetId === this.activePresetId;
      const item = items.find((i) => i.preset === presetId);
      const color = item?.color || '#6c757d';

      card.setAttribute('aria-pressed', String(isActive));

      if (isActive) {
        card.style.transform = 'scale(1.02)';
        card.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
        card.style.borderLeftColor = color;
      } else {
        card.style.transform = 'none';
        card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
      }
    });
  }

  /**
   * Update the comparison config
   */
  update(data: unknown): void {
    if (data && typeof data === 'object') {
      if ('comparison' in data) {
        this.config = (data as { comparison: ComparisonConfig }).comparison;
        if (this.element && this.element.parentNode) {
          const parent = this.element.parentNode;
          this.cards.clear();
          const newElement = this.render();
          parent.replaceChild(newElement, this.element);
        }
      }
      if ('activePresetId' in data) {
        this.setActivePreset((data as { activePresetId: string | null }).activePresetId);
      }
    }
  }

  /**
   * Destroy the comparison panel
   */
  destroy(): void {
    this.cards.clear();
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

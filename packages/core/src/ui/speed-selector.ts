/**
 * Speed Selector UI Component
 */

import { DEFAULT_SPEED_OPTIONS, DEFAULT_SPEED } from '../types';
import type { SpeedOption } from '../types';

/** Speed selector options */
export interface SpeedSelectorOptions {
  container: HTMLElement;
  options?: SpeedOption[];
  defaultSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

/**
 * Speed Selector component for controlling animation speed
 */
export class SpeedSelector {
  private container: HTMLElement;
  private element: HTMLElement;
  private options: SpeedSelectorOptions;
  private speedOptions: SpeedOption[];
  private currentSpeed: number;

  constructor(options: SpeedSelectorOptions) {
    this.options = options;
    this.container = options.container;
    this.speedOptions = options.options || DEFAULT_SPEED_OPTIONS;
    this.currentSpeed = options.defaultSpeed || DEFAULT_SPEED;

    this.element = document.createElement('div');
    this.element.className = 'animflow-speed-selector';

    this.render();
    this.addStyles();
  }

  /**
   * Render the speed selector
   */
  private render(): void {
    const optionsHtml = this.speedOptions
      .map(
        (opt) => `
        <option value="${opt.value}" ${opt.value === this.currentSpeed ? 'selected' : ''}>
          ${opt.label}
        </option>
      `
      )
      .join('');

    this.element.innerHTML = `
      <label class="animflow-speed-label">
        <span>Speed:</span>
        <select class="animflow-speed-select">
          ${optionsHtml}
        </select>
      </label>
    `;

    this.bindEvents();
    this.container.appendChild(this.element);
  }

  /**
   * Bind change events
   */
  private bindEvents(): void {
    const select = this.element.querySelector('.animflow-speed-select') as HTMLSelectElement;
    select?.addEventListener('change', () => {
      const value = parseFloat(select.value);
      if (!isNaN(value)) {
        this.setSpeed(value);
      }
    });
  }

  /**
   * Set the current speed
   */
  setSpeed(speed: number): void {
    this.currentSpeed = speed;

    // Update select element
    const select = this.element.querySelector('.animflow-speed-select') as HTMLSelectElement;
    if (select) {
      select.value = String(speed);
    }

    this.options.onSpeedChange?.(speed);
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    const styleId = 'animflow-speed-selector-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .animflow-speed-selector {
        display: flex;
        align-items: center;
      }

      .animflow-speed-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
      }

      .animflow-speed-select {
        padding: 6px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: white;
        font-size: 13px;
        color: #334155;
        cursor: pointer;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .animflow-speed-select:hover {
        border-color: #cbd5e1;
      }

      .animflow-speed-select:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.element.remove();
  }
}

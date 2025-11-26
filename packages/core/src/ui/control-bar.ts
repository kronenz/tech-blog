/**
 * Control Bar UI Component
 */

import type { SpeedOption } from '../types';
import { DEFAULT_SPEED_OPTIONS, DEFAULT_SPEED } from '../types';

/** Control bar options */
export interface ControlBarOptions {
  container: HTMLElement;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onScenarioSelect?: (scenarioId: string) => void;
  onSpeedChange?: (speed: number) => void;
  /** Show speed selector */
  showSpeed?: boolean;
  /** Speed options */
  speedOptions?: SpeedOption[];
  /** Default speed */
  defaultSpeed?: number;
  /** Enable keyboard shortcuts */
  enableKeyboard?: boolean;
}

/**
 * Control Bar for AnimFlow diagrams
 */
export class ControlBar {
  private container: HTMLElement;
  private element: HTMLElement;
  private options: ControlBarOptions;
  private isRunning = false;
  private currentSpeed: number;
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: ControlBarOptions) {
    this.options = options;
    this.container = options.container;
    this.currentSpeed = options.defaultSpeed || DEFAULT_SPEED;
    this.element = document.createElement('div');
    this.element.className = 'animflow-controls';
    this.render();

    // Setup keyboard shortcuts if enabled
    if (options.enableKeyboard !== false) {
      this.setupKeyboardShortcuts();
    }
  }

  /**
   * Render the control bar
   */
  private render(): void {
    const speedOptions = this.options.speedOptions || DEFAULT_SPEED_OPTIONS;
    const showSpeed = this.options.showSpeed !== false;

    const speedHtml = showSpeed
      ? `
        <div class="animflow-speed-control">
          <label class="animflow-speed-label">
            <span>Speed:</span>
            <select class="animflow-speed-select">
              ${speedOptions.map((opt) => `
                <option value="${opt.value}" ${opt.value === this.currentSpeed ? 'selected' : ''}>
                  ${opt.label}
                </option>
              `).join('')}
            </select>
          </label>
        </div>
      `
      : '';

    this.element.innerHTML = `
      <div class="animflow-controls-inner">
        <button class="animflow-btn animflow-btn-start" type="button" title="Space to toggle">
          <span class="animflow-btn-icon">▶</span>
          <span class="animflow-btn-text">Start</span>
        </button>
        <button class="animflow-btn animflow-btn-reset" type="button" title="R to reset">
          <span class="animflow-btn-icon">↺</span>
          <span class="animflow-btn-text">Reset</span>
        </button>
        ${speedHtml}
      </div>
    `;

    // Add styles
    this.addStyles();

    // Bind events
    this.bindEvents();

    // Add to container
    this.container.appendChild(this.element);
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    this.keyboardHandler = (e: KeyboardEvent) => {
      // Don't handle if focus is in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (this.isRunning) {
            this.options.onStop?.();
            this.options.onReset?.();
          } else {
            this.options.onStart?.();
          }
          break;

        case 'KeyR':
          e.preventDefault();
          this.options.onReset?.();
          break;
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    const styleId = 'animflow-controls-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .animflow-controls {
        display: flex;
        justify-content: center;
        padding: 12px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
      }

      .animflow-controls-inner {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .animflow-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .animflow-btn:hover {
        transform: translateY(-1px);
      }

      .animflow-btn:active {
        transform: translateY(0);
      }

      .animflow-btn-start {
        background: #4f46e5;
        color: white;
      }

      .animflow-btn-start:hover {
        background: #4338ca;
      }

      .animflow-btn-start.running {
        background: #dc2626;
      }

      .animflow-btn-start.running:hover {
        background: #b91c1c;
      }

      .animflow-btn-reset {
        background: #e5e7eb;
        color: #374151;
      }

      .animflow-btn-reset:hover {
        background: #d1d5db;
      }

      .animflow-btn-icon {
        font-size: 12px;
      }

      .animflow-speed-control {
        margin-left: 12px;
        padding-left: 12px;
        border-left: 1px solid #e5e7eb;
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
   * Bind event handlers
   */
  private bindEvents(): void {
    const startBtn = this.element.querySelector('.animflow-btn-start');
    const resetBtn = this.element.querySelector('.animflow-btn-reset');
    const speedSelect = this.element.querySelector('.animflow-speed-select') as HTMLSelectElement | null;

    startBtn?.addEventListener('click', () => {
      if (this.isRunning) {
        // Stop is handled by onStop or onReset
        this.options.onStop?.();
        this.options.onReset?.();
      } else {
        this.options.onStart?.();
      }
    });

    resetBtn?.addEventListener('click', () => {
      this.options.onReset?.();
    });

    speedSelect?.addEventListener('change', () => {
      const value = parseFloat(speedSelect.value);
      if (!isNaN(value)) {
        this.currentSpeed = value;
        this.options.onSpeedChange?.(value);
      }
    });
  }

  /**
   * Update running state
   */
  setRunning(running: boolean): void {
    this.isRunning = running;
    const startBtn = this.element.querySelector('.animflow-btn-start');
    const textSpan = startBtn?.querySelector('.animflow-btn-text');
    const iconSpan = startBtn?.querySelector('.animflow-btn-icon');

    if (running) {
      startBtn?.classList.add('running');
      if (textSpan) textSpan.textContent = 'Stop';
      if (iconSpan) iconSpan.textContent = '■';
    } else {
      startBtn?.classList.remove('running');
      if (textSpan) textSpan.textContent = 'Start';
      if (iconSpan) iconSpan.textContent = '▶';
    }
  }

  /**
   * Set the speed value
   */
  setSpeed(speed: number): void {
    this.currentSpeed = speed;
    const speedSelect = this.element.querySelector('.animflow-speed-select') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.value = String(speed);
    }
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Destroy the control bar
   */
  destroy(): void {
    // Remove keyboard handler
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    this.element.remove();
  }
}

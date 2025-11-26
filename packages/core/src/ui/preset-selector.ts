/**
 * Preset Selector - button group UI for selecting scenario presets
 */

import type { LayoutComponent } from './layout-manager';

/** Preset info for display */
export interface PresetInfo {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

/** Preset selector options */
export interface PresetSelectorOptions {
  presets?: PresetInfo[];
  activePresetId?: string;
  onPresetChange?: (presetId: string) => void;
}

/**
 * Preset Selector component - button group for scenario presets
 */
export class PresetSelector implements LayoutComponent {
  private presets: PresetInfo[];
  private activePresetId: string | null;
  private onPresetChange?: (presetId: string) => void;
  private element: HTMLElement | null = null;
  private buttons: Map<string, HTMLButtonElement> = new Map();

  constructor(options: PresetSelectorOptions = {}) {
    this.presets = options.presets || [];
    this.activePresetId = options.activePresetId || null;
    this.onPresetChange = options.onPresetChange;
  }

  /**
   * Set the presets
   */
  setPresets(presets: PresetInfo[]): void {
    this.presets = presets;
    if (this.element) {
      this.rebuildButtons();
    }
  }

  /**
   * Set the active preset
   */
  setActivePreset(presetId: string | null): void {
    this.activePresetId = presetId;
    this.updateButtonStyles();
  }

  /**
   * Get the active preset ID
   */
  getActivePreset(): string | null {
    return this.activePresetId;
  }

  /**
   * Render the preset selector
   */
  render(): HTMLElement {
    this.element = document.createElement('div');
    this.element.className = 'animflow-preset-selector';
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', 'Scenario preset selection');
    this.element.style.cssText = `
      display: flex;
      gap: 0;
      padding: 16px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    `;

    this.rebuildButtons();
    return this.element;
  }

  /**
   * Rebuild all buttons
   */
  private rebuildButtons(): void {
    if (!this.element) return;

    // Clear existing buttons
    this.element.innerHTML = '';
    this.buttons.clear();

    // Create button group container
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'animflow-preset-buttons';
    buttonGroup.style.cssText = `
      display: flex;
      gap: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;

    // Create buttons
    this.presets.forEach((preset, index) => {
      const button = this.createButton(preset, index);
      this.buttons.set(preset.id, button);
      buttonGroup.appendChild(button);
    });

    this.element.appendChild(buttonGroup);
    this.updateButtonStyles();
  }

  /**
   * Create a preset button
   */
  private createButton(preset: PresetInfo, index: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'animflow-preset-button';
    button.setAttribute('data-preset-id', preset.id);
    button.setAttribute('aria-pressed', String(preset.id === this.activePresetId));
    button.setAttribute('type', 'button');

    if (preset.description) {
      button.setAttribute('title', preset.description);
    }

    // Base styles
    button.style.cssText = `
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      outline: none;
      white-space: nowrap;
    `;

    // Add border radius for first/last buttons
    if (index === 0) {
      button.style.borderTopLeftRadius = '8px';
      button.style.borderBottomLeftRadius = '8px';
    }
    if (index === this.presets.length - 1) {
      button.style.borderTopRightRadius = '8px';
      button.style.borderBottomRightRadius = '8px';
    }

    button.textContent = preset.name;

    // Event handlers
    button.addEventListener('click', () => {
      this.handleButtonClick(preset.id);
    });

    button.addEventListener('mouseenter', () => {
      if (preset.id !== this.activePresetId) {
        button.style.background = '#e9ecef';
      }
    });

    button.addEventListener('mouseleave', () => {
      this.applyButtonStyle(button, preset.id === this.activePresetId);
    });

    // Focus styles for accessibility
    button.addEventListener('focus', () => {
      button.style.boxShadow = '0 0 0 3px rgba(30, 60, 114, 0.3)';
    });

    button.addEventListener('blur', () => {
      button.style.boxShadow = 'none';
    });

    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      this.handleKeyDown(e, preset.id);
    });

    return button;
  }

  /**
   * Handle button click
   */
  private handleButtonClick(presetId: string): void {
    if (presetId === this.activePresetId) return;

    this.activePresetId = presetId;
    this.updateButtonStyles();

    if (this.onPresetChange) {
      this.onPresetChange(presetId);
    }
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(e: KeyboardEvent, currentId: string): void {
    const presetIds = this.presets.map((p) => p.id);
    const currentIndex = presetIds.indexOf(currentId);

    let nextIndex = -1;

    switch (e.key) {
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : presetIds.length - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex < presetIds.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = presetIds.length - 1;
        break;
    }

    if (nextIndex >= 0) {
      e.preventDefault();
      const nextButton = this.buttons.get(presetIds[nextIndex]);
      nextButton?.focus();
    }
  }

  /**
   * Update button styles based on active state
   */
  private updateButtonStyles(): void {
    this.buttons.forEach((button, presetId) => {
      const isActive = presetId === this.activePresetId;
      button.setAttribute('aria-pressed', String(isActive));
      this.applyButtonStyle(button, isActive);
    });
  }

  /**
   * Apply style to a button
   */
  private applyButtonStyle(button: HTMLButtonElement, isActive: boolean): void {
    if (isActive) {
      button.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
      button.style.color = '#ffffff';
    } else {
      button.style.background = '#ffffff';
      button.style.color = '#495057';
    }
  }

  /**
   * Update the component
   */
  update(data: unknown): void {
    if (data && typeof data === 'object') {
      if ('presets' in data) {
        this.setPresets((data as { presets: PresetInfo[] }).presets);
      }
      if ('activePresetId' in data) {
        this.setActivePreset((data as { activePresetId: string }).activePresetId);
      }
    }
  }

  /**
   * Destroy the preset selector
   */
  destroy(): void {
    this.buttons.clear();
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

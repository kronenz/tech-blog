/**
 * Layout Manager - manages the overall UI layout structure
 */

import type { LayoutConfig, SlotPosition } from '../types';

/** Component interface for layout slots */
export interface LayoutComponent {
  render(): HTMLElement;
  destroy(): void;
  update?(data: unknown): void;
}

/** Layout manager options */
export interface LayoutManagerOptions {
  container: HTMLElement;
  config?: LayoutConfig;
}

/**
 * Layout Manager - creates and manages the DOM structure for AnimFlow UI
 */
export class LayoutManager {
  private container: HTMLElement;
  private config: LayoutConfig;
  private slots: Map<SlotPosition, HTMLElement> = new Map();
  private components: Map<SlotPosition, LayoutComponent[]> = new Map();
  private rootElement: HTMLElement | null = null;

  constructor(options: LayoutManagerOptions) {
    this.container = options.container;
    this.config = options.config || {};
    this.initialize();
  }

  /**
   * Initialize the layout structure
   */
  private initialize(): void {
    // Create root wrapper
    this.rootElement = document.createElement('div');
    this.rootElement.className = 'animflow-layout';
    this.rootElement.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    `;

    // Create slots
    this.createSlot('top');
    this.createSlot('main');
    this.createSlot('bottom');

    // Append to container
    this.container.appendChild(this.rootElement);
  }

  /**
   * Create a slot element
   */
  private createSlot(position: SlotPosition): void {
    const slot = document.createElement('div');
    slot.className = `animflow-slot animflow-slot-${position}`;

    switch (position) {
      case 'top':
        slot.style.cssText = `
          display: flex;
          flex-direction: column;
        `;
        break;
      case 'main':
        slot.style.cssText = `
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        `;
        break;
      case 'bottom':
        slot.style.cssText = `
          display: flex;
          flex-direction: column;
        `;
        break;
    }

    this.slots.set(position, slot);
    this.components.set(position, []);
    this.rootElement?.appendChild(slot);
  }

  /**
   * Get a slot element by position
   */
  getSlot(position: SlotPosition): HTMLElement | undefined {
    return this.slots.get(position);
  }

  /**
   * Register a component to a slot
   */
  registerComponent(slot: SlotPosition, component: LayoutComponent): void {
    const slotElement = this.slots.get(slot);
    if (!slotElement) {
      console.warn(`Slot '${slot}' not found`);
      return;
    }

    const components = this.components.get(slot) || [];
    components.push(component);
    this.components.set(slot, components);

    // Render component and append to slot
    const element = component.render();
    slotElement.appendChild(element);
  }

  /**
   * Append a raw element to a slot
   */
  appendToSlot(slot: SlotPosition, element: HTMLElement): void {
    const slotElement = this.slots.get(slot);
    if (!slotElement) {
      console.warn(`Slot '${slot}' not found`);
      return;
    }
    slotElement.appendChild(element);
  }

  /**
   * Get the main slot for canvas rendering
   */
  getMainSlot(): HTMLElement | undefined {
    return this.slots.get('main');
  }

  /**
   * Get the layout config
   */
  getConfig(): LayoutConfig {
    return this.config;
  }

  /**
   * Update the layout config
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Render all registered components
   */
  render(): void {
    // Components are rendered when registered
    // This method can be used for re-rendering if needed
    this.components.forEach((components) => {
      components.forEach((component) => {
        if (component.update) {
          component.update(this.config);
        }
      });
    });
  }

  /**
   * Destroy the layout and all components
   */
  destroy(): void {
    // Destroy all components
    this.components.forEach((components) => {
      components.forEach((component) => {
        component.destroy();
      });
    });
    this.components.clear();

    // Remove slots
    this.slots.forEach((slot) => {
      slot.remove();
    });
    this.slots.clear();

    // Remove root element
    if (this.rootElement) {
      this.rootElement.remove();
      this.rootElement = null;
    }
  }
}

/**
 * Section model class
 */

import type { SectionConfig, SectionStyle, Bounds } from '../types';

/**
 * Section model representing a canvas region
 */
export class Section {
  public readonly id: string;
  public readonly label?: string;
  public readonly bounds: Bounds;
  public readonly style: SectionStyle;

  constructor(config: SectionConfig) {
    this.id = config.id;
    this.label = config.label;
    this.bounds = { ...config.bounds };
    this.style = {
      background: config.style?.background,
      labelColor: config.style?.labelColor,
    };
  }

  /** Get full bounds including x and width (full canvas width) */
  getFullBounds(canvasWidth: number): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: 0,
      y: this.bounds.y,
      width: canvasWidth,
      height: this.bounds.height,
    };
  }

  /** Create from config */
  static fromConfig(config: SectionConfig): Section {
    return new Section(config);
  }
}

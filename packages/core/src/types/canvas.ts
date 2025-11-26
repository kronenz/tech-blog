/**
 * Canvas-related types for AnimFlow DSL
 */

/** 2D point coordinates */
export interface Point {
  x: number;
  y: number;
}

/** Bounds for section regions */
export interface Bounds {
  y: number;
  height: number;
}

/** Canvas configuration */
export interface CanvasConfig {
  width?: number;
  height?: number;
  background?: string;
  sections?: SectionConfig[];
}

/** Section style configuration */
export interface SectionStyle {
  background?: string;
  labelColor?: string;
}

/** Section configuration for canvas regions */
export interface SectionConfig {
  id: string;
  label?: string;
  bounds: Bounds;
  style?: SectionStyle;
}

/** Default canvas dimensions */
export const DEFAULT_CANVAS_WIDTH = 1200;
export const DEFAULT_CANVAS_HEIGHT = 800;
export const DEFAULT_CANVAS_BACKGROUND = '#ffffff';

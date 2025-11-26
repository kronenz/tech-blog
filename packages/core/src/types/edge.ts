/**
 * Edge-related types for AnimFlow DSL
 */

/** Line type enum */
export type LineType = 'solid' | 'dashed' | 'dotted';

/** Edge style configuration */
export interface EdgeStyle {
  color?: string;
  lineType?: LineType;
  lineWidth?: number;
  animated?: boolean;
}

/** Edge definition in DSL */
export interface EdgeConfig {
  id: string;
  from: string;
  to: string;
  label?: string;
  style?: EdgeStyle;
}

/** Default edge style values */
export const DEFAULT_EDGE_COLOR = '#adb5bd';
export const DEFAULT_LINE_TYPE: LineType = 'solid';
export const DEFAULT_LINE_WIDTH = 3;

/**
 * Node-related types for AnimFlow DSL
 */

import type { Point } from './canvas';

/** Node type enum */
export type NodeType = 'box' | 'circle' | 'database' | 'icon' | 'group';

/** Node shape enum */
export type NodeShape = 'rect' | 'rounded-rect' | 'circle' | 'diamond';

/** Node style configuration */
export interface NodeStyle {
  color?: string;
  shape?: NodeShape;
  width?: number;
  height?: number;
  icon?: string;
}

/** Node definition in DSL */
export interface NodeConfig {
  id: string;
  type?: NodeType;
  label: string;
  position: Point;
  section?: string;
  style?: NodeStyle;
}

/** Default node style values */
export const DEFAULT_NODE_COLOR = '#3b82f6';
export const DEFAULT_NODE_SHAPE: NodeShape = 'rounded-rect';
export const DEFAULT_NODE_WIDTH = 120;
export const DEFAULT_NODE_HEIGHT = 60;

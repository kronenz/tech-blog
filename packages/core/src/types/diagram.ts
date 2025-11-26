/**
 * Diagram-related types for AnimFlow DSL
 * This is the root type representing a complete AnimFlow diagram
 */

import type { CanvasConfig } from './canvas';
import type { NodeConfig } from './node';
import type { EdgeConfig } from './edge';
import type { ScenarioConfig } from './scenario';
import type { LayoutConfig } from './layout';
import type { PresetConfig } from './preset';
import type { ComparisonConfig } from './comparison';

/** Metadata for the diagram */
export interface DiagramMetadata {
  title?: string;
  author?: string;
  description?: string;
  tags?: string[];
}

/** Raw diagram configuration as parsed from YAML/JSON */
export interface DiagramConfig {
  version: string;
  metadata?: DiagramMetadata;
  canvas?: CanvasConfig;
  nodes: NodeConfig[];
  edges?: EdgeConfig[];
  variables?: VariableConfig[];
  scenarios?: ScenarioConfig[];
  controls?: ControlsConfig;
  stats?: StatConfig[];
  logging?: LoggingConfig;
  layout?: LayoutConfig;
  presets?: PresetConfig[];
  comparison?: ComparisonConfig;
}

/** Variable configuration (defined in variable.ts) */
export interface VariableConfig {
  type: 'boolean' | 'number' | 'string';
  default?: unknown;
}

/** Controls configuration placeholder (defined in controls.ts) */
export interface ControlsConfig {
  scenarios?: unknown;
  speed?: unknown;
  buttons?: unknown[];
}

/** Stat configuration placeholder (defined in stat.ts) */
export interface StatConfig {
  id: string;
  label: string;
  unit?: string;
  format?: string;
  compute?: unknown;
}

/** Logging configuration placeholder (defined in logging.ts) */
export interface LoggingConfig {
  enabled?: boolean;
  maxEntries?: number;
  timestampFormat?: string;
  styles?: Record<string, unknown>;
}

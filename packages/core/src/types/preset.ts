/**
 * Preset types for AnimFlow scenario presets
 */

import type { ExpressionValue } from './expression';

/** Variable values for a preset */
export type PresetVariables = Record<string, ExpressionValue>;

/** Preset configuration */
export interface PresetConfig {
  id: string;
  name: string;
  description?: string;
  default?: boolean;
  extends?: string;
  variables?: PresetVariables;
}

/** Default preset values */
export const DEFAULT_PRESET_DEFAULT = false;

/**
 * Stat types for AnimFlow DSL
 */

import type { ExpressionValue } from './expression';

/** Stat configuration */
export interface StatConfig {
  id: string;
  label: string;
  initialValue?: number | ExpressionValue;
  format?: StatFormat;
  unit?: string;
}

/** Stat display format */
export type StatFormat = 'number' | 'percentage' | 'duration' | 'bytes';

/** Runtime stat state */
export interface StatState {
  id: string;
  label: string;
  value: number;
  format: StatFormat;
  unit?: string;
}

/** Default stat format */
export const DEFAULT_STAT_FORMAT: StatFormat = 'number';

/** Default initial stat value */
export const DEFAULT_STAT_VALUE = 0;

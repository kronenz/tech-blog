/**
 * Comparison panel types for AnimFlow
 */

/** Comparison item configuration */
export interface ComparisonItemConfig {
  preset: string;
  label: string;
  value: string;
  description?: string;
  color?: string;
}

/** Comparison panel configuration */
export interface ComparisonConfig {
  enabled?: boolean;
  title?: string;
  items?: ComparisonItemConfig[];
}

/** Default comparison values */
export const DEFAULT_COMPARISON_ENABLED = true;
export const DEFAULT_COMPARISON_TITLE = 'Performance Comparison';

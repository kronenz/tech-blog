/**
 * Layout types for AnimFlow Enhanced UI
 */

/** Style configuration for header/footer */
export interface LayoutStyleConfig {
  background?: string;
  color?: string;
  padding?: string;
}

/** Header panel configuration */
export interface HeaderConfig {
  title?: string;
  subtitle?: string;
  style?: LayoutStyleConfig;
}

/** Legend item configuration */
export interface LegendItemConfig {
  color: string;
  label: string;
}

/** Legend panel configuration */
export interface LegendConfig {
  enabled?: boolean;
  title?: string;
  position?: 'top' | 'bottom';
  items?: LegendItemConfig[];
}

/** Footer panel configuration */
export interface FooterConfig {
  text?: string;
  style?: LayoutStyleConfig;
}

/** Full layout configuration */
export interface LayoutConfig {
  header?: HeaderConfig;
  legend?: LegendConfig;
  footer?: FooterConfig;
}

/** Slot positions for layout components */
export type SlotPosition = 'top' | 'main' | 'bottom';

/** Default layout values */
export const DEFAULT_LEGEND_POSITION = 'top' as const;
export const DEFAULT_LEGEND_ENABLED = true;

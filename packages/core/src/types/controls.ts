/**
 * Control types for AnimFlow DSL
 */

/** Speed control option */
export interface SpeedOption {
  label: string;
  value: number;
}

/** Speed control configuration */
export interface SpeedControlConfig {
  default?: number;
  options?: SpeedOption[];
}

/** Button configuration */
export interface ButtonConfig {
  id: string;
  label: string;
  scenario?: string;
  action?: 'start' | 'reset' | 'stop';
  default?: boolean;
  style?: ButtonStyle;
}

/** Button style */
export interface ButtonStyle {
  color?: string;
  background?: string;
}

/** Control group configuration */
export interface ControlGroupConfig {
  id: string;
  label?: string;
  buttons: ButtonConfig[];
}

/** Full controls configuration */
export interface ControlsConfig {
  /** Show default start/reset buttons */
  showDefaults?: boolean;
  /** Speed control settings */
  speed?: SpeedControlConfig;
  /** Scenario selection buttons */
  scenarios?: ControlGroupConfig;
  /** Custom control groups */
  groups?: ControlGroupConfig[];
}

/** Default speed options */
export const DEFAULT_SPEED_OPTIONS: SpeedOption[] = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

/** Default speed value */
export const DEFAULT_SPEED = 1;

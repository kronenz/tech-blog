/**
 * Scenario-related types for AnimFlow DSL
 */

import type { ExpressionValue } from './expression';

/** Animation style for highlight effects */
export interface AnimationStyle {
  color?: string;
  glow?: boolean;
}

/** Log message configuration */
export interface LogMessage {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

/** Step configuration in a scenario */
export interface StepConfig {
  action: ActionType;
  nodes?: string[];
  edges?: string[];
  edge?: string;
  style?: AnimationStyle;
  label?: string;
  duration?: number | ExpressionValue;
  log?: LogMessage;
  stats?: Record<string, number>;
  condition?: ExpressionValue;
  then?: StepConfig[];
  else?: StepConfig[];
  scenario?: string;
  steps?: StepConfig[];
}

/** Action types supported by scenario engine */
export type ActionType =
  | 'highlight'
  | 'animate-edge'
  | 'update-stat'
  | 'log'
  | 'delay'
  | 'conditional'
  | 'goto'
  | 'parallel'
  | 'reset';

/** Scenario configuration */
export interface ScenarioConfig {
  id: string;
  name?: string;
  description?: string;
  init?: Record<string, ExpressionValue>;
  steps: StepConfig[];
}

/** Default animation duration in ms */
export const DEFAULT_DURATION = 1000;

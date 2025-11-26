/**
 * Action-related types for AnimFlow DSL
 */

import type { AnimationStyle, LogMessage, StepConfig } from './scenario';
import type { ExpressionValue } from './expression';

/** Base action interface */
export interface BaseAction {
  action: string;
  duration?: number | ExpressionValue;
}

/** Highlight action - highlights nodes and/or edges */
export interface HighlightAction extends BaseAction {
  action: 'highlight';
  nodes?: string[];
  edges?: string[];
  style?: AnimationStyle;
  log?: LogMessage;
  stats?: Record<string, number>;
}

/** Animate edge action - shows animation along an edge */
export interface AnimateEdgeAction extends BaseAction {
  action: 'animate-edge';
  edge: string;
  style?: AnimationStyle;
  label?: string;
  log?: LogMessage;
  stats?: Record<string, number>;
}

/** Update stat action - updates statistics values */
export interface UpdateStatAction extends BaseAction {
  action: 'update-stat';
  stats: Record<string, number | ExpressionValue>;
}

/** Log action - adds a log entry */
export interface LogAction extends BaseAction {
  action: 'log';
  log: LogMessage;
}

/** Delay action - waits for a duration */
export interface DelayAction extends BaseAction {
  action: 'delay';
  duration: number | ExpressionValue;
}

/** Conditional action - executes steps based on condition */
export interface ConditionalAction extends BaseAction {
  action: 'conditional';
  condition: ExpressionValue;
  then: StepConfig[];
  else?: StepConfig[];
}

/** Goto action - jumps to another scenario */
export interface GotoAction extends BaseAction {
  action: 'goto';
  scenario: string;
}

/** Parallel action - executes multiple steps concurrently */
export interface ParallelAction extends BaseAction {
  action: 'parallel';
  steps: StepConfig[];
}

/** Reset action - resets diagram to initial state */
export interface ResetAction extends BaseAction {
  action: 'reset';
}

/** Union of all action types */
export type Action =
  | HighlightAction
  | AnimateEdgeAction
  | UpdateStatAction
  | LogAction
  | DelayAction
  | ConditionalAction
  | GotoAction
  | ParallelAction
  | ResetAction;

/** Type guards */
export function isHighlightAction(action: BaseAction): action is HighlightAction {
  return action.action === 'highlight';
}

export function isAnimateEdgeAction(action: BaseAction): action is AnimateEdgeAction {
  return action.action === 'animate-edge';
}

export function isUpdateStatAction(action: BaseAction): action is UpdateStatAction {
  return action.action === 'update-stat';
}

export function isLogAction(action: BaseAction): action is LogAction {
  return action.action === 'log';
}

export function isDelayAction(action: BaseAction): action is DelayAction {
  return action.action === 'delay';
}

export function isConditionalAction(action: BaseAction): action is ConditionalAction {
  return action.action === 'conditional';
}

export function isGotoAction(action: BaseAction): action is GotoAction {
  return action.action === 'goto';
}

export function isParallelAction(action: BaseAction): action is ParallelAction {
  return action.action === 'parallel';
}

export function isResetAction(action: BaseAction): action is ResetAction {
  return action.action === 'reset';
}

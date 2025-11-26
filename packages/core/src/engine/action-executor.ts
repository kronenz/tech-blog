/**
 * Action Executor - executes individual scenario steps
 */

import type { Diagram } from '../model';
import type { Step } from '../model';
import type { AnimationManager } from '../renderer/animation-manager';
import { DEFAULT_DURATION } from '../types';

/** Action execution context */
export interface ActionContext {
  diagram: Diagram;
  animationManager: AnimationManager;
  speedMultiplier: number;
  onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onStatUpdate?: (statId: string, value: number) => void;
}

/**
 * Execute a single step action
 */
export async function executeAction(
  step: Step,
  context: ActionContext
): Promise<void> {
  const { diagram, animationManager, speedMultiplier } = context;
  const duration = getDuration(step.duration, speedMultiplier);

  switch (step.action) {
    case 'highlight':
      await executeHighlight(step, context, duration);
      break;

    case 'animate-edge':
      await executeAnimateEdge(step, context, duration);
      break;

    case 'delay':
      await executeDelay(duration);
      break;

    case 'reset':
      executeReset(context);
      break;

    case 'log':
      executeLog(step, context);
      break;

    case 'update-stat':
      executeUpdateStat(step, context);
      break;

    // conditional, goto, parallel are handled by ScenarioRunner
    default:
      console.warn(`Unknown action: ${step.action}`);
  }
}

/**
 * Execute highlight action
 */
async function executeHighlight(
  step: Step,
  context: ActionContext,
  duration: number
): Promise<void> {
  const { animationManager } = context;

  // Highlight nodes
  if (step.nodes && step.nodes.length > 0) {
    animationManager.highlightNodes(step.nodes, step.style);
  }

  // Highlight edges
  if (step.edges && step.edges.length > 0) {
    animationManager.highlightEdges(step.edges, step.style);
  }

  // Execute log if present
  if (step.log) {
    executeLog(step, context);
  }

  // Execute stat updates if present
  if (step.stats) {
    executeUpdateStat(step, context);
  }

  // Wait for duration
  await sleep(duration);
}

/**
 * Execute animate-edge action
 */
async function executeAnimateEdge(
  step: Step,
  context: ActionContext,
  duration: number
): Promise<void> {
  const { animationManager } = context;

  if (!step.edge) {
    console.warn('animate-edge action missing edge property');
    return;
  }

  // Execute log if present
  if (step.log) {
    executeLog(step, context);
  }

  // Execute stat updates if present
  if (step.stats) {
    executeUpdateStat(step, context);
  }

  // Animate the edge
  await animationManager.startEdgeAnimation(
    step.edge,
    duration,
    step.label,
    step.style?.color
  );
}

/**
 * Execute delay action
 */
async function executeDelay(duration: number): Promise<void> {
  await sleep(duration);
}

/**
 * Execute reset action
 */
function executeReset(context: ActionContext): void {
  context.animationManager.reset();
}

/**
 * Execute log action
 */
function executeLog(step: Step, context: ActionContext): void {
  if (step.log && context.onLog) {
    context.onLog(step.log.message, step.log.type || 'info');
  }
}

/**
 * Execute update-stat action
 */
function executeUpdateStat(step: Step, context: ActionContext): void {
  if (step.stats && context.onStatUpdate) {
    for (const [statId, value] of Object.entries(step.stats)) {
      context.onStatUpdate(statId, value);
    }
  }
}

/**
 * Get duration considering speed multiplier
 */
function getDuration(
  duration: number | unknown,
  speedMultiplier: number
): number {
  const baseDuration = typeof duration === 'number' ? duration : DEFAULT_DURATION;
  return baseDuration / speedMultiplier;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @animflow/core - AnimFlow DSL Engine
 *
 * A declarative diagram definition language parser, renderer, and animation engine.
 */

// Errors
export * from './errors';

// Types
export * from './types';

// Parser
export * from './parser';

// Models
export * from './model';

// Renderer
export * from './renderer';

// Engine
export * from './engine';

// UI
export * from './ui';

// Main AnimFlow class
export { AnimFlow } from './animflow';
export type {
  AnimFlowOptions,
  AnimFlowEvent,
  AnimFlowEventHandler,
  ScenarioState,
} from './animflow';

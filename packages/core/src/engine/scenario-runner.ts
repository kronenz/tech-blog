/**
 * Scenario Runner - executes scenario step sequences
 */

import type { Diagram, Scenario, Step } from '../model';
import type { AnimationManager } from '../renderer/animation-manager';
import type { PresetVariables } from '../types';
import { executeAction, type ActionContext } from './action-executor';
import { VariableStore } from './variable-store';
import { ExpressionEvaluator } from './expression-evaluator';
import { PresetStore } from './preset-store';
import { ExecutionError, LimitExceededError } from '../errors';

/** Scenario execution state */
export type ScenarioState = 'idle' | 'running' | 'paused' | 'completed';

/** Scenario runner events */
export interface ScenarioRunnerEvents {
  onStateChange?: (state: ScenarioState) => void;
  onStepStart?: (scenarioId: string, stepIndex: number, step: Step) => void;
  onStepEnd?: (scenarioId: string, stepIndex: number, step: Step) => void;
  onScenarioStart?: (scenarioId: string) => void;
  onScenarioEnd?: (scenarioId: string) => void;
  onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onStatUpdate?: (statId: string, value: number) => void;
  onError?: (error: Error) => void;
}

/** Runner configuration */
export interface ScenarioRunnerConfig {
  maxStepExecutions?: number;
  maxGotoDepth?: number;
}

const DEFAULT_MAX_STEP_EXECUTIONS = 1000;
const DEFAULT_MAX_GOTO_DEPTH = 10;

/**
 * Scenario Runner for executing animation scenarios
 */
export class ScenarioRunner {
  private diagram: Diagram;
  private animationManager: AnimationManager;
  private events: ScenarioRunnerEvents;
  private config: Required<ScenarioRunnerConfig>;

  private state: ScenarioState = 'idle';
  private speedMultiplier = 1;
  private stepExecutionCount = 0;
  private gotoDepth = 0;
  private abortController: AbortController | null = null;

  // Expression evaluation system
  private variableStore: VariableStore;
  private expressionEvaluator: ExpressionEvaluator;
  private presetStore: PresetStore;
  private activePresetId: string | null = null;

  constructor(
    diagram: Diagram,
    animationManager: AnimationManager,
    events: ScenarioRunnerEvents = {},
    config: ScenarioRunnerConfig = {}
  ) {
    this.diagram = diagram;
    this.animationManager = animationManager;
    this.events = events;
    this.config = {
      maxStepExecutions: config.maxStepExecutions ?? DEFAULT_MAX_STEP_EXECUTIONS,
      maxGotoDepth: config.maxGotoDepth ?? DEFAULT_MAX_GOTO_DEPTH,
    };

    // Initialize expression evaluation system
    this.variableStore = new VariableStore();
    this.expressionEvaluator = new ExpressionEvaluator(this.variableStore);
    this.presetStore = new PresetStore();
  }

  /**
   * Get current state
   */
  getState(): ScenarioState {
    return this.state;
  }

  /**
   * Set animation speed multiplier
   */
  setSpeed(multiplier: number): void {
    this.speedMultiplier = Math.max(0.1, Math.min(10, multiplier));
  }

  /**
   * Get current speed multiplier
   */
  getSpeed(): number {
    return this.speedMultiplier;
  }

  /**
   * Run a scenario by ID
   */
  async runScenario(scenarioId: string): Promise<void> {
    const scenario = this.diagram.getScenario(scenarioId);
    if (!scenario) {
      throw new ExecutionError(`Scenario not found: ${scenarioId}`);
    }

    // Reset counters
    this.stepExecutionCount = 0;
    this.gotoDepth = 0;

    // Create abort controller for cancellation
    this.abortController = new AbortController();

    try {
      this.setState('running');
      this.events.onScenarioStart?.(scenarioId);

      await this.executeScenario(scenario);

      if (this.state === 'running') {
        this.setState('completed');
      }
      this.events.onScenarioEnd?.(scenarioId);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Scenario was cancelled
        return;
      }
      this.events.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Execute a scenario's steps
   */
  private async executeScenario(scenario: Scenario): Promise<void> {
    // Handle empty scenario
    if (scenario.isEmpty) {
      return;
    }

    // Initialize variables from scenario init block
    if (scenario.init && Object.keys(scenario.init).length > 0) {
      this.variableStore.initializeFrom(
        scenario.init,
        (expr) => this.expressionEvaluator.evaluate(expr)
      );
    }

    // Execute steps
    for (let i = 0; i < scenario.steps.length; i++) {
      if (this.abortController?.signal.aborted) {
        throw new DOMException('Scenario aborted', 'AbortError');
      }

      const step = scenario.steps[i];
      await this.executeStep(scenario.id, step);
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(scenarioId: string, step: Step): Promise<void> {
    // Check execution limit
    this.stepExecutionCount++;
    if (this.stepExecutionCount > this.config.maxStepExecutions) {
      throw new LimitExceededError(
        'Step execution',
        this.config.maxStepExecutions,
        this.stepExecutionCount
      );
    }

    this.events.onStepStart?.(scenarioId, step.index, step);

    const context: ActionContext = {
      diagram: this.diagram,
      animationManager: this.animationManager,
      speedMultiplier: this.speedMultiplier,
      onLog: this.events.onLog,
      onStatUpdate: this.events.onStatUpdate,
    };

    // Handle special action types
    switch (step.action) {
      case 'conditional':
        await this.executeConditional(scenarioId, step, context);
        break;

      case 'goto':
        await this.executeGoto(step);
        break;

      case 'parallel':
        await this.executeParallel(scenarioId, step, context);
        break;

      default:
        await executeAction(step, context);
    }

    this.events.onStepEnd?.(scenarioId, step.index, step);
  }

  /**
   * Execute conditional action
   */
  private async executeConditional(
    scenarioId: string,
    step: Step,
    _context: ActionContext
  ): Promise<void> {
    // Evaluate the condition using the expression evaluator
    let conditionResult = true;
    if (step.condition !== undefined) {
      conditionResult = this.expressionEvaluator.evaluateCondition(step.condition);
    }

    const stepsToExecute = conditionResult ? step.thenSteps : step.elseSteps;

    if (stepsToExecute) {
      for (const subStep of stepsToExecute) {
        await this.executeStep(scenarioId, subStep);
      }
    }
  }

  /**
   * Execute goto action
   */
  private async executeGoto(step: Step): Promise<void> {
    if (!step.scenario) {
      throw new ExecutionError('goto action missing scenario property');
    }

    // Check goto depth
    this.gotoDepth++;
    if (this.gotoDepth > this.config.maxGotoDepth) {
      throw new LimitExceededError(
        'Goto depth',
        this.config.maxGotoDepth,
        this.gotoDepth
      );
    }

    const targetScenario = this.diagram.getScenario(step.scenario);
    if (!targetScenario) {
      throw new ExecutionError(`Goto target scenario not found: ${step.scenario}`);
    }

    await this.executeScenario(targetScenario);
    this.gotoDepth--;
  }

  /**
   * Execute parallel action
   */
  private async executeParallel(
    scenarioId: string,
    step: Step,
    _context: ActionContext
  ): Promise<void> {
    if (!step.parallelSteps || step.parallelSteps.length === 0) {
      return;
    }

    // Execute all parallel steps concurrently
    await Promise.all(
      step.parallelSteps.map((subStep) =>
        this.executeStep(scenarioId, subStep)
      )
    );
  }

  /**
   * Stop the current scenario
   */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.setState('idle');
    this.animationManager.reset();
  }

  /**
   * Reset the runner
   */
  reset(): void {
    this.stop();
    this.stepExecutionCount = 0;
    this.gotoDepth = 0;
    this.variableStore.clear();
  }

  /**
   * Get a variable value
   */
  getVariable(name: string): number | string | boolean | undefined {
    return this.variableStore.get(name);
  }

  /**
   * Set a variable value
   */
  setVariable(name: string, value: number | string | boolean): void {
    this.variableStore.set(name, value);
  }

  /**
   * Get all variables
   */
  getVariables(): Record<string, number | string | boolean> {
    return this.variableStore.getAll();
  }

  /**
   * Load presets from config
   */
  loadPresets(presets: Array<{ id: string; name: string; description?: string; default?: boolean; extends?: string; variables?: PresetVariables }>): void {
    this.presetStore.loadPresets(presets);
    const defaultPresetId = this.presetStore.getDefaultPresetId();
    if (defaultPresetId) {
      this.activePresetId = defaultPresetId;
    }
  }

  /**
   * Apply a preset's variables
   */
  applyPreset(presetId: string): void {
    if (!this.presetStore.has(presetId)) {
      throw new ExecutionError(`Preset not found: ${presetId}`);
    }

    const variables = this.presetStore.getVariables(presetId);
    this.variableStore.setVariables(
      variables,
      (expr) => this.expressionEvaluator.evaluate(expr)
    );
    this.activePresetId = presetId;
  }

  /**
   * Run a scenario with a specific preset
   */
  async runWithPreset(scenarioId: string, presetId: string): Promise<void> {
    this.applyPreset(presetId);
    await this.runScenario(scenarioId);
  }

  /**
   * Get the active preset ID
   */
  getActivePresetId(): string | null {
    return this.activePresetId;
  }

  /**
   * Get list of available presets
   */
  getPresets(): Array<{ id: string; name: string; description?: string; isDefault: boolean }> {
    return this.presetStore.getPresetsInfo();
  }

  /**
   * Get the preset store
   */
  getPresetStore(): PresetStore {
    return this.presetStore;
  }

  /**
   * Set state and emit event
   */
  private setState(newState: ScenarioState): void {
    this.state = newState;
    this.events.onStateChange?.(newState);
  }
}

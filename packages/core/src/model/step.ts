/**
 * Step model class
 */

import type {
  StepConfig,
  ActionType,
  AnimationStyle,
  LogMessage,
  ExpressionValue,
} from '../types';
import { DEFAULT_DURATION } from '../types';

/**
 * Step model representing a single action in a scenario
 */
export class Step {
  public readonly index: number;
  public readonly action: ActionType;
  public readonly nodes?: string[];
  public readonly edges?: string[];
  public readonly edge?: string;
  public readonly style?: AnimationStyle;
  public readonly label?: string;
  public readonly duration: number | ExpressionValue;
  public readonly log?: LogMessage;
  public readonly stats?: Record<string, number>;
  public readonly condition?: ExpressionValue;
  public readonly thenSteps?: Step[];
  public readonly elseSteps?: Step[];
  public readonly scenario?: string;
  public readonly parallelSteps?: Step[];

  constructor(config: StepConfig, index: number) {
    this.index = index;
    this.action = config.action;
    this.nodes = config.nodes;
    this.edges = config.edges;
    this.edge = config.edge;
    this.style = config.style;
    this.label = config.label;
    this.duration = config.duration ?? DEFAULT_DURATION;
    this.log = config.log;
    this.stats = config.stats;
    this.condition = config.condition;
    this.scenario = config.scenario;

    // Parse nested steps for conditional
    if (config.then) {
      this.thenSteps = config.then.map((s, i) => Step.fromConfig(s, i));
    }
    if (config.else) {
      this.elseSteps = config.else.map((s, i) => Step.fromConfig(s, i));
    }

    // Parse nested steps for parallel
    if (config.steps) {
      this.parallelSteps = config.steps.map((s, i) => Step.fromConfig(s, i));
    }
  }

  /** Check if this is a highlight action */
  get isHighlight(): boolean {
    return this.action === 'highlight';
  }

  /** Check if this is an animate-edge action */
  get isAnimateEdge(): boolean {
    return this.action === 'animate-edge';
  }

  /** Check if this is a conditional action */
  get isConditional(): boolean {
    return this.action === 'conditional';
  }

  /** Check if this is a goto action */
  get isGoto(): boolean {
    return this.action === 'goto';
  }

  /** Check if this is a parallel action */
  get isParallel(): boolean {
    return this.action === 'parallel';
  }

  /** Check if this is a reset action */
  get isReset(): boolean {
    return this.action === 'reset';
  }

  /** Check if this is a delay action */
  get isDelay(): boolean {
    return this.action === 'delay';
  }

  /** Create from config */
  static fromConfig(config: StepConfig, index: number): Step {
    return new Step(config, index);
  }
}

/**
 * Scenario model class
 */

import type { ScenarioConfig, ExpressionValue } from '../types';
import { Step } from './step';

/**
 * Scenario model representing an animation sequence
 */
export class Scenario {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly init: Record<string, ExpressionValue>;
  public readonly steps: Step[];

  constructor(config: ScenarioConfig) {
    this.id = config.id;
    this.name = config.name || config.id;
    this.description = config.description;
    this.init = config.init || {};
    this.steps = config.steps.map((stepConfig, index) =>
      Step.fromConfig(stepConfig, index)
    );
  }

  /** Get step by index */
  getStep(index: number): Step | undefined {
    return this.steps[index];
  }

  /** Get total number of steps */
  get stepCount(): number {
    return this.steps.length;
  }

  /** Check if scenario is empty */
  get isEmpty(): boolean {
    return this.steps.length === 0;
  }

  /** Create from config */
  static fromConfig(config: ScenarioConfig): Scenario {
    return new Scenario(config);
  }
}

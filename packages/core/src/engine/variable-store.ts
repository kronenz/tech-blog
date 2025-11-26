/**
 * Variable Store - manages runtime variables during scenario execution
 */

import type { VariableValue, ExpressionValue } from '../types';

/**
 * Variable Store for managing scenario runtime state
 */
export class VariableStore {
  private variables: Map<string, VariableValue> = new Map();

  /**
   * Get a variable value
   */
  get(name: string): VariableValue | undefined {
    return this.variables.get(name);
  }

  /**
   * Set a variable value
   */
  set(name: string, value: VariableValue): void {
    this.variables.set(name, value);
  }

  /**
   * Check if a variable exists
   */
  has(name: string): boolean {
    return this.variables.has(name);
  }

  /**
   * Delete a variable
   */
  delete(name: string): boolean {
    return this.variables.delete(name);
  }

  /**
   * Clear all variables
   */
  clear(): void {
    this.variables.clear();
  }

  /**
   * Get all variable names
   */
  getNames(): string[] {
    return Array.from(this.variables.keys());
  }

  /**
   * Get all variables as object
   */
  getAll(): Record<string, VariableValue> {
    const result: Record<string, VariableValue> = {};
    for (const [key, value] of this.variables) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Initialize variables from an init block
   */
  initializeFrom(
    init: Record<string, ExpressionValue>,
    evaluator: (expr: ExpressionValue) => VariableValue
  ): void {
    for (const [name, expression] of Object.entries(init)) {
      const value = evaluator(expression);
      this.set(name, value);
    }
  }

  /**
   * Set multiple variables at once (for preset application)
   */
  setVariables(
    variables: Record<string, ExpressionValue>,
    evaluator: (expr: ExpressionValue) => VariableValue
  ): void {
    for (const [name, expression] of Object.entries(variables)) {
      const value = evaluator(expression);
      this.set(name, value);
    }
  }

  /**
   * Create a snapshot of current state
   */
  snapshot(): Map<string, VariableValue> {
    return new Map(this.variables);
  }

  /**
   * Restore from a snapshot
   */
  restore(snapshot: Map<string, VariableValue>): void {
    this.variables = new Map(snapshot);
  }
}

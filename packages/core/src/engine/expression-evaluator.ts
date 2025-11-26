/**
 * Expression Evaluator - evaluates DSL expressions at runtime
 */

import type {
  ExpressionValue,
  VariableValue,
} from '../types';
import {
  isVarExpression,
  isRandomExpression,
  isAddExpression,
  isMultiplyExpression,
  isSubtractExpression,
  isIfExpression,
  isEqExpression,
  isGtExpression,
  isAndExpression,
  isOrExpression,
  isExpression,
} from '../types';
import type { VariableStore } from './variable-store';
import { ExecutionError } from '../errors';

/**
 * Expression Evaluator for AnimFlow DSL expressions
 */
export class ExpressionEvaluator {
  private store: VariableStore;

  constructor(store: VariableStore) {
    this.store = store;
  }

  /**
   * Evaluate an expression and return its value
   */
  evaluate(expr: ExpressionValue): VariableValue {
    // Primitive values
    if (typeof expr === 'number') {
      return expr;
    }
    if (typeof expr === 'string') {
      return expr;
    }
    if (typeof expr === 'boolean') {
      return expr;
    }

    // Expression objects
    if (!isExpression(expr)) {
      throw new ExecutionError(`Invalid expression: ${JSON.stringify(expr)}`);
    }

    // Variable reference: { $var: "name" }
    if (isVarExpression(expr)) {
      const value = this.store.get(expr.$var);
      if (value === undefined) {
        throw new ExecutionError(`Undefined variable: ${expr.$var}`);
      }
      return value;
    }

    // Random expressions
    if (isRandomExpression(expr)) {
      if ('$random-bool' in expr) {
        const probability = expr['$random-bool'];
        return Math.random() < probability;
      }
      if ('$random' in expr) {
        const { min, max } = expr.$random;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }

    // Arithmetic expressions
    if (isAddExpression(expr)) {
      const [a, b] = expr.$add;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return va + vb;
      }
      // String concatenation
      return String(va) + String(vb);
    }

    if (isSubtractExpression(expr)) {
      const [a, b] = expr.$subtract;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      if (typeof va !== 'number' || typeof vb !== 'number') {
        throw new ExecutionError('$subtract requires numeric operands');
      }
      return va - vb;
    }

    if (isMultiplyExpression(expr)) {
      const [a, b] = expr.$multiply;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      if (typeof va !== 'number' || typeof vb !== 'number') {
        throw new ExecutionError('$multiply requires numeric operands');
      }
      return va * vb;
    }

    // Comparison expressions
    if (isEqExpression(expr)) {
      const [a, b] = expr.$eq;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      return va === vb;
    }

    if (isGtExpression(expr)) {
      const [a, b] = expr.$gt;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      if (typeof va !== 'number' || typeof vb !== 'number') {
        throw new ExecutionError('$gt requires numeric operands');
      }
      return va > vb;
    }

    // Logical expressions
    if (isAndExpression(expr)) {
      const [a, b] = expr.$and;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      return Boolean(va) && Boolean(vb);
    }

    if (isOrExpression(expr)) {
      const [a, b] = expr.$or;
      const va = this.evaluate(a);
      const vb = this.evaluate(b);
      return Boolean(va) || Boolean(vb);
    }

    // Conditional expression: { $if: [condition, thenValue, elseValue] }
    if (isIfExpression(expr)) {
      const [condition, thenValue, elseValue] = expr.$if;
      const condResult = this.evaluate(condition);
      if (condResult) {
        return this.evaluate(thenValue);
      }
      return this.evaluate(elseValue);
    }

    throw new ExecutionError(`Unknown expression type: ${JSON.stringify(expr)}`);
  }

  /**
   * Evaluate a condition and return boolean
   */
  evaluateCondition(expr: ExpressionValue): boolean {
    const result = this.evaluate(expr);
    return Boolean(result);
  }

  /**
   * Evaluate and ensure numeric result
   */
  evaluateNumber(expr: ExpressionValue): number {
    const result = this.evaluate(expr);
    if (typeof result !== 'number') {
      throw new ExecutionError(`Expected number, got ${typeof result}`);
    }
    return result;
  }

  /**
   * Evaluate and ensure string result
   */
  evaluateString(expr: ExpressionValue): string {
    const result = this.evaluate(expr);
    return String(result);
  }
}

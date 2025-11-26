/**
 * Custom error classes for AnimFlow DSL Engine
 */

/** Base error class for all AnimFlow errors */
export class AnimFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnimFlowError';
  }
}

/** Error thrown during YAML/JSON parsing */
export class ParseError extends AnimFlowError {
  public readonly line?: number;
  public readonly column?: number;
  public readonly source?: string;

  constructor(
    message: string,
    options?: {
      line?: number;
      column?: number;
      source?: string;
    }
  ) {
    const location =
      options?.line !== undefined
        ? ` at line ${options.line}${options.column !== undefined ? `, column ${options.column}` : ''}`
        : '';
    super(`Parse error${location}: ${message}`);
    this.name = 'ParseError';
    this.line = options?.line;
    this.column = options?.column;
    this.source = options?.source;
  }
}

/** Error thrown during JSON Schema validation */
export class ValidationError extends AnimFlowError {
  public readonly errors: ValidationErrorDetail[];

  constructor(message: string, errors: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/** Detail for a single validation error */
export interface ValidationErrorDetail {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, unknown>;
}

/** Error thrown when referencing non-existent entities */
export class ReferenceError extends AnimFlowError {
  public readonly entityType: string;
  public readonly entityId: string;
  public readonly referencedFrom?: string;

  constructor(
    entityType: string,
    entityId: string,
    referencedFrom?: string
  ) {
    const from = referencedFrom ? ` (referenced from ${referencedFrom})` : '';
    super(`${entityType} "${entityId}" not found${from}`);
    this.name = 'ReferenceError';
    this.entityType = entityType;
    this.entityId = entityId;
    this.referencedFrom = referencedFrom;
  }
}

/** Error thrown during scenario execution */
export class ExecutionError extends AnimFlowError {
  public readonly scenarioId?: string;
  public readonly stepIndex?: number;

  constructor(
    message: string,
    options?: {
      scenarioId?: string;
      stepIndex?: number;
    }
  ) {
    const context = options?.scenarioId
      ? ` in scenario "${options.scenarioId}"${options.stepIndex !== undefined ? ` at step ${options.stepIndex}` : ''}`
      : '';
    super(`Execution error${context}: ${message}`);
    this.name = 'ExecutionError';
    this.scenarioId = options?.scenarioId;
    this.stepIndex = options?.stepIndex;
  }
}

/** Error thrown when max execution limits are exceeded */
export class LimitExceededError extends AnimFlowError {
  public readonly limitType: string;
  public readonly limit: number;
  public readonly actual: number;

  constructor(limitType: string, limit: number, actual: number) {
    super(`${limitType} limit exceeded: ${actual} > ${limit}`);
    this.name = 'LimitExceededError';
    this.limitType = limitType;
    this.limit = limit;
    this.actual = actual;
  }
}

/** Error thrown when rendering fails */
export class RenderError extends AnimFlowError {
  constructor(message: string) {
    super(`Render error: ${message}`);
    this.name = 'RenderError';
  }
}

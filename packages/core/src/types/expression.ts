/**
 * Expression types for AnimFlow DSL
 * Expressions are evaluated at runtime for dynamic values
 */

/** Variable reference expression */
export interface VarExpression {
  $var: string;
}

/** Random boolean expression using $random-bool shorthand */
export interface RandomBoolShortExpression {
  '$random-bool': number;
}

/** Random boolean expression (probability-based) */
export interface RandomBoolExpression {
  $random: {
    probability: number;
  };
}

/** Random number expression (range-based) */
export interface RandomNumberExpression {
  $random: {
    min: number;
    max: number;
  };
}

/** Addition expression */
export interface AddExpression {
  $add: ExpressionValue[];
}

/** Multiplication expression */
export interface MultiplyExpression {
  $multiply: ExpressionValue[];
}

/** Subtraction expression */
export interface SubtractExpression {
  $subtract: [ExpressionValue, ExpressionValue];
}

/** Conditional expression */
export interface IfExpression {
  $if: {
    condition: ExpressionValue;
    then: ExpressionValue;
    else?: ExpressionValue;
  };
}

/** Equality comparison expression */
export interface EqExpression {
  $eq: [ExpressionValue, ExpressionValue];
}

/** Greater than comparison expression */
export interface GtExpression {
  $gt: [number, number];
}

/** Logical AND expression */
export interface AndExpression {
  $and: ExpressionValue[];
}

/** Logical OR expression */
export interface OrExpression {
  $or: ExpressionValue[];
}

/** All possible expression types */
export type Expression =
  | VarExpression
  | RandomBoolShortExpression
  | RandomBoolExpression
  | RandomNumberExpression
  | AddExpression
  | MultiplyExpression
  | SubtractExpression
  | IfExpression
  | EqExpression
  | GtExpression
  | AndExpression
  | OrExpression;

/** Expression value can be a literal or an expression */
export type ExpressionValue = Expression | number | string | boolean;

/** Type guards for expressions */
export function isVarExpression(value: unknown): value is VarExpression {
  return typeof value === 'object' && value !== null && '$var' in value;
}

export function isRandomBoolShortExpression(
  value: unknown
): value is RandomBoolShortExpression {
  return typeof value === 'object' && value !== null && '$random-bool' in value;
}

export function isRandomExpression(
  value: unknown
): value is RandomBoolShortExpression | RandomBoolExpression | RandomNumberExpression {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('$random' in value || '$random-bool' in value)
  );
}

export function isAddExpression(value: unknown): value is AddExpression {
  return typeof value === 'object' && value !== null && '$add' in value;
}

export function isMultiplyExpression(value: unknown): value is MultiplyExpression {
  return typeof value === 'object' && value !== null && '$multiply' in value;
}

export function isSubtractExpression(value: unknown): value is SubtractExpression {
  return typeof value === 'object' && value !== null && '$subtract' in value;
}

export function isIfExpression(value: unknown): value is IfExpression {
  return typeof value === 'object' && value !== null && '$if' in value;
}

export function isEqExpression(value: unknown): value is EqExpression {
  return typeof value === 'object' && value !== null && '$eq' in value;
}

export function isGtExpression(value: unknown): value is GtExpression {
  return typeof value === 'object' && value !== null && '$gt' in value;
}

export function isAndExpression(value: unknown): value is AndExpression {
  return typeof value === 'object' && value !== null && '$and' in value;
}

export function isOrExpression(value: unknown): value is OrExpression {
  return typeof value === 'object' && value !== null && '$or' in value;
}

export function isExpression(value: unknown): value is Expression {
  return (
    isVarExpression(value) ||
    isRandomBoolShortExpression(value) ||
    isRandomExpression(value) ||
    isAddExpression(value) ||
    isMultiplyExpression(value) ||
    isSubtractExpression(value) ||
    isIfExpression(value) ||
    isEqExpression(value) ||
    isGtExpression(value) ||
    isAndExpression(value) ||
    isOrExpression(value)
  );
}

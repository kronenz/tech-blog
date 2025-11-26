/**
 * Variable types for AnimFlow DSL
 */

import type { ExpressionValue } from './expression';

/** Variable configuration in diagram */
export interface VariableConfig {
  id: string;
  value: ExpressionValue;
  description?: string;
}

/** Runtime variable value types */
export type VariableValue = number | string | boolean;

/** Variable definition in scenarios init block */
export interface VariableInit {
  [key: string]: ExpressionValue;
}

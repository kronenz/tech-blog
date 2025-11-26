/**
 * Type exports for @animflow/core
 */

// Canvas types
export type {
  Point,
  Bounds,
  CanvasConfig,
  SectionConfig,
  SectionStyle,
} from './canvas';
export {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_BACKGROUND,
} from './canvas';

// Node types
export type {
  NodeType,
  NodeShape,
  NodeStyle,
  NodeConfig,
} from './node';
export {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
} from './node';

// Edge types
export type {
  LineType,
  EdgeStyle,
  EdgeConfig,
} from './edge';
export {
  DEFAULT_EDGE_COLOR,
  DEFAULT_LINE_TYPE,
  DEFAULT_LINE_WIDTH,
} from './edge';

// Expression types
export type {
  Expression,
  ExpressionValue,
  VarExpression,
  RandomBoolShortExpression,
  RandomBoolExpression,
  RandomNumberExpression,
  AddExpression,
  MultiplyExpression,
  SubtractExpression,
  IfExpression,
  EqExpression,
  GtExpression,
  AndExpression,
  OrExpression,
} from './expression';
export {
  isVarExpression,
  isRandomBoolShortExpression,
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
} from './expression';

// Diagram types
export type {
  DiagramMetadata,
  DiagramConfig,
  VariableConfig,
  ControlsConfig,
  StatConfig,
  LoggingConfig,
} from './diagram';

// Scenario types
export type {
  ScenarioConfig,
  StepConfig,
  AnimationStyle,
  LogMessage,
  ActionType,
} from './scenario';
export { DEFAULT_DURATION } from './scenario';

// Action types
export type {
  BaseAction,
  Action,
  HighlightAction,
  AnimateEdgeAction,
  UpdateStatAction,
  LogAction,
  DelayAction,
  ConditionalAction,
  GotoAction,
  ParallelAction,
  ResetAction,
} from './action';
export {
  isHighlightAction,
  isAnimateEdgeAction,
  isUpdateStatAction,
  isLogAction,
  isDelayAction,
  isConditionalAction,
  isGotoAction,
  isParallelAction,
  isResetAction,
} from './action';

// Variable types
export type {
  VariableConfig as VariableDefinition,
  VariableValue,
  VariableInit,
} from './variable';

// Controls types
export type {
  SpeedOption,
  SpeedControlConfig,
  ButtonConfig,
  ButtonStyle,
  ControlGroupConfig,
} from './controls';
export { DEFAULT_SPEED_OPTIONS, DEFAULT_SPEED } from './controls';

// Stat types
export type {
  StatConfig as StatDefinition,
  StatFormat,
  StatState,
} from './stat';
export { DEFAULT_STAT_FORMAT, DEFAULT_STAT_VALUE } from './stat';

// Logging types
export type {
  LogMessageType,
  LogEntry,
  LoggingConfig as LoggingDefinition,
} from './logging';
export { DEFAULT_MAX_LOG_ENTRIES, DEFAULT_LOG_TITLE } from './logging';

// Layout types
export type {
  LayoutConfig,
  HeaderConfig,
  LegendConfig,
  LegendItemConfig,
  FooterConfig,
  LayoutStyleConfig,
  SlotPosition,
} from './layout';
export { DEFAULT_LEGEND_POSITION, DEFAULT_LEGEND_ENABLED } from './layout';

// Preset types
export type {
  PresetConfig,
  PresetVariables,
} from './preset';
export { DEFAULT_PRESET_DEFAULT } from './preset';

// Comparison types
export type {
  ComparisonConfig,
  ComparisonItemConfig,
} from './comparison';
export { DEFAULT_COMPARISON_ENABLED, DEFAULT_COMPARISON_TITLE } from './comparison';

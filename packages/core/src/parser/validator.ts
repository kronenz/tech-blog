/**
 * JSON Schema Validator using ajv
 */

import Ajv from 'ajv';
import type { ErrorObject } from 'ajv';
import { ValidationError, type ValidationErrorDetail } from '../errors';
import type { DiagramConfig } from '../types';
import schema from '../../schema/animflow.schema.json';

// Create ajv instance
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});

// Compile schema
const validateSchema = ajv.compile<DiagramConfig>(schema);

/**
 * Validate a parsed diagram against the JSON Schema
 * @param data - Parsed diagram data
 * @returns Validated DiagramConfig
 * @throws ValidationError if validation fails
 */
export function validateDiagram(data: unknown): DiagramConfig {
  const valid = validateSchema(data);

  if (!valid) {
    const errors = formatErrors(validateSchema.errors || []);
    // Log detailed errors for debugging
    console.error('Validation errors:', JSON.stringify(validateSchema.errors, null, 2));

    // Build detailed error message including all error details
    const errorDetails = errors
      .map((e, i) => `  ${i + 1}. [${e.path}] ${e.message}`)
      .join('\n');

    throw new ValidationError(
      `Diagram validation failed with ${errors.length} error(s):\n${errorDetails}`,
      errors
    );
  }

  return data as DiagramConfig;
}

/**
 * Format ajv errors to our ValidationErrorDetail format
 */
function formatErrors(errors: ErrorObject[]): ValidationErrorDetail[] {
  return errors.map((error) => ({
    path: error.instancePath || '/',
    message: formatErrorMessage(error),
    keyword: error.keyword,
    params: error.params as Record<string, unknown>,
  }));
}

/**
 * Format a single ajv error to a human-readable message
 */
function formatErrorMessage(error: ErrorObject): string {
  switch (error.keyword) {
    case 'required':
      return `Missing required property: ${error.params.missingProperty}`;
    case 'type':
      return `Expected ${error.params.type}, got ${typeof error.data}`;
    case 'enum':
      return `Value must be one of: ${(error.params.allowedValues as string[]).join(', ')}`;
    case 'pattern':
      return `Value does not match pattern: ${error.params.pattern}`;
    case 'minimum':
      return `Value must be >= ${error.params.limit}`;
    case 'maximum':
      return `Value must be <= ${error.params.limit}`;
    case 'minItems':
      return `Array must have at least ${error.params.limit} item(s)`;
    case 'additionalProperties':
      return `Unknown property: ${error.params.additionalProperty}`;
    default:
      return error.message || 'Unknown validation error';
  }
}

/**
 * Validate cross-references in the diagram
 * - Edge from/to must reference existing node IDs
 * - Node section must reference existing section ID
 * - Scenario goto must reference existing scenario ID
 * @param config - Validated diagram config
 * @throws ValidationError if references are invalid
 */
export function validateReferences(config: DiagramConfig): void {
  const errors: ValidationErrorDetail[] = [];

  // Collect all node IDs
  const nodeIds = new Set(config.nodes.map((n) => n.id));

  // Collect all section IDs
  const sectionIds = new Set(
    config.canvas?.sections?.map((s) => s.id) || []
  );

  // Collect all scenario IDs
  const scenarioIds = new Set(
    config.scenarios?.map((s) => s.id) || []
  );

  // Validate edge references
  config.edges?.forEach((edge, index) => {
    if (!nodeIds.has(edge.from)) {
      errors.push({
        path: `/edges/${index}/from`,
        message: `Edge references unknown node: "${edge.from}"`,
      });
    }
    if (!nodeIds.has(edge.to)) {
      errors.push({
        path: `/edges/${index}/to`,
        message: `Edge references unknown node: "${edge.to}"`,
      });
    }
  });

  // Validate node section references
  config.nodes.forEach((node, index) => {
    if (node.section && sectionIds.size > 0 && !sectionIds.has(node.section)) {
      errors.push({
        path: `/nodes/${index}/section`,
        message: `Node references unknown section: "${node.section}"`,
      });
    }
  });

  // Validate scenario goto references
  config.scenarios?.forEach((scenario, sIndex) => {
    scenario.steps.forEach((step, stepIndex) => {
      if (step.action === 'goto' && step.scenario) {
        const targetScenario = step.scenario as string;
        if (!scenarioIds.has(targetScenario)) {
          errors.push({
            path: `/scenarios/${sIndex}/steps/${stepIndex}/scenario`,
            message: `Step references unknown scenario: "${targetScenario}"`,
          });
        }
      }
    });
  });

  if (errors.length > 0) {
    throw new ValidationError(
      `Reference validation failed with ${errors.length} error(s)`,
      errors
    );
  }
}

/**
 * Check for duplicate IDs
 * @param config - Validated diagram config
 * @throws ValidationError if duplicates found
 */
export function validateUniqueIds(config: DiagramConfig): void {
  const errors: ValidationErrorDetail[] = [];

  // Check node ID uniqueness
  const nodeIds = new Map<string, number>();
  config.nodes.forEach((node, index) => {
    if (nodeIds.has(node.id)) {
      errors.push({
        path: `/nodes/${index}/id`,
        message: `Duplicate node ID: "${node.id}" (first occurrence at index ${nodeIds.get(node.id)})`,
      });
    } else {
      nodeIds.set(node.id, index);
    }
  });

  // Check edge ID uniqueness
  const edgeIds = new Map<string, number>();
  config.edges?.forEach((edge, index) => {
    if (edgeIds.has(edge.id)) {
      errors.push({
        path: `/edges/${index}/id`,
        message: `Duplicate edge ID: "${edge.id}" (first occurrence at index ${edgeIds.get(edge.id)})`,
      });
    } else {
      edgeIds.set(edge.id, index);
    }
  });

  // Check scenario ID uniqueness
  const scenarioIds = new Map<string, number>();
  config.scenarios?.forEach((scenario, index) => {
    if (scenarioIds.has(scenario.id)) {
      errors.push({
        path: `/scenarios/${index}/id`,
        message: `Duplicate scenario ID: "${scenario.id}" (first occurrence at index ${scenarioIds.get(scenario.id)})`,
      });
    } else {
      scenarioIds.set(scenario.id, index);
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(
      `Duplicate ID validation failed with ${errors.length} error(s)`,
      errors
    );
  }
}

/**
 * Parser module - Unified YAML/JSON parsing and validation
 */

import { parseContent } from './yaml-parser';
import { validateDiagram, validateReferences, validateUniqueIds } from './validator';
import type { DiagramConfig } from '../types';

export { parseYaml, parseJson, parseContent } from './yaml-parser';
export { validateDiagram, validateReferences, validateUniqueIds } from './validator';

/** Parser options */
export interface ParserOptions {
  /** Source format hint */
  format?: 'yaml' | 'json';
  /** Skip reference validation */
  skipReferenceValidation?: boolean;
  /** Skip duplicate ID validation */
  skipUniqueIdValidation?: boolean;
}

/**
 * Parser class for AnimFlow DSL
 * Handles parsing and validation of YAML/JSON diagram definitions
 */
export class Parser {
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = options;
  }

  /**
   * Parse and validate an AnimFlow diagram definition
   * @param content - YAML or JSON string
   * @returns Validated DiagramConfig
   * @throws ParseError if parsing fails
   * @throws ValidationError if validation fails
   */
  parse(content: string): DiagramConfig {
    // Step 1: Parse YAML/JSON to object
    const data = parseContent(content, this.options.format);

    // Step 2: Validate against JSON Schema
    const config = validateDiagram(data);

    // Step 3: Validate unique IDs
    if (!this.options.skipUniqueIdValidation) {
      validateUniqueIds(config);
    }

    // Step 4: Validate cross-references
    if (!this.options.skipReferenceValidation) {
      validateReferences(config);
    }

    return config;
  }

  /**
   * Static convenience method for parsing
   * @param content - YAML or JSON string
   * @param options - Parser options
   * @returns Validated DiagramConfig
   */
  static parse(content: string, options?: ParserOptions): DiagramConfig {
    return new Parser(options).parse(content);
  }
}

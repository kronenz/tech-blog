/**
 * YAML Parser wrapper using js-yaml
 */

import yaml from 'js-yaml';
import { ParseError } from '../errors';

/**
 * Parse YAML string to JavaScript object
 * @param content - YAML string to parse
 * @returns Parsed JavaScript object
 * @throws ParseError if YAML is invalid
 */
export function parseYaml(content: string): unknown {
  try {
    return yaml.load(content);
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      const mark = error.mark;
      throw new ParseError(error.reason || 'Invalid YAML syntax', {
        line: mark?.line !== undefined ? mark.line + 1 : undefined,
        column: mark?.column !== undefined ? mark.column + 1 : undefined,
        source: content,
      });
    }
    throw new ParseError(
      error instanceof Error ? error.message : 'Unknown parsing error'
    );
  }
}

/**
 * Parse JSON string to JavaScript object
 * @param content - JSON string to parse
 * @returns Parsed JavaScript object
 * @throws ParseError if JSON is invalid
 */
export function parseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Try to extract line/column from error message
      const match = error.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1], 10) : undefined;

      let line: number | undefined;
      let column: number | undefined;

      if (position !== undefined) {
        const lines = content.slice(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      throw new ParseError(error.message, { line, column, source: content });
    }
    throw new ParseError(
      error instanceof Error ? error.message : 'Unknown parsing error'
    );
  }
}

/**
 * Detect format and parse content
 * @param content - YAML or JSON string
 * @param format - Optional format hint ('yaml' or 'json')
 * @returns Parsed JavaScript object
 */
export function parseContent(
  content: string,
  format?: 'yaml' | 'json'
): unknown {
  const trimmed = content.trim();

  // Auto-detect format if not specified
  if (!format) {
    // JSON starts with { or [
    format = trimmed.startsWith('{') || trimmed.startsWith('[') ? 'json' : 'yaml';
  }

  return format === 'json' ? parseJson(content) : parseYaml(content);
}

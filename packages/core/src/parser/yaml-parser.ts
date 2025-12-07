/**
 * YAML Parser wrapper using js-yaml
 */

import yaml from 'js-yaml';
import { ParseError } from '../errors';

/**
 * Fixes YAML indentation that may be stripped by MDX/JSX template literals.
 * This restores proper indentation based on YAML structure patterns.
 */
function fixYamlIndentation(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];

  // Root level keys in AnimFlow DSL
  const rootKeys = [
    'version:',
    'metadata:',
    'canvas:',
    'nodes:',
    'edges:',
    'scenarios:',
    'logging:',
  ];

  // Keys that start nested blocks (their children need indentation)
  const blockKeys = [
    'metadata:',
    'canvas:',
    'style:',
    'log:',
    'bounds:',
    'sections:',
    'logging:',
    'position:',
  ];

  // Container keys that have array children
  const arrayContainers = ['nodes:', 'edges:', 'scenarios:', 'steps:', 'sections:'];

  let indentLevel = 0;
  let inArrayItem = false;
  let arrayItemIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    // Check previous non-empty line
    let prevTrimmed = '';
    for (let j = result.length - 1; j >= 0; j--) {
      const pt = result[j].trim();
      if (pt) {
        prevTrimmed = pt;
        break;
      }
    }

    // Reset to root level for root keys
    if (rootKeys.some((k) => trimmed.startsWith(k) && !trimmed.startsWith('- '))) {
      indentLevel = 0;
      inArrayItem = false;
    }
    // Handle array items
    else if (trimmed.startsWith('- ')) {
      // Array items under containers
      if (arrayContainers.some((k) => prevTrimmed === k)) {
        indentLevel = 2;
      }
      inArrayItem = true;
      arrayItemIndent = indentLevel;
    }
    // Properties after array item marker on same line
    else if (inArrayItem && prevTrimmed.startsWith('- ')) {
      indentLevel = arrayItemIndent + 4; // Properties of array items get +4
    }
    // Block keys increase indent for next line
    else if (blockKeys.some((k) => prevTrimmed === k || prevTrimmed.endsWith(': ' + k.slice(0, -1)))) {
      indentLevel += 2;
    }
    // Array containers
    else if (arrayContainers.some((k) => prevTrimmed === k)) {
      indentLevel = 2;
    }

    result.push(' '.repeat(indentLevel) + trimmed);

    // Prepare for next iteration
    if (blockKeys.some((k) => trimmed === k)) {
      // Next line will need more indent
    } else if (arrayContainers.some((k) => trimmed === k)) {
      indentLevel = 2;
    }
  }

  return result.join('\n');
}

/**
 * Parse YAML string to JavaScript object
 * @param content - YAML string to parse
 * @returns Parsed JavaScript object
 * @throws ParseError if YAML is invalid
 */
export function parseYaml(content: string): unknown {
  // First try to parse as-is
  try {
    return yaml.load(content);
  } catch (firstError) {
    // If parsing fails, try fixing indentation (for MDX-stripped YAML)
    try {
      const fixed = fixYamlIndentation(content);
      return yaml.load(fixed);
    } catch {
      // If still fails, throw the original error for better debugging
    }

    // Throw original error with proper formatting
    if (firstError instanceof yaml.YAMLException) {
      const mark = firstError.mark;
      throw new ParseError(firstError.reason || 'Invalid YAML syntax', {
        line: mark?.line !== undefined ? mark.line + 1 : undefined,
        column: mark?.column !== undefined ? mark.column + 1 : undefined,
        source: content,
      });
    }
    throw new ParseError(
      firstError instanceof Error ? firstError.message : 'Unknown parsing error'
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

/**
 * YAML Parser wrapper using js-yaml
 */

import yaml from 'js-yaml';
import { ParseError } from '../errors';

/**
 * Fixes YAML indentation that may be stripped by MDX/JSX template literals.
 * Uses AnimFlow DSL schema knowledge to reconstruct proper indentation.
 *
 * Key insight: MDX strips leading whitespace from template literals.
 * The YAML still has newlines, just no indentation. We need to reconstruct
 * the hierarchy based on DSL structure knowledge.
 */
function fixYamlIndentation(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];

  // AnimFlow DSL root-level keys (must be at indent 0)
  const rootKeys = new Set([
    'version',
    'metadata',
    'canvas',
    'nodes',
    'edges',
    'scenarios',
    'logging',
  ]);

  // Keys that are children of root block keys (indent = 2)
  const metadataKeys = new Set(['title', 'description', 'author']);
  const canvasKeys = new Set(['width', 'height', 'sections', 'background']);
  const loggingKeys = new Set(['enabled', 'maxEntries', 'position']);

  // Use a stack to track indent levels
  // Stack entry: { indent: number, isArray: boolean, parentKey: string }
  const stack: Array<{ indent: number; isArray: boolean; parentKey: string }> = [
    { indent: 0, isArray: false, parentKey: '' }
  ];

  let prevWasArrayItemWithValue = false;
  let prevArrayItemIndent = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    const isArrayItem = trimmed.startsWith('- ');
    const endsWithColon = trimmed.endsWith(':');

    // Extract key name
    let keyName = '';
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      if (isArrayItem) {
        keyName = trimmed.slice(2, colonIdx).trim();
      } else {
        keyName = trimmed.slice(0, colonIdx).trim();
      }
    }

    let indent = stack[stack.length - 1].indent;
    const parentKey = stack[stack.length - 1].parentKey;

    // Determine indent based on context
    if (!isArrayItem && rootKeys.has(keyName)) {
      // Root-level key - always indent 0
      indent = 0;
      // Reset stack to root
      stack.length = 1;
      stack[0] = { indent: 0, isArray: false, parentKey: keyName };
      prevWasArrayItemWithValue = false;

      // If this root key ends with :, push a new context for its children
      if (endsWithColon) {
        stack.push({ indent: 2, isArray: false, parentKey: keyName });
      }
    } else if (metadataKeys.has(keyName) && parentKey === 'metadata') {
      // Child of metadata block
      indent = 2;
      prevWasArrayItemWithValue = false;
    } else if (canvasKeys.has(keyName) && parentKey === 'canvas') {
      // Child of canvas block
      indent = 2;
      prevWasArrayItemWithValue = false;
      if (keyName === 'sections' && endsWithColon) {
        stack.push({ indent: 4, isArray: true, parentKey: 'sections' });
      }
    } else if (loggingKeys.has(keyName) && parentKey === 'logging') {
      // Child of logging block
      indent = 2;
      prevWasArrayItemWithValue = false;
    } else if (isArrayItem) {
      // Array item
      indent = stack[stack.length - 1].indent;
      prevArrayItemIndent = indent;

      // Check if this opens a block (ends with :) or has inline properties
      if (endsWithColon) {
        // Array item that opens a block: "- action:"
        prevWasArrayItemWithValue = false;
        stack.push({ indent: indent + 4, isArray: false, parentKey: keyName });
      } else if (colonIdx > 0) {
        // Array item with inline value: "- id: foo"
        prevWasArrayItemWithValue = true;
      } else {
        prevWasArrayItemWithValue = false;
      }
    } else if (prevWasArrayItemWithValue) {
      // Property after array item with value, e.g., "type:" after "- id: foo"
      indent = prevArrayItemIndent + 2;
      prevWasArrayItemWithValue = !endsWithColon; // Continue if not opening block

      if (endsWithColon) {
        stack.push({ indent: indent + 2, isArray: false, parentKey: keyName });
      }
    } else if (endsWithColon) {
      // Block key - children will be indented
      stack.push({ indent: indent + 2, isArray: false, parentKey: keyName });
    }

    result.push(' '.repeat(indent) + trimmed);
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

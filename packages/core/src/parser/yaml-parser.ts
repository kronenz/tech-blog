/**
 * YAML Parser wrapper using js-yaml
 */

import yaml from 'js-yaml';
import { ParseError } from '../errors';

/**
 * Fixes YAML indentation that may be stripped by MDX/JSX template literals.
 *
 * MDX/Astro template literals strip ALL leading whitespace from each line,
 * then preserve relative indentation within nested structures. This means:
 * - `metadata:\n  title: "Test"` becomes `metadata:\ntitle: "Test"`
 * - `nodes:\n  - id: foo\n    type: box` becomes `nodes:\n- id: foo\n  type: box`
 *
 * Strategy: Track current context (root key) and add indentation to lines
 * that should be children of block keys but lost their leading indent.
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

  // Keys that are direct children of specific root block keys
  const childKeyMap: Record<string, Set<string>> = {
    metadata: new Set(['title', 'description', 'author', 'tags']),
    canvas: new Set(['width', 'height', 'sections', 'background']),
    logging: new Set(['enabled', 'maxEntries', 'position', 'timestampFormat', 'styles']),
  };

  // Track current root-level block (ends with ':')
  let currentRootBlock: string | null = null;
  // Accumulate indent offset for nested content
  let indentOffset = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    // Get the original indentation of this line
    const originalIndent = line.length - line.trimStart().length;

    // Extract key name (without considering array items)
    let keyName = '';
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0 && !trimmed.startsWith('- ')) {
      keyName = trimmed.slice(0, colonIdx).trim();
    }

    // Check if this is a root-level key (at original indent 0)
    if (rootKeys.has(keyName) && originalIndent === 0) {
      // This is a root key - it should stay at indent 0
      currentRootBlock = trimmed.endsWith(':') ? keyName : null;
      indentOffset = currentRootBlock ? 2 : 0;
      result.push(trimmed);
      continue;
    }

    // If we're inside a root block and line is at indent 0
    if (currentRootBlock && originalIndent === 0) {
      // Add indentation for this line
      result.push('  ' + trimmed);
      continue;
    }

    // For lines with existing indentation, add the offset if we're in a block
    if (currentRootBlock && originalIndent > 0 && indentOffset > 0) {
      result.push(' '.repeat(indentOffset) + line);
      continue;
    }

    // Default: preserve the line as-is
    result.push(line);
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
  // Always apply indentation fix first for MDX-stripped YAML
  // MDX template literals strip leading whitespace, causing YAML like:
  //   metadata:\n  title: "Test" -> metadata:\ntitle: "Test"
  // js-yaml parses this without error but creates wrong structure:
  //   { metadata: null, title: "Test" } instead of { metadata: { title: "Test" } }
  const fixed = fixYamlIndentation(content);

  try {
    return yaml.load(fixed);
  } catch (error) {
    // Throw error with proper formatting
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

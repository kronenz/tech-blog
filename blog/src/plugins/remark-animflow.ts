import type { Root, Code } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export interface AnimFlowCodeBlock {
  id?: string;
  title?: string;
  height?: number;
  rawYaml: string;
}

/**
 * Remark plugin to transform ```animflow code blocks into AnimFlowEmbed components
 */
export const remarkAnimflow: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang !== 'animflow' || !parent || typeof index !== 'number') {
        return;
      }

      // Parse meta string for options (e.g., title="Flow" height="500")
      const meta = node.meta || '';
      const titleMatch = meta.match(/title="([^"]+)"/);
      const heightMatch = meta.match(/height="?(\d+)"?/);
      const idMatch = meta.match(/id="([^"]+)"/);

      const title = titleMatch?.[1] || '';
      const height = heightMatch ? parseInt(heightMatch[1], 10) : 400;
      const id = idMatch?.[1] || `animflow-${index}`;

      // Escape the YAML content for safe embedding
      const escapedYaml = node.value
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');

      // Replace the code block with an MDX component
      const mdxNode = {
        type: 'mdxJsxFlowElement',
        name: 'AnimFlowEmbed',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'id', value: id },
          { type: 'mdxJsxAttribute', name: 'title', value: title },
          {
            type: 'mdxJsxAttribute',
            name: 'height',
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: String(height),
              data: {
                estree: {
                  type: 'Program',
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: { type: 'Literal', value: height, raw: String(height) },
                    },
                  ],
                  sourceType: 'module',
                },
              },
            },
          },
          { type: 'mdxJsxAttribute', name: 'yaml', value: node.value },
        ],
        children: [],
      };

      // Replace the code node with the MDX component
      parent.children.splice(index, 1, mdxNode as any);
    });
  };
};

export default remarkAnimflow;

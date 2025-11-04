import { visit } from 'unist-util-visit';

/**
 * Remark plugin to add copy buttons to code blocks
 * Runs before rehype, so we have access to raw code content
 */
export function remarkCodeBlock() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      // Store the code content as metadata that we can access later
      if (!node.data) {
        node.data = {};
      }
      if (!node.data.hProperties) {
        node.data.hProperties = {};
      }

      // Add the code content as a data attribute
      node.data.hProperties['data-code'] = node.value || '';
      node.data.hProperties['data-language'] = node.lang || 'bash';
    });
  };
}

import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to wrap code blocks with copy button
 * This runs after markdown is converted to HTML
 */
export function rehypeWrapCode() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Look for <pre><code> structure
      if (
        node.tagName === 'pre' &&
        node.children &&
        node.children[0] &&
        node.children[0].tagName === 'code'
      ) {
        const codeNode = node.children[0];
        const codeContent = codeNode.properties?.['data-code'] || '';

        // Skip if no code content
        if (!codeContent) {
          return;
        }

        // Create wrapper with copy button
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['code-block-wrapper', 'mb-4']
          },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: ['code-block', 'relative', 'bg-bg-card', 'border', 'border-border-default', 'rounded-lg', 'overflow-hidden']
              },
              children: [
                {
                  type: 'element',
                  tagName: 'button',
                  properties: {
                    className: ['copy-button', 'absolute', 'top-3.5', 'right-4', 'bg-bg-deep', 'rounded', 'text-text-secondary', 'hover:text-lime-green', 'transition-colors', 'text-base', 'z-10', 'focus:outline-none', 'p-2'],
                    'data-code': codeContent,
                    'aria-label': 'Copy code to clipboard'
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'i',
                      properties: {
                        className: ['fa-solid', 'fa-copy']
                      },
                      children: []
                    }
                  ]
                },
                // Keep the original pre>code structure
                node
              ]
            }
          ]
        };

        // Replace in parent
        if (parent && typeof index === 'number') {
          parent.children[index] = wrapper;
        }
      }
    });
  };
}

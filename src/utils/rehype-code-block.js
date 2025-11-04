import { visit } from 'unist-util-visit';

/**
 * Recursively extract all text content from a node
 */
function extractText(node) {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}

/**
 * Rehype plugin to convert code blocks to use our CodeBlock component
 */
export function rehypeCodeBlock() {
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

        // Extract text content - handle both processed and unprocessed nodes
        let codeContent = '';
        if (codeNode.children && codeNode.children.length > 0) {
          codeContent = extractText(codeNode);
        }

        // If still empty, this might be a processed node with value property
        if (!codeContent && codeNode.value) {
          codeContent = codeNode.value;
        }

        // Skip if we still don't have content
        if (!codeContent || codeContent.trim() === '') {
          return;
        }

        // Extract language from class (e.g., "language-bash")
        let language = 'bash';
        if (codeNode.properties && codeNode.properties.className) {
          const classes = codeNode.properties.className;
          const langClass = classes.find((cls) => cls.startsWith('language-'));
          if (langClass) {
            language = langClass.replace('language-', '');
          }
        }

        // Replace the <pre> node with our CodeBlock component
        const newNode = {
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
                    className: ['copy-button', 'absolute', 'top-3.5', 'right-4', 'bg-bg-deep', 'rounded', 'text-text-secondary', 'hover:text-lime-green', 'transition-colors', 'text-base', 'z-10', 'focus:outline-none'],
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
                {
                  type: 'element',
                  tagName: 'pre',
                  properties: {
                    className: ['block', 'm-0', 'p-4', 'pr-28', 'min-h-12', 'overflow-x-auto', 'text-sm', 'bg-transparent']
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'code',
                      properties: {
                        className: [`language-${language}`, 'block', 'font-mono', 'text-sm', 'leading-relaxed', 'text-text-primary']
                      },
                      children: [
                        {
                          type: 'text',
                          value: codeContent
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        };

        // Replace the node in the parent
        if (parent && typeof index === 'number') {
          parent.children[index] = newNode;
        }
      }
    });
  };
}

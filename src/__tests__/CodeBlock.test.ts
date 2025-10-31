import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import CodeBlock from '../components/CodeBlock.astro';

describe('CodeBlock Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with basic props', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: { code: 'npm install' },
    });

    expect(result).toContain('npm install');
    expect(result).toContain('code-block-wrapper');
    expect(result).toContain('copy-button');
  });

  it('should render with title prop', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: {
        code: 'echo "Hello"',
        title: 'Example Command',
      },
    });

    expect(result).toContain('Example Command');
    expect(result).toContain('code-block-title');
    expect(result).toContain('echo');
    expect(result).toContain('Hello');
  });

  it('should apply language class', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: {
        code: 'console.log("test")',
        language: 'javascript',
      },
    });

    expect(result).toContain('language-js');
    expect(result).toContain('console.log');
    expect(result).toContain('test');
  });

  it('should default to bash language', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: { code: 'ls -la' },
    });

    expect(result).toContain('language-bash');
  });

  it('should handle python language', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: {
        code: 'print("hello")',
        language: 'python',
      },
    });

    expect(result).toContain('language-python');
    expect(result).toContain('print');
    expect(result).toContain('hello');
  });

  it('should include copy button with data-code attribute', async () => {
    const testCode = 'npm run build';
    const result = await container.renderToString(CodeBlock, {
      props: { code: testCode },
    });

    expect(result).toContain('copy-button');
    expect(result).toContain(`data-code="${testCode}"`);
    expect(result).toContain('fa-copy');
  });

  it('should include ARIA label for accessibility', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: { code: 'test' },
    });

    expect(result).toContain('aria-label="Copy code to clipboard"');
  });

  it('should render without title by default', async () => {
    const result = await container.renderToString(CodeBlock, {
      props: { code: 'test' },
    });

    expect(result).not.toContain('code-block-title');
  });

  it('should handle multi-line code', async () => {
    const multiLineCode = `npm install
npm run build
npm test`;
    const result = await container.renderToString(CodeBlock, {
      props: { code: multiLineCode },
    });

    expect(result).toContain('npm install');
    expect(result).toContain('npm run build');
    expect(result).toContain('npm test');
  });
});

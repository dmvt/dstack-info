import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import CommandOutput from '../components/CommandOutput.astro';

describe('CommandOutput Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with basic props', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Hello World',
      },
    });

    expect(result).toContain('command-output');
    expect(result).toContain('Hello World');
  });

  it('should render title when provided', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Test output',
        title: 'Command Result',
      },
    });

    expect(result).toContain('Command Result');
    expect(result).toContain('command-output-title');
  });

  it('should not render title section when title not provided', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Test',
      },
    });

    expect(result).not.toContain('command-output-title');
  });

  it('should default to default type', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Test',
      },
    });

    expect(result).toContain('border-border-default');
  });

  it('should render success type correctly', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Success!',
        type: 'success',
      },
    });

    expect(result).toContain('border-lime-green');
    expect(result).toContain('text-lime-green');
  });

  it('should render error type correctly', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Error occurred',
        type: 'error',
      },
    });

    expect(result).toContain('border-red-500');
    expect(result).toContain('text-red');
  });

  it('should render info type correctly', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Information',
        type: 'info',
      },
    });

    expect(result).toContain('border-cyber-blue');
    expect(result).toContain('text-cyber-blue');
  });

  it('should show prompt when showPrompt is true', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'npm install',
        showPrompt: true,
      },
    });

    expect(result).toContain('$ ');
  });

  it('should not show prompt by default', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'npm install',
      },
    });

    // Should contain the output but not the prompt
    expect(result).toContain('npm install');
    // Simple check: the prompt shouldn't appear right before output
    expect(result).not.toMatch(/>\$\s*npm install/);
  });

  it('should include pre and font-mono for monospace output', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Test',
      },
    });

    expect(result).toContain('<pre');
    expect(result).toContain('font-mono');
  });

  it('should handle multiline output', async () => {
    const multilineOutput = `Line 1
Line 2
Line 3`;
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: multilineOutput,
      },
    });

    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
    expect(result).toContain('Line 3');
  });

  it('should include command-output-body class', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Test',
      },
    });

    expect(result).toContain('command-output-body');
  });

  it('should use whitespace-pre-wrap for wrapping', async () => {
    const result = await container.renderToString(CommandOutput, {
      props: {
        output: 'Test',
      },
    });

    expect(result).toContain('whitespace-pre-wrap');
  });
});

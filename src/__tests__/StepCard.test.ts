import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import StepCard from '../components/StepCard.astro';

describe('StepCard Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with basic props', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 1,
        title: 'Install Dependencies',
      },
    });

    expect(result).toContain('step-card');
    expect(result).toContain('Install Dependencies');
    expect(result).toContain('1');
  });

  it('should render with description', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 2,
        title: 'Configure Server',
        description: 'Set up your server configuration files',
      },
    });

    expect(result).toContain('Configure Server');
    expect(result).toContain('Set up your server configuration files');
    expect(result).toContain('step-description');
  });

  it('should default to pending status', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 1,
        title: 'Test Step',
      },
    });

    expect(result).toContain('border-border-default');
    expect(result).toContain('bg-bg-deep');
    expect(result).toContain('1');
  });

  it('should render pending status correctly', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 1,
        title: 'Pending Step',
        status: 'pending',
      },
    });

    expect(result).toContain('border-border-default');
    expect(result).toContain('bg-bg-deep');
    expect(result).toContain('text-text-secondary');
    expect(result).toContain('1');
  });

  it('should render in-progress status correctly', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 2,
        title: 'In Progress Step',
        status: 'in-progress',
      },
    });

    expect(result).toContain('border-cyber-blue');
    expect(result).toContain('bg-cyber-blue');
    expect(result).toContain('fa-spinner');
    expect(result).toContain('fa-spin');
  });

  it('should render completed status correctly', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 3,
        title: 'Completed Step',
        status: 'completed',
      },
    });

    expect(result).toContain('border-lime-green');
    expect(result).toContain('bg-lime-green');
    expect(result).toContain('fa-check');
  });

  it('should render without description when not provided', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 1,
        title: 'Simple Step',
      },
    });

    expect(result).not.toContain('step-description');
  });

  it('should include step-title class', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 1,
        title: 'Test Title',
      },
    });

    expect(result).toContain('step-title');
    expect(result).toContain('Test Title');
  });

  it('should include step-number class', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 5,
        title: 'Test',
      },
    });

    expect(result).toContain('step-number');
    expect(result).toContain('5');
  });

  it('should handle different step numbers', async () => {
    const result = await container.renderToString(StepCard, {
      props: {
        stepNumber: 42,
        title: 'Step 42',
      },
    });

    expect(result).toContain('42');
  });
});

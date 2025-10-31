import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import ProgressTracker from '../components/ProgressTracker.astro';

describe('ProgressTracker Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with basic props', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 5,
      },
    });

    expect(result).toContain('progress-tracker');
    expect(result).toContain('5');
    expect(result).toContain('10');
  });

  it('should calculate percentage correctly', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 5,
      },
    });

    expect(result).toContain('50%');
    expect(result).toContain('width: 50%');
  });

  it('should show step count by default', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 20,
        completedSteps: 15,
      },
    });

    expect(result).toContain('15');
    expect(result).toContain('20');
    expect(result).toContain('steps completed');
  });

  it('should show percentage by default', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 4,
        completedSteps: 3,
      },
    });

    expect(result).toContain('75%');
    expect(result).toContain('progress-percentage');
  });

  it('should hide step count when showStepCount is false', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 5,
        showStepCount: false,
      },
    });

    expect(result).not.toContain('steps completed');
    expect(result).toContain('50%');
  });

  it('should hide percentage when showPercentage is false', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 5,
        showPercentage: false,
      },
    });

    expect(result).not.toContain('progress-percentage');
    expect(result).toContain('steps completed');
  });

  it('should display current step when provided', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 5,
        currentStep: 6,
      },
    });

    expect(result).toContain('Currently on step 6');
    expect(result).toContain('current-step');
  });

  it('should not display current step when not provided', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 5,
      },
    });

    expect(result).not.toContain('Currently on step');
    expect(result).not.toContain('current-step');
  });

  it('should use lime-green for 100% completion', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 10,
      },
    });

    expect(result).toContain('bg-lime-green');
    expect(result).toContain('100%');
  });

  it('should use cyber-blue for 50-99% completion', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 7,
      },
    });

    expect(result).toContain('bg-cyber-blue');
    expect(result).toContain('70%');
  });

  it('should use cyber-purple for under 50% completion', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 3,
      },
    });

    expect(result).toContain('bg-cyber-purple');
    expect(result).toContain('30%');
  });

  it('should include ARIA attributes for accessibility', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 6,
      },
    });

    expect(result).toContain('role="progressbar"');
    expect(result).toContain('aria-valuenow="60"');
    expect(result).toContain('aria-valuemin="0"');
    expect(result).toContain('aria-valuemax="100"');
    expect(result).toContain('aria-label');
  });

  it('should handle 0% completion', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 10,
        completedSteps: 0,
      },
    });

    expect(result).toContain('0%');
    expect(result).toContain('width: 0%');
  });

  it('should round percentage to whole number', async () => {
    const result = await container.renderToString(ProgressTracker, {
      props: {
        totalSteps: 3,
        completedSteps: 1,
      },
    });

    // 1/3 = 33.333... should round to 33
    expect(result).toContain('33%');
  });
});

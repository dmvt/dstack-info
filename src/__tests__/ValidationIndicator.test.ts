import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import ValidationIndicator from '../components/ValidationIndicator.astro';

describe('ValidationIndicator Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with basic props', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Install dependencies',
      },
    });

    expect(result).toContain('validation-indicator');
    expect(result).toContain('Install dependencies');
    expect(result).toContain('type="checkbox"');
  });

  it('should render unchecked by default', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test step',
      },
    });

    expect(result).not.toContain('checked=""');
    expect(result).not.toContain('checked="true"');
  });

  it('should render checked when checked prop is true', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Completed step',
        checked: true,
      },
    });

    // HTML5 boolean attributes can be 'checked' or 'checked=""'
    expect(result).toMatch(/checked["\s]/);
  });

  it('should include checkmark icon', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
      },
    });

    expect(result).toContain('fa-check');
  });

  it('should use custom ID when provided', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
        id: 'custom-checkbox-id',
      },
    });

    expect(result).toContain('id="custom-checkbox-id"');
  });

  it('should generate unique ID when not provided', async () => {
    const result1 = await container.renderToString(ValidationIndicator, {
      props: { label: 'Test 1' },
    });
    const result2 = await container.renderToString(ValidationIndicator, {
      props: { label: 'Test 2' },
    });

    // Both should have IDs
    expect(result1).toContain('id="validation-');
    expect(result2).toContain('id="validation-');

    // Extract IDs (simple check that they exist)
    const id1Match = result1.match(/id="validation-([^"]+)"/);
    const id2Match = result2.match(/id="validation-([^"]+)"/);

    expect(id1Match).toBeTruthy();
    expect(id2Match).toBeTruthy();
  });

  it('should include sr-only class on checkbox', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
      },
    });

    expect(result).toContain('sr-only');
  });

  it('should include peer class for Tailwind peer utilities', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
      },
    });

    expect(result).toContain('peer');
  });

  it('should include peer-checked utilities', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
      },
    });

    expect(result).toContain('peer-checked:');
  });

  it('should include cursor-pointer for clickability', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
      },
    });

    expect(result).toContain('cursor-pointer');
  });

  it('should include transition classes', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test',
      },
    });

    expect(result).toContain('transition');
  });

  it('should have validation-label class', async () => {
    const result = await container.renderToString(ValidationIndicator, {
      props: {
        label: 'Test label',
      },
    });

    expect(result).toContain('validation-label');
  });
});

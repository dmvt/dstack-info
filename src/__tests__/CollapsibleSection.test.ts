import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import CollapsibleSection from '../components/CollapsibleSection.astro';

describe('CollapsibleSection Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with basic props', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Troubleshooting',
      },
    });

    expect(result).toContain('collapsible-section');
    expect(result).toContain('Troubleshooting');
  });

  it('should default to collapsed state', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('aria-expanded="false"');
    expect(result).toContain('max-h-0');
  });

  it('should render open when defaultOpen is true', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
        defaultOpen: true,
      },
    });

    expect(result).toContain('aria-expanded="true"');
    expect(result).toContain('max-h-screen');
    expect(result).toContain('rotate-180');
  });

  it('should include chevron icon', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('fa-chevron-down');
    expect(result).toContain('collapsible-icon');
  });

  it('should have clickable header button', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('collapsible-header');
    expect(result).toContain('cursor-pointer');
    expect(result).toContain('<button');
  });

  it('should include ARIA attributes', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('aria-expanded');
    expect(result).toContain('aria-controls');
    expect(result).toContain('role="region"');
  });

  it('should render default variant correctly', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('border-border-default');
    expect(result).toContain('text-text-primary');
  });

  it('should render warning variant correctly', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Warning',
        variant: 'warning',
      },
    });

    expect(result).toContain('border-yellow-500');
    expect(result).toContain('text-yellow-500');
  });

  it('should render info variant correctly', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Information',
        variant: 'info',
      },
    });

    expect(result).toContain('border-cyber-blue');
    expect(result).toContain('text-cyber-blue');
  });

  it('should include collapsible-content class', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('collapsible-content');
  });

  it('should include collapsible-body class for slot content', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('collapsible-body');
  });

  it('should include transition classes', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('transition');
  });

  it('should have data-collapsible-trigger attribute', async () => {
    const result = await container.renderToString(CollapsibleSection, {
      props: {
        title: 'Test',
      },
    });

    expect(result).toContain('data-collapsible-trigger=');
  });

  it('should generate unique ID for content', async () => {
    const result1 = await container.renderToString(CollapsibleSection, {
      props: { title: 'Test 1' },
    });
    const result2 = await container.renderToString(CollapsibleSection, {
      props: { title: 'Test 2' },
    });

    // Both should have IDs
    expect(result1).toContain('id="collapsible-');
    expect(result2).toContain('id="collapsible-');
  });
});

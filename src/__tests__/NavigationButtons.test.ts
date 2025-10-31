import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import NavigationButtons from '../components/NavigationButtons.astro';

describe('NavigationButtons Component', () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render with both buttons enabled', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('navigation-buttons');
    expect(result).toContain('nav-previous');
    expect(result).toContain('nav-next');
    expect(result).toContain('href="/intro"');
    expect(result).toContain('href="/step-2"');
  });

  it('should use default labels when not provided', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('Previous');
    expect(result).toContain('Next');
  });

  it('should use custom labels when provided', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        previousLabel: 'Back to Introduction',
        nextUrl: '/step-2',
        nextLabel: 'Continue to Step 2',
      },
    });

    expect(result).toContain('Back to Introduction');
    expect(result).toContain('Continue to Step 2');
  });

  it('should render disabled previous button when no previousUrl', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('nav-previous-disabled');
    expect(result).toContain('cursor-not-allowed');
    expect(result).toContain('aria-disabled="true"');
    expect(result).not.toContain('href="/intro"');
  });

  it('should render disabled next button when no nextUrl', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
      },
    });

    expect(result).toContain('nav-next-disabled');
    expect(result).toContain('cursor-not-allowed');
    expect(result).toContain('aria-disabled="true"');
    expect(result).not.toContain('href="/step-2"');
  });

  it('should render both buttons disabled when no URLs provided', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {},
    });

    expect(result).toContain('nav-previous-disabled');
    expect(result).toContain('nav-next-disabled');
  });

  it('should include chevron icons', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('fa-chevron-left');
    expect(result).toContain('fa-chevron-right');
  });

  it('should include ARIA labels for enabled buttons', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        previousLabel: 'Intro',
        nextUrl: '/step-2',
        nextLabel: 'Step 2',
      },
    });

    expect(result).toContain('aria-label="Go to previous: Intro"');
    expect(result).toContain('aria-label="Go to next: Step 2"');
  });

  it('should have navigation role', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('aria-label="Tutorial navigation"');
  });

  it('should style previous button as secondary', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    // Previous button should have border and bg-bg-card
    expect(result).toContain('border-border-default');
    expect(result).toContain('bg-bg-card');
  });

  it('should style next button as primary (lime-green)', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    // Next button should have lime-green background
    expect(result).toContain('bg-lime-green');
    expect(result).toContain('text-bg-deep');
  });

  it('should include hover states', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('hover:');
  });

  it('should include transition classes', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    expect(result).toContain('transition');
  });

  it('should render as anchor tags when URLs provided', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {
        previousUrl: '/intro',
        nextUrl: '/step-2',
      },
    });

    // Should have <a> tags
    expect(result).toContain('<a');
    expect(result).toMatch(/<a[^>]*href="\/intro"/);
    expect(result).toMatch(/<a[^>]*href="\/step-2"/);
  });

  it('should render as divs when URLs not provided', async () => {
    const result = await container.renderToString(NavigationButtons, {
      props: {},
    });

    // Should have disabled divs
    expect(result).toContain('nav-previous-disabled');
    expect(result).toContain('nav-next-disabled');
    // Should not have <a> tags with hrefs
    expect(result).not.toContain('href=');
  });
});

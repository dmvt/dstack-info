import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import ComponentLayout from '../layouts/ComponentLayout.astro';

describe('ComponentLayout Component', () => {
	let container: AstroContainer;

	beforeAll(async () => {
		container = await AstroContainer.create();
	});

	it('should render with required title prop', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Component Library',
			},
		});

		expect(result).toContain('Component Library');
		expect(result).toContain('<h1');
	});

	it('should render with empty title', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: '',
			},
		});

		expect(result).toContain('text-lime-green');
		expect(result).toContain('text-cyber-blue');
		expect(result).toContain('dstack');
	});

	it('should render with description', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test Title',
				description: 'Test description',
			},
		});

		expect(result).toContain('Test description');
		expect(result).toContain('text-lg');
	});

	it('should not render description when not provided', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test Title',
			},
		});

		// Should not have a second paragraph after title
		const h1Index = result.indexOf('<h1');
		const h1End = result.indexOf('</h1>', h1Index);
		const nextPIndex = result.indexOf('<p', h1End);

		// If description exists, there should be a <p> tag right after h1
		// If not, the next <p> should be further away (in content slot)
		expect(nextPIndex === -1 || nextPIndex > h1End + 100).toBe(true);
	});

	it('should render component count', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
				componentCount: 7,
			},
		});

		expect(result).toContain('7 Interactive Components');
	});

	it('should render test count', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
				testCount: 90,
			},
		});

		expect(result).toContain('90 Tests Passing');
	});

	it('should render both component and test counts', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
				componentCount: 7,
				testCount: 90,
			},
		});

		expect(result).toContain('7 Interactive Components');
		expect(result).toContain('90 Tests Passing');
		expect(result).toContain('|'); // Separator between counts
	});

	it('should not render stats when counts not provided', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
			},
		});

		expect(result).not.toContain('Interactive Components');
		expect(result).not.toContain('Tests Passing');
	});

	it('should include TailwindCSS Only in stats', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
				componentCount: 7,
			},
		});

		expect(result).toContain('TailwindCSS Only');
	});

	it('should include Fully Accessible in stats', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
				testCount: 90,
			},
		});

		expect(result).toContain('Fully Accessible');
	});

	it('should include dstack branding colors', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Component Library',
			},
		});

		expect(result).toContain('text-lime-green');
		expect(result).toContain('text-cyber-blue');
	});

	it('should have centered layout', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
			},
		});

		expect(result).toContain('text-center');
		expect(result).toContain('max-w-4xl');
		expect(result).toContain('mx-auto');
	});

	it('should set correct page title format', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Component Library',
			},
		});

		expect(result).toContain('Component Library | dstack');
	});

	it('should apply responsive padding', async () => {
		const result = await container.renderToString(ComponentLayout, {
			props: {
				title: 'Test',
			},
		});

		expect(result).toContain('py-12');
		expect(result).toContain('px-4');
	});
});

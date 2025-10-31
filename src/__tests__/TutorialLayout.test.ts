import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import TutorialLayout from '../layouts/TutorialLayout.astro';

describe('TutorialLayout Component', () => {
	let container: AstroContainer;

	beforeAll(async () => {
		container = await AstroContainer.create();
	});

	it('should render with required title prop', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('Test Tutorial');
		expect(result).toContain('<h1');
	});

	it('should render with description', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				description: 'This is a test description',
			},
		});

		expect(result).toContain('This is a test description');
	});

	it('should render with custom section name', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				section: 'Installation',
			},
		});

		expect(result).toContain('Installation');
	});

	it('should render with default section name "Tutorial"', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('Tutorial');
	});

	it('should include sidebar navigation', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('<aside');
		expect(result).toContain('w-64');
		expect(result).toContain('Tutorial Sections');
	});

	it('should include dstack logo in sidebar', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('text-lime-green');
		expect(result).toContain('text-cyber-blue');
		expect(result).toContain('dstack');
	});

	it('should include breadcrumb navigation', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('<nav');
		expect(result).toContain('Home');
		expect(result).toContain('href="/"');
		expect(result).toContain('href="/tutorial"');
	});

	it('should render progress indicator when totalSteps and currentStep provided', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				totalSteps: 10,
				currentStep: 5,
			},
		});

		expect(result).toContain('Step 5 of 10');
		expect(result).toContain('50% Complete');
	});

	it('should not render progress indicator when steps not provided', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).not.toContain('Step');
		expect(result).not.toContain('Complete');
	});

	it('should calculate progress percentage correctly', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				totalSteps: 20,
				currentStep: 10,
			},
		});

		expect(result).toContain('50% Complete');
		expect(result).toContain('width: 50%');
	});

	it('should use lime-green for 100% progress', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				totalSteps: 10,
				currentStep: 10,
			},
		});

		expect(result).toContain('100% Complete');
		expect(result).toContain('bg-lime-green');
	});

	it('should use cyber-blue for 50-99% progress', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				totalSteps: 10,
				currentStep: 7,
			},
		});

		expect(result).toContain('70% Complete');
		expect(result).toContain('bg-cyber-blue');
	});

	it('should use cyber-purple for <50% progress', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
				totalSteps: 10,
				currentStep: 3,
			},
		});

		expect(result).toContain('30% Complete');
		expect(result).toContain('bg-cyber-purple');
	});

	it('should include main content area', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('<main');
		expect(result).toContain('max-w-4xl');
	});

	it('should have responsive sidebar (hidden on mobile)', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('hidden lg:block');
	});

	it('should apply tutorial-content styling to article', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Test Tutorial',
			},
		});

		expect(result).toContain('<article');
		expect(result).toContain('tutorial-content');
	});

	it('should set correct page title format', async () => {
		const result = await container.renderToString(TutorialLayout, {
			props: {
				title: 'Installation Guide',
			},
		});

		expect(result).toContain('Installation Guide | dstack Tutorial');
	});
});

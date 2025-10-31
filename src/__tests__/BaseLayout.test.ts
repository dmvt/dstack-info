import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect, beforeAll } from 'vitest';
import BaseLayout from '../layouts/BaseLayout.astro';

describe('BaseLayout Component', () => {
	let container: AstroContainer;

	beforeAll(async () => {
		container = await AstroContainer.create();
	});

	it('should render with default title and description', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('<html lang="en">');
		expect(result).toContain('dstack - Trusted Execution Environment Platform');
		expect(result).toContain('Build secure, decentralized applications with Intel TDX and AMD SEV-SNP support');
	});

	it('should render with custom title', async () => {
		const result = await container.renderToString(BaseLayout, {
			props: {
				title: 'Custom Page Title',
			},
		});

		expect(result).toContain('<title>Custom Page Title</title>');
		expect(result).not.toContain('dstack - Trusted Execution Environment Platform');
	});

	it('should render with custom description', async () => {
		const result = await container.renderToString(BaseLayout, {
			props: {
				description: 'Custom page description',
			},
		});

		expect(result).toContain('name="description" content="Custom page description"');
	});

	it('should render with both custom title and description', async () => {
		const result = await container.renderToString(BaseLayout, {
			props: {
				title: 'Test Title',
				description: 'Test description',
			},
		});

		expect(result).toContain('<title>Test Title</title>');
		expect(result).toContain('name="description" content="Test description"');
	});

	it('should include Font Awesome CSS', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('cdnjs.cloudflare.com/ajax/libs/font-awesome');
	});

	it('should include favicon', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('href="/favicon.svg"');
		expect(result).toContain('type="image/svg+xml"');
	});

	it('should include viewport meta tag', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('name="viewport"');
		expect(result).toContain('width=device-width');
	});

	it('should include charset meta tag', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('charset="utf-8"');
	});

	it('should apply base body styling classes', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('bg-bg-space');
		expect(result).toContain('text-text-primary');
	});

	it('should include generator meta tag', async () => {
		const result = await container.renderToString(BaseLayout);

		expect(result).toContain('name="generator"');
	});

	it('should have valid HTML structure', async () => {
		const result = await container.renderToString(BaseLayout);

		// Note: Astro Container API strips DOCTYPE during renderToString,
		// but it's present in the actual build output
		expect(result).toContain('<html');
		expect(result).toContain('<head>');
		expect(result).toContain('<body');
		expect(result).toContain('</body>');
		expect(result).toContain('</html>');
	});
});

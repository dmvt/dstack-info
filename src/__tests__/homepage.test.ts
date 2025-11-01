import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import IndexPage from '../pages/index.astro';

describe('Homepage', () => {
	describe('Navigation', () => {
		it('should render navigation with logo', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('<nav');
			expect(result).toContain('/logos/dstack-horizontal-light.svg');
			expect(result).toContain('alt="dstack"');
		});

		it('should have all navigation links', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('href="#what-is"');
			expect(result).toContain('href="#features"');
			expect(result).toContain('href="#use-cases"');
			expect(result).toContain('href="/tutorial"');
			expect(result).toContain('href="#examples"');
			expect(result).toContain('href="#getting-started"');
			expect(result).toContain('href="#resources"');
		});

		it('should have fixed positioning classes', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toMatch(/class="[^"]*fixed[^"]*"/);
			expect(result).toMatch(/class="[^"]*top-0[^"]*"/);
			expect(result).toMatch(/class="[^"]*z-50[^"]*"/);
		});
	});

	describe('Hero Section', () => {
		it('should render main heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Deploy Confidential Applications in Minutes');
		});

		it('should render subtitle', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('The open-source, developer-friendly TEE SDK for secure, attestable computing');
		});

		it('should have Linux Foundation badge', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Transitioning to Linux Foundation');
			expect(result).toContain('https://phala.com/posts/dstack-linux-foundation');
		});

		it('should have CTA buttons', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('href="#getting-started"');
			expect(result).toContain('Get Started');
			expect(result).toContain('https://github.com/Dstack-TEE/dstack');
			expect(result).toContain('View on GitHub');
		});

		it('should use gradient text classes', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('bg-gradient-to-r');
			expect(result).toContain('from-lime-green');
			expect(result).toContain('to-lime-green-bright');
			expect(result).toContain('bg-clip-text');
		});
	});

	describe('What is dstack Section', () => {
		it('should render section heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="what-is"');
			expect(result).toContain('What is dstack?');
		});

		it('should render section subtitle', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('A security-first SDK that simplifies deploying containerized applications into Trusted Execution Environments');
		});

		it('should have Developer-Friendly TEE Deployment content', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Developer-Friendly TEE Deployment');
			expect(result).toContain('docker-compose.yaml');
		});

		it('should list key benefits', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Zero Code Changes');
			expect(result).toContain('Hardware-Level Security');
			expect(result).toContain('Remote Attestation');
			expect(result).toContain('Vendor Independence');
		});

		it('should list architecture components', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Architecture Components');
			expect(result).toContain('dstack-vmm');
			expect(result).toContain('dstack-gateway');
			expect(result).toContain('dstack-kms');
			expect(result).toContain('dstack-guest-agent');
			expect(result).toContain('meta-dstack');
		});
	});

	describe('Features Section', () => {
		it('should render features heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="features"');
			expect(result).toContain('Why Choose dstack?');
		});

		it('should have 6 feature cards', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Docker Native');
			expect(result).toContain('Zero-Trust HTTPS');
			expect(result).toContain('Secret Management');
			expect(result).toContain('Remote Attestation');
			expect(result).toContain('Decentralized KMS');
			expect(result).toContain('Web Dashboard');
		});

		it('should have Font Awesome icons for features', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('fa-brands fa-docker');
			expect(result).toContain('fa-solid fa-shield-halved');
			expect(result).toContain('fa-solid fa-key');
			expect(result).toContain('fa-solid fa-certificate');
			expect(result).toContain('fa-solid fa-network-wired');
			expect(result).toContain('fa-solid fa-chart-line');
		});

		it('should use grid layout classes', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const featuresSection = result.split('id="features"')[1].split('id="use-cases"')[0];
			expect(featuresSection).toMatch(/class="[^"]*grid[^"]*"/);
			expect(featuresSection).toMatch(/md:grid-cols-2/);
			expect(featuresSection).toMatch(/lg:grid-cols-3/);
		});
	});

	describe('Use Cases Section', () => {
		it('should render use cases heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="use-cases"');
			expect(result).toContain('Real-World Applications');
		});

		it('should have 6 use case cards', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('AI Agents & Inference');
			expect(result).toContain('Programmable Privacy');
			expect(result).toContain('Blockchain Infrastructure');
			expect(result).toContain('Zero-Knowledge Proofs');
			expect(result).toContain('Web2-Web3 Identity');
			expect(result).toContain('Verifiable Frontends');
		});

		it('should list partners/users', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Used by: ai16z (Eliza)');
			expect(result).toContain('Used by: Encifher');
			expect(result).toContain('Used by: Phala Network L2');
		});
	});

	describe('Examples Section', () => {
		it('should render examples heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="examples"');
			expect(result).toContain('Example Projects');
		});

		it('should have 10 example cards', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('ConfigID-based Attestation');
			expect(result).toContain('Custom Domain');
			expect(result).toContain('SSH over Gateway');
			expect(result).toContain('TCP Port Forwarding');
			expect(result).toContain('Tor Hidden Service');
			expect(result).toContain('Timelock Decryption');
			expect(result).toContain('Blockchain Light Client');
			expect(result).toContain('Private Docker Registry');
			expect(result).toContain('Launcher Pattern');
			expect(result).toContain('Webshell');
		});

		it('should have link to examples repository', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('https://github.com/Dstack-TEE/dstack-examples');
			expect(result).toContain('Explore All Examples on GitHub');
		});

		it('should use responsive grid with 5 columns on xl', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const examplesSection = result.split('id="examples"')[1].split('id="getting-started"')[0];
			expect(examplesSection).toMatch(/xl:grid-cols-5/);
		});
	});

	describe('Getting Started Section', () => {
		it('should render getting started heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="getting-started"');
			expect(result).toContain('Get Started in Minutes');
		});

		it('should have 4 numbered steps', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Install Dependencies');
			expect(result).toContain('Clone & Build');
			expect(result).toContain('Launch Services');
			expect(result).toContain('Deploy Application');
		});

		it('should have code block with installation commands', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('sudo apt install build-essential');
			expect(result).toContain('git clone https://github.com/Dstack-TEE/dstack');
			expect(result).toContain('cd dstack');
		});

		it('should list TEE benefits in code block', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('✓ Remote attestation enabled');
			expect(result).toContain('✓ Automatic HTTPS with TLS certificates');
			expect(result).toContain('✓ Encrypted secrets management');
			expect(result).toContain('✓ Verifiable execution environment');
		});

		it('should link to documentation', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const gettingStartedSection = result.split('id="getting-started"')[1].split('id="ecosystem"')[0];
			expect(gettingStartedSection).toContain('href="/tutorial"');
			expect(gettingStartedSection).toContain('Read Full Documentation');
		});
	});

	describe('Ecosystem Section', () => {
		it('should render ecosystem heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="ecosystem"');
			expect(result).toContain('Ecosystem & Community');
		});

		it('should have 5 ecosystem partners', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('Linux Foundation');
			expect(result).toContain('Phala Network');
			expect(result).toContain('Flashbots');
			expect(result).toContain('ai16z');
			expect(result).toContain('Open Source');
		});

		it('should have links to partner sites', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('https://www.linuxfoundation.org/');
			expect(result).toContain('https://phala.com');
			expect(result).toContain('https://www.flashbots.net/');
			expect(result).toContain('https://github.com/ai16z');
		});
	});

	describe('Resources Section', () => {
		it('should render resources heading', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('id="resources"');
			expect(result).toContain('Developer Resources');
		});

		it('should have 4 resource cards', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const resourcesSection = result.split('id="resources"')[1].split('<footer')[0];
			expect(resourcesSection).toContain('Documentation');
			expect(resourcesSection).toContain('GitHub');
			expect(resourcesSection).toContain('Examples');
			expect(resourcesSection).toContain('Phala Cloud');
		});

		it('should have Font Awesome icons for resources', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const resourcesSection = result.split('id="resources"')[1].split('<footer')[0];
			expect(resourcesSection).toContain('fa-solid fa-book');
			expect(resourcesSection).toContain('fa-brands fa-github');
			expect(resourcesSection).toContain('fa-solid fa-rocket');
			expect(resourcesSection).toContain('fa-solid fa-cloud');
		});

		it('should link to resources', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const resourcesSection = result.split('id="resources"')[1].split('<footer')[0];
			expect(resourcesSection).toContain('href="/tutorial"');
			expect(resourcesSection).toContain('href="https://github.com/Dstack-TEE/dstack"');
			expect(resourcesSection).toContain('href="https://github.com/Dstack-TEE/dstack-examples"');
			expect(resourcesSection).toContain('href="https://phala.com"');
		});
	});

	describe('Footer', () => {
		it('should render footer', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('<footer');
		});

		it('should have footer links', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			const footer = result.split('<footer')[1];
			expect(footer).toContain('href="https://github.com/Dstack-TEE/dstack"');
			expect(footer).toContain('href="/tutorial"');
			expect(footer).toContain('href="https://github.com/Dstack-TEE/dstack-examples"');
			expect(footer).toContain('href="https://phala.com"');
			expect(footer).toContain('href="https://www.linuxfoundation.org/"');
		});

		it('should have copyright notice', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('© 2025 dstack');
			expect(result).toContain('Licensed under Apache 2.0');
		});
	});

	describe('Smooth Scroll Script', () => {
		it('should include script tag reference', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			// Astro compiles scripts as separate files in production
			// Check for script module reference
			expect(result).toMatch(/<script[^>]*src[^>]*>/);
		});
	});

	describe('Responsive Design', () => {
		it('should have mobile-hidden navigation on small screens', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toMatch(/class="[^"]*hidden[^"]*md:flex[^"]*"/);
		});

		it('should use responsive text sizes', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toMatch(/text-5xl[^"]*md:text-6xl/);
			expect(result).toMatch(/text-xl[^"]*md:text-2xl/);
		});

		it('should use responsive grid columns', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('md:grid-cols-2');
			expect(result).toContain('lg:grid-cols-3');
			expect(result).toContain('lg:grid-cols-4');
			expect(result).toContain('lg:grid-cols-5');
		});
	});

	describe('SEO', () => {
		it('should have proper meta information', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('dstack - Deploy Confidential Applications in Minutes');
			expect(result).toContain('The open-source, developer-friendly TEE SDK for deploying confidential applications');
		});

		it('should have semantic HTML structure', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(IndexPage);

			expect(result).toContain('<nav');
			expect(result).toContain('<section');
			expect(result).toContain('<footer');
			expect(result).toContain('<h1');
			expect(result).toContain('<h2');
			expect(result).toContain('<h3');
		});
	});
});

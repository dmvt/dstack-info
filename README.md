# dstack.info Website

Modern, interactive website for dstack - the open-source, developer-friendly TEE SDK for deploying confidential applications.

**Live Site:** [dstack.info](https://dstack.info) | **Staging:** [dstack-info.pages.dev](https://dstack-info.pages.dev)

## Overview

This website serves as the primary resource hub for developers and organizations interested in deploying applications to Trusted Execution Environments (TEEs) using dstack.

Built with modern web technologies following Linux Foundation standards for production-quality, maintainable code.

## Technology Stack

- **[Astro 5.x](https://astro.build)** - Static site generation with Islands Architecture
- **[TailwindCSS 4.x](https://tailwindcss.com)** - Utility-first CSS framework (no custom style blocks)
- **[Svelte 5.x](https://svelte.dev)** - Interactive components (Islands)
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe development
- **[Vitest](https://vitest.dev)** - Unit testing (251 tests)
- **[Playwright](https://playwright.dev)** - E2E testing (42 tests)
- **[Cloudflare Pages](https://pages.cloudflare.com)** - Edge deployment

## Features

### Website Features
- **Responsive Design**: Mobile-first, works perfectly on all devices
- **Modern UI**: Dark theme with lime green accents
- **Interactive Tutorials**: Step-by-step guides with progress tracking
- **Search**: Find tutorials quickly with live search
- **Progress Tracking**: Tutorial completion persists in localStorage
- **SEO Optimized**: Meta tags and semantic HTML
- **Fast Loading**: Static generation + edge deployment

### Developer Features
- **Component System**: 7 reusable Astro components
- **Layout System**: 3 layouts (Base, Tutorial, Component)
- **Content Collections**: Type-safe tutorial content with Zod validation
- **Test Coverage**: 293 total tests (251 unit + 42 E2E)
- **TypeScript**: Full type safety
- **Git Best Practices**: GPG-signed commits, no AI attribution

## Getting Started

### Prerequisites

- **Node.js 23** (required)
- **npm** (comes with Node.js)
- **Git** with GPG signing configured

### Installation

```bash
# Clone repository
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install chromium
```

### Development

```bash
# Start dev server (http://localhost:4321)
npm run dev

# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests in UI mode
npm run e2e:ui

# Run E2E tests in debug mode
npm run e2e:debug

# Show E2E test report
npm run e2e:report

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
dstack-info/
├── src/
│   ├── components/          # Astro & Svelte components
│   │   ├── CodeBlock.astro
│   │   ├── CollapsibleSection.astro
│   │   ├── CommandOutput.astro
│   │   ├── NavigationButtons.astro
│   │   ├── ProgressTracker.astro
│   │   ├── StepCard.astro
│   │   ├── ValidationIndicator.astro
│   │   ├── TutorialProgress.svelte
│   │   ├── TutorialSidebar.svelte
│   │   └── TutorialSearch.svelte
│   ├── content/
│   │   ├── config.ts        # Content collections schema
│   │   └── tutorials/       # Tutorial markdown files
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── TutorialLayout.astro
│   │   └── ComponentLayout.astro
│   ├── pages/
│   │   ├── index.astro      # Homepage
│   │   ├── components-demo.astro
│   │   ├── layouts-demo.astro
│   │   └── tutorial/
│   │       ├── [...slug].astro  # Dynamic tutorial routes
│   │       └── sample.astro
│   ├── styles/
│   │   └── global.css       # Global styles & design tokens
│   ├── types/
│   │   └── tutorial.ts      # TypeScript types
│   ├── utils/
│   │   └── progress.ts      # Progress tracking utilities
│   └── __tests__/           # Unit tests (Vitest)
├── e2e/                     # E2E tests (Playwright)
│   ├── homepage.spec.ts
│   ├── tutorial-interactions.spec.ts
│   └── user-journeys.spec.ts
├── public/                  # Static assets
├── astro.config.mjs         # Astro configuration
├── tailwind.config.mjs      # TailwindCSS configuration
├── playwright.config.ts     # Playwright configuration
├── vitest.config.ts         # Vitest configuration
├── E2E_TESTING.md          # E2E testing guide
├── COMPONENTS.md           # Component documentation
└── TUTORIAL_PROGRESS.md    # Development progress tracking
```

## Testing

### Unit Tests (Vitest)

**251 tests** covering components, layouts, utilities, and content validation.

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch

# Run with UI
npm run test:ui
```

**Test Files:**
- Component tests: `src/__tests__/*.test.ts`
- Test all components, layouts, utilities
- Mock browser APIs (localStorage, window)
- Focus on business logic, not DOM rendering

### E2E Tests (Playwright)

**42 tests** validating complete user workflows in real browser.

```bash
# Run all E2E tests
npm run e2e

# Run in UI mode (interactive)
npm run e2e:ui

# Run in debug mode (step-through)
npm run e2e:debug

# Show HTML report from last run
npm run e2e:report
```

**Test Coverage:**
- 10 homepage tests (navigation, sections, CTAs, responsive)
- 20 tutorial interaction tests (progress, sidebar, search, navigation)
- 12 user journey tests (multi-page flows, state persistence)

**For detailed E2E testing documentation, see [E2E_TESTING.md](./E2E_TESTING.md)**

## Deployment

### Cloudflare Pages (Current)

```bash
# Build site
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=dstack-info

# Production: https://dstack.info
# Staging: https://dstack-info.pages.dev
```

**Deployment Process:**
1. Make changes and commit (GPG-signed)
2. Push to GitHub
3. Build: `npm run build`
4. Deploy: `npx wrangler pages deploy dist`
5. Test deployment URL
6. Update TUTORIAL_PROGRESS.md after approval

### Alternative Platforms

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
npm run build
# Deploy dist/ directory to gh-pages branch
```

## Content Management

### Adding Tutorials

1. Create markdown file in `src/content/tutorials/`:

```markdown
---
title: "Tutorial Title"
description: "Brief description"
section: "Getting Started"
stepNumber: 1
totalSteps: 5
lastUpdated: 2025-10-31
prerequisites:
  - "Ubuntu 22.04 or later"
tags:
  - "basics"
difficulty: "beginner"
estimatedTime: "15 minutes"
---

# Tutorial Title

Your tutorial content here...
```

2. Content automatically appears in:
   - Sidebar navigation (grouped by section)
   - Search results
   - Dynamic routes (`/tutorial/your-slug`)

### Styling Guidelines

**TailwindCSS-Only** (Core Principle #10):
- ALL styling uses TailwindCSS utility classes in HTML/JSX
- NO custom `<style>` blocks or inline styles for layout/spacing/colors
- Custom fonts defined in `global.css` @theme, used via Tailwind utilities
- Exception: Truly unique CSS that TailwindCSS cannot handle (rare)

**Design Tokens** (in `src/styles/global.css`):
```css
@theme {
  --color-lime-green: #C4F142;
  --color-cyber-blue: #42C4F1;
  --color-bg-space: #0A0B0F;
  --color-bg-deep: #12131A;
  --color-text-primary: #FFFFFF;
  /* ... more tokens */
}
```

## Component Documentation

For detailed component documentation, see [COMPONENTS.md](./COMPONENTS.md)

**Available Components:**
- **CodeBlock**: Syntax highlighting with copy button
- **StepCard**: Tutorial step display
- **ProgressTracker**: Visual progress bar
- **ValidationIndicator**: Interactive checkboxes
- **CommandOutput**: Terminal output display
- **CollapsibleSection**: Expandable content sections
- **NavigationButtons**: Prev/Next navigation
- **TutorialProgress** (Svelte): Tutorial completion tracking
- **TutorialSidebar** (Svelte): Dynamic navigation sidebar
- **TutorialSearch** (Svelte): Real-time tutorial search

## Development Workflow

### Core Principles

1. **NO SHORTCUTS** - Real, working implementations only
2. **Git Best Practices** - GPG-signed commits, no AI attribution
3. **Checkpoint-Driven** - Deploy after every commit, wait for approval
4. **Small Chunks** - Manageable, completable work units
5. **Documentation First** - Document while building
6. **Linux Foundation Standards** - Production-quality code
7. **Plan Adherence** - Follow PROJECT_PLAN.md strictly
8. **TailwindCSS-Only** - All styling via utility classes
9. **Test-Driven** - Write tests for new features
10. **Type-Safe** - Use TypeScript for all new code

### Making Changes

1. **Read documentation**: PROJECT_PLAN.md, TUTORIAL_PROGRESS.md
2. **Create branch** (if desired): `git checkout -b feature/name`
3. **Make changes** following core principles
4. **Test locally**: `npm test && npm run e2e && npm run build`
5. **Commit** (GPG-signed): `git commit -S -m "Description"`
6. **Push**: `git push`
7. **Deploy**: `npm run build && npx wrangler pages deploy dist`
8. **Verify**: Test deployment URL
9. **Update**: TUTORIAL_PROGRESS.md after approval

### Writing Tests

**Unit Tests** (for components, utilities):
```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Test logic
  });
});
```

**E2E Tests** (for user workflows):
```typescript
import { test, expect } from '@playwright/test';

test('should complete user journey', async ({ page }) => {
  await page.goto('/');
  // Test complete workflow
});
```

See [E2E_TESTING.md](./E2E_TESTING.md) for detailed testing guide.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- ✅ Static site generation (fast load times)
- ✅ Edge deployment (global CDN)
- ✅ Islands Architecture (minimal JavaScript)
- ✅ TailwindCSS purging (small CSS bundle)
- ✅ Image optimization
- ✅ Code splitting

## Contributing

### For Contributors

1. Read [PROJECT_PLAN.md](./PROJECT_PLAN.md) for overall plan
2. Read [TUTORIAL_PROGRESS.md](./TUTORIAL_PROGRESS.md) for current progress
3. Follow Core Principles & Methodology
4. Write tests for new features
5. Update documentation
6. Submit pull request with clear description

### For Maintainers

1. Review changes against PROJECT_PLAN.md
2. Verify tests pass: `npm test && npm run e2e`
3. Check code follows TailwindCSS-only principle
4. Ensure GPG-signed commits
5. Test deployment before merging
6. Update TUTORIAL_PROGRESS.md after merging

## Documentation

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Complete project plan and methodology
- **[TUTORIAL_PROGRESS.md](./TUTORIAL_PROGRESS.md)** - Development progress tracking
- **[COMPONENTS.md](./COMPONENTS.md)** - Component documentation
- **[E2E_TESTING.md](./E2E_TESTING.md)** - E2E testing guide
- **[ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md)** - Technology decisions

## License

This website is licensed under Apache 2.0, consistent with the dstack project.

## Links

- **Website**: [dstack.info](https://dstack.info)
- **GitHub**: [Dstack-TEE/dstack](https://github.com/Dstack-TEE/dstack)
- **Documentation**: [docs.phala.com/dstack](https://docs.phala.com/dstack/overview)
- **Examples**: [dstack-examples](https://github.com/Dstack-TEE/dstack-examples)

## Support

For questions or support:
- GitHub Issues: [dstack-TEE/dstack](https://github.com/Dstack-TEE/dstack/issues)
- Documentation: [docs.phala.com/dstack](https://docs.phala.com/dstack/overview)

---

**Built with modern web technologies for the dstack community**
**Transitioning to Linux Foundation**

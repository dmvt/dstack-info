# dstack Component Library Documentation

**Version:** 1.0.0 (Phase 0.3 Complete)
**Last Updated:** 2025-10-31
**Total Components:** 7
**Test Coverage:** 90 tests passing

---

## Table of Contents

1. [Overview](#overview)
2. [Component Catalog](#component-catalog)
   - [CodeBlock](#1-codeblock)
   - [StepCard](#2-stepcard)
   - [ProgressTracker](#3-progresstracker)
   - [ValidationIndicator](#4-validationindicator)
   - [CommandOutput](#5-commandoutput)
   - [CollapsibleSection](#6-collapsiblesection)
   - [NavigationButtons](#7-navigationbuttons)
3. [Design Principles](#design-principles)
4. [Testing](#testing)
5. [Contributing](#contributing)

---

## Overview

The dstack component library is a collection of interactive tutorial components built with **Astro** and **TailwindCSS**. These components are designed for creating engaging, accessible, and production-ready tutorial experiences for the dstack TEE platform.

### Key Features

- ✅ **TypeScript** - Full type safety with TypeScript props
- ✅ **TailwindCSS** - Utility-first CSS with no custom style blocks
- ✅ **Accessible** - ARIA labels, keyboard navigation, screen reader support
- ✅ **Responsive** - Mobile-first design that works on all devices
- ✅ **Tested** - 90 comprehensive tests with Vitest
- ✅ **Interactive** - Client-side JavaScript for enhanced UX

### Design Tokens

All components use the dstack design system defined in `src/styles/global.css`:

```css
--color-lime-green: #C4F142
--color-cyber-blue: #42C4F1
--color-cyber-purple: #4F42F1
--color-bg-space: #0A0B0F
--color-bg-deep: #12131A
--color-bg-card: #16171C
--color-text-primary: #FFFFFF
--color-text-secondary: #9CA3AF
--color-border-default: #2A2B35
```

---

## Component Catalog

### 1. CodeBlock

Syntax-highlighted code blocks with copy-to-clipboard functionality.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `code` | `string` | ✅ | - | The code to display |
| `language` | `'bash' \| 'javascript' \| 'typescript' \| 'python' \| 'yaml' \| 'json'` | ❌ | `'bash'` | Syntax highlighting language |
| `title` | `string` | ❌ | - | Optional title for the code block |
| `showLineNumbers` | `boolean` | ❌ | `false` | Show line numbers (not yet implemented) |

#### Usage

```astro
---
import CodeBlock from '../components/CodeBlock.astro';
---

<CodeBlock
  code="npm install dstack-cli"
  language="bash"
/>

<CodeBlock
  code={`cargo build --release
./target/release/vmm --version`}
  language="bash"
  title="Build VMM"
/>
```

#### Features

- FontAwesome copy icon
- Visual feedback on copy (checkmark icon)
- Error handling with X icon
- 2-second timeout before reset
- Monospace font with syntax highlighting classes

#### Tests

9 comprehensive tests covering rendering, props, copy functionality, and accessibility.

---

### 2. StepCard

Tutorial step cards with visual status indicators.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `stepNumber` | `number` | ✅ | - | Step number to display |
| `title` | `string` | ✅ | - | Step title |
| `description` | `string` | ❌ | - | Optional step description |
| `status` | `'pending' \| 'in-progress' \| 'completed'` | ❌ | `'pending'` | Step status |

#### Usage

```astro
---
import StepCard from '../components/StepCard.astro';
---

<StepCard
  stepNumber={1}
  title="Install Dependencies"
  description="Install all required packages for dstack"
  status="completed"
/>

<StepCard
  stepNumber={2}
  title="Configure Server"
  status="in-progress"
/>
```

#### Status Styling

- **Pending:** Gray border, number displayed
- **In-Progress:** Cyber-blue border, spinning icon
- **Completed:** Lime-green border, checkmark icon

#### Tests

10 comprehensive tests covering all status states, rendering, and props.

---

### 3. ProgressTracker

Visual progress bars showing tutorial completion.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `totalSteps` | `number` | ✅ | - | Total number of steps |
| `completedSteps` | `number` | ✅ | - | Number of completed steps |
| `currentStep` | `number` | ❌ | - | Current step number (optional) |
| `showPercentage` | `boolean` | ❌ | `true` | Show percentage |
| `showStepCount` | `boolean` | ❌ | `true` | Show step count |

#### Usage

```astro
---
import ProgressTracker from '../components/ProgressTracker.astro';
---

<ProgressTracker
  totalSteps={10}
  completedSteps={6}
  currentStep={7}
/>

<ProgressTracker
  totalSteps={20}
  completedSteps={20}
  showPercentage={false}
/>
```

#### Color Logic

- **< 50%:** Cyber-purple
- **50-99%:** Cyber-blue
- **100%:** Lime-green

#### Accessibility

- ARIA `progressbar` role
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes
- Descriptive `aria-label`

#### Tests

14 comprehensive tests covering percentage calculation, colors, and ARIA attributes.

---

### 4. ValidationIndicator

Interactive checkboxes for step validation and tracking.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `label` | `string` | ✅ | - | Checkbox label |
| `checked` | `boolean` | ❌ | `false` | Checked state |
| `id` | `string` | ❌ | auto-generated | Unique ID for checkbox |

#### Usage

```astro
---
import ValidationIndicator from '../components/ValidationIndicator.astro';
---

<ValidationIndicator
  label="Dependencies installed"
  checked={true}
/>

<ValidationIndicator
  label="Configuration complete"
  checked={false}
/>
```

#### Features

- Custom checkbox styling with TailwindCSS peer utilities
- Checkmark icon appears when checked
- Strikethrough text on completion
- Click label or checkbox to toggle
- Auto-generated unique IDs if not provided

#### Tests

12 comprehensive tests covering checked states, IDs, and styling.

---

### 5. CommandOutput

Terminal-style output display with type variants.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `output` | `string` | ✅ | - | Command output text |
| `title` | `string` | ❌ | - | Optional title |
| `type` | `'default' \| 'success' \| 'error' \| 'info'` | ❌ | `'default'` | Output type |
| `showPrompt` | `boolean` | ❌ | `false` | Show `$ ` prompt |

#### Usage

```astro
---
import CommandOutput from '../components/CommandOutput.astro';
---

<CommandOutput
  output="Build completed successfully!"
  title="Success"
  type="success"
/>

<CommandOutput
  output={`Error: compilation failed
  --> src/main.rs:42:5`}
  title="Build Error"
  type="error"
/>

<CommandOutput
  output="npm start"
  showPrompt={true}
/>
```

#### Type Styling

- **Success:** Green border and text
- **Error:** Red border and text
- **Info:** Cyber-blue border and text
- **Default:** Gray border and white text

#### Tests

13 comprehensive tests covering all types, prompts, and multiline output.

---

### 6. CollapsibleSection

Expandable/collapsible sections for troubleshooting and additional information.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | Section title |
| `defaultOpen` | `boolean` | ❌ | `false` | Initially expanded |
| `variant` | `'default' \| 'warning' \| 'info'` | ❌ | `'default'` | Visual variant |

#### Usage

```astro
---
import CollapsibleSection from '../components/CollapsibleSection.astro';
---

<CollapsibleSection title="Troubleshooting">
  <p>If you encounter errors, try these steps...</p>
  <ul>
    <li>Step 1</li>
    <li>Step 2</li>
  </ul>
</CollapsibleSection>

<CollapsibleSection
  title="Important Warning"
  variant="warning"
  defaultOpen={true}
>
  <p>⚠️ This is a warning message</p>
</CollapsibleSection>
```

#### Features

- Smooth expand/collapse animation
- Chevron icon rotates 180°
- Click anywhere on header to toggle
- Client-side JavaScript for interactivity
- ARIA `aria-expanded` and `aria-controls` attributes

#### Variant Styling

- **Default:** Gray border
- **Warning:** Yellow border and title
- **Info:** Cyber-blue border and title

#### Tests

14 comprehensive tests covering variants, default states, and ARIA attributes.

---

### 7. NavigationButtons

Previous/Next navigation buttons for tutorial pages.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `previousUrl` | `string` | ❌ | - | URL for previous page |
| `previousLabel` | `string` | ❌ | `'Previous'` | Previous button label |
| `nextUrl` | `string` | ❌ | - | URL for next page |
| `nextLabel` | `string` | ❌ | `'Next'` | Next button label |

#### Usage

```astro
---
import NavigationButtons from '../components/NavigationButtons.astro';
---

<!-- Both buttons -->
<NavigationButtons
  previousUrl="/tutorial/step-1"
  previousLabel="Introduction"
  nextUrl="/tutorial/step-3"
  nextLabel="Configuration"
/>

<!-- First page (no previous) -->
<NavigationButtons
  nextUrl="/tutorial/step-2"
  nextLabel="Get Started"
/>

<!-- Last page (no next) -->
<NavigationButtons
  previousUrl="/tutorial/step-9"
  previousLabel="Verification"
/>
```

#### Features

- Previous button: Secondary style (border, bg-card)
- Next button: Primary style (lime-green background)
- Disabled state when URL not provided
- Renders `<a>` tags when enabled, `<div>` when disabled
- Hover animations: border color change, icon slide
- ARIA labels with destination information

#### Tests

15 comprehensive tests covering all states, URLs, labels, and accessibility.

---

## Design Principles

### 1. TailwindCSS-Only Styling

All components use **exclusively** TailwindCSS utility classes. No custom `<style>` blocks are used (except where truly necessary for functionality that Tailwind cannot handle).

**Why?**
- Consistency across codebase
- Easier to maintain and modify
- Better for future contributors
- Leverages Tailwind's design system

### 2. TypeScript Props

All components have TypeScript interfaces defining their props with clear types and optional/required markers.

### 3. Accessibility First

Every component includes:
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML
- Proper focus management

### 4. Mobile Responsive

All components are built mobile-first and scale appropriately:
- Flexible layouts
- Touch-friendly targets
- Readable text at all sizes

### 5. Interactive Feedback

Components provide clear visual feedback:
- Hover states
- Click/press animations
- State changes (checked, expanded, etc.)
- Loading/progress indicators

---

## Testing

### Test Framework

- **Unit Tests:** Vitest with Astro Container API
- **Environment:** happy-dom (lightweight DOM)
- **Coverage:** 90 tests passing across 7 components

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Each component has comprehensive tests covering:
- Rendering with various props
- Default values
- Optional props
- State variations
- ARIA attributes
- Styling classes
- TypeScript type safety

### Example Test

```typescript
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
});
```

---

## Contributing

### Adding a New Component

1. Create component file in `src/components/`
2. Define TypeScript props interface
3. Use TailwindCSS-only styling
4. Include ARIA attributes
5. Add client-side script if needed
6. Create test file in `src/__tests__/`
7. Write comprehensive tests
8. Update this documentation
9. Add to components-demo.astro

### Component Checklist

- [ ] TypeScript props interface
- [ ] TailwindCSS-only styling
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Responsive design
- [ ] Comprehensive tests (10+ tests)
- [ ] Documentation in COMPONENTS.md
- [ ] Demo in components-demo.astro

### File Structure

```
src/
├── components/
│   ├── ComponentName.astro
│   └── ...
├── __tests__/
│   ├── ComponentName.test.ts
│   └── ...
└── pages/
    ├── components-demo.astro
    └── ...
```

---

## Resources

- **Live Demo:** https://dstack.info/components-demo
- **GitHub:** https://github.com/dmvt/dstack-info
- **Astro Docs:** https://docs.astro.build
- **TailwindCSS Docs:** https://tailwindcss.com
- **Vitest Docs:** https://vitest.dev

---

**Built with ❤️ for the dstack community**

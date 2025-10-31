# End-to-End Testing with Playwright

This document provides comprehensive guidance on running, writing, and maintaining E2E tests for the dstack-info website.

## Table of Contents

1. [Overview](#overview)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing New Tests](#writing-new-tests)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

### What is E2E Testing?

End-to-end (E2E) testing validates complete user workflows in a real browser environment. Unlike unit tests which test individual components in isolation, E2E tests verify that the entire application works correctly from the user's perspective.

### Technology Stack

- **Playwright**: Browser automation framework
- **Chromium**: Browser engine (can expand to Firefox/WebKit)
- **TypeScript**: Test language with type safety

### Current Test Coverage

**42 E2E Tests Total:**
- 10 homepage tests
- 20 tutorial interaction tests
- 12 user journey tests

**Test Execution Time:** ~11 seconds

---

## Running Tests

### Prerequisites

```bash
# Install dependencies (includes Playwright)
npm install

# Install Chromium browser (first time only)
npx playwright install chromium
```

### Basic Commands

```bash
# Run all E2E tests
npm run e2e

# Run tests in UI mode (interactive)
npm run e2e:ui

# Run tests in debug mode (step through)
npm run e2e:debug

# Show HTML test report from last run
npm run e2e:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run specific test suite
npx playwright test e2e/homepage.spec.ts -g "Homepage"

# Run specific test
npx playwright test e2e/homepage.spec.ts -g "should load homepage"
```

### Advanced Options

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium

# Run with screenshots/videos
npx playwright test --screenshot=on --video=on

# Run with trace (for debugging failures)
npx playwright test --trace=on
```

---

## Test Structure

### Test Files Organization

```
e2e/
├── homepage.spec.ts           # Homepage tests (10 tests)
├── tutorial-interactions.spec.ts  # Tutorial page interactions (20 tests)
└── user-journeys.spec.ts      # Complete user workflows (12 tests)
```

### Test File Anatomy

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Runs before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange: Set up test preconditions
    const button = page.locator('button.my-button');

    // Act: Perform the action
    await button.click();

    // Assert: Verify the outcome
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Configuration

E2E tests are configured in `playwright.config.ts`:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:4321`
- **Auto-start dev server**: Yes (via `webServer` config)
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Trace**: On first retry

---

## Writing New Tests

### Step 1: Determine Test Type

**Homepage Tests** (`homepage.spec.ts`):
- Navigation elements
- Section visibility
- CTAs and links
- Responsive design
- SEO elements

**Tutorial Interaction Tests** (`tutorial-interactions.spec.ts`):
- Component interactions
- Progress tracking
- Sidebar navigation
- Search functionality
- Navigation buttons

**User Journey Tests** (`user-journeys.spec.ts`):
- Multi-page workflows
- State persistence
- Complete user scenarios
- Discovery flows

### Step 2: Create Test Structure

```typescript
test.describe('Your Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to starting page
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');
  });

  test('should perform user action', async ({ page }) => {
    // Your test code here
  });
});
```

### Step 3: Select Elements with Locators

**Best Practices for Locators (in order of preference):**

1. **Role-based** (most resilient):
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   ```

2. **Test IDs** (explicit testing hooks):
   ```typescript
   page.getByTestId('submit-button')
   ```

3. **Text content**:
   ```typescript
   page.getByText('Submit')
   ```

4. **CSS selectors** (last resort):
   ```typescript
   page.locator('button.submit-btn')
   ```

**Handle Multiple Elements:**

```typescript
// Use .first() to avoid strict mode violations
const button = page.locator('button').first();

// Or be more specific
const navButton = page.locator('nav button');
```

### Step 4: Write Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toContainText('expected text');
await expect(element).toHaveText('exact text');

// Attributes
await expect(element).toHaveAttribute('href', '/path');
await expect(element).toHaveClass(/active/);

// State
await expect(checkbox).toBeChecked();
await expect(input).toHaveValue('value');

// URL
await expect(page).toHaveURL(/\/expected-path/);
await expect(page).toHaveTitle(/Page Title/);
```

### Step 5: Handle Async Operations

```typescript
// Wait for navigation
await page.goto('/path');
await page.waitForLoadState('networkidle');

// Wait for element
await page.waitForSelector('.my-element');

// Wait for timeout (use sparingly)
await page.waitForTimeout(300);

// Wait for URL change
await page.waitForURL('**/new-path');
```

---

## Best Practices

### 1. Avoid Playwright Strict Mode Violations

**Problem**: Locator matches multiple elements

```typescript
// ❌ Bad: Matches multiple buttons
const button = page.locator('button');
await button.click(); // Error: strict mode violation

// ✅ Good: Use .first() or be more specific
const button = page.locator('button').first();
// or
const button = page.locator('nav button');
```

### 2. Use Appropriate Waits

```typescript
// ✅ Good: Wait for network to be idle
await page.waitForLoadState('networkidle');

// ✅ Good: Wait for specific element
await page.waitForSelector('.content');

// ⚠️ Use sparingly: Fixed timeout
await page.waitForTimeout(300); // Only for animations/debounce
```

### 3. Clean Up After Tests

```typescript
test('should mark tutorial as complete', async ({ page }) => {
  // Mark as complete
  await progressButton.click();

  // Verify
  await expect(page.locator('text=Completed')).toBeVisible();

  // Clean up - unmark for next test
  await progressButton.click();
});
```

### 4. Test Real User Scenarios

```typescript
// ✅ Good: Test complete workflow
test('should complete checkout process', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByRole('button', { name: 'Place Order' }).click();
  await expect(page).toHaveURL(/\/confirmation/);
});

// ❌ Bad: Test implementation details
test('should call API endpoint', async ({ page }) => {
  // Don't test internal API calls in E2E tests
});
```

### 5. Use Descriptive Test Names

```typescript
// ✅ Good
test('should navigate from homepage to tutorial via hero CTA', async ({ page }) => {

// ❌ Bad
test('test 1', async ({ page }) => {
```

### 6. Group Related Tests

```typescript
test.describe('Progress Tracking', () => {
  test('should toggle completion state', async ({ page }) => {
    // ...
  });

  test('should persist across reload', async ({ page }) => {
    // ...
  });
});
```

### 7. Avoid Hard-Coded Waits

```typescript
// ❌ Bad
await page.waitForTimeout(5000);
await expect(element).toBeVisible();

// ✅ Good
await expect(element).toBeVisible(); // Has built-in retry logic
```

---

## Troubleshooting

### Common Issues

#### 1. Strict Mode Violations

**Error**: `strict mode violation: locator resolved to X elements`

**Solution**:
```typescript
// Use .first()
const element = page.locator('.my-class').first();

// Or be more specific
const element = page.locator('nav .my-class');
```

#### 2. Element Not Found

**Error**: `element(s) not found`

**Solutions**:
- Verify selector is correct
- Check if element exists in DOM
- Wait for page to load: `await page.waitForLoadState('networkidle')`
- Use Playwright Inspector: `npm run e2e:debug`

#### 3. Timeouts

**Error**: `Test timeout of 30000ms exceeded`

**Solutions**:
- Increase timeout for specific test:
  ```typescript
  test('slow test', async ({ page }) => {
    test.setTimeout(60000);
    // ...
  });
  ```
- Check if dev server started properly
- Verify network requests aren't hanging

#### 4. Flaky Tests

**Symptoms**: Tests pass sometimes, fail other times

**Solutions**:
- Add proper waits: `waitForLoadState('networkidle')`
- Avoid `waitForTimeout()` - use assertions instead
- Check for race conditions
- Use retry logic on CI: Configure in `playwright.config.ts`

#### 5. Dev Server Not Starting

**Error**: `webServer: http://localhost:4321 not available`

**Solutions**:
- Check if port 4321 is already in use: `lsof -i :4321`
- Kill existing process: `pkill -f "astro dev"`
- Increase timeout in `playwright.config.ts`:
  ```typescript
  webServer: {
    timeout: 120000, // 2 minutes
  }
  ```

### Debugging Tips

#### 1. Use Playwright Inspector

```bash
npm run e2e:debug
```

This opens an interactive debugger where you can:
- Step through tests line by line
- Inspect page state
- Try different selectors
- View screenshots

#### 2. Take Screenshots

```typescript
test('debug test', async ({ page }) => {
  await page.screenshot({ path: 'debug.png' });
});
```

#### 3. View HTML Report

```bash
npm run e2e:report
```

Shows:
- Test results
- Screenshots on failure
- Error context
- Execution timeline

#### 4. Enable Trace

```bash
npx playwright test --trace=on
```

Creates detailed trace files for failed tests with:
- DOM snapshots
- Network requests
- Console logs
- Action timeline

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Configuration for CI

In `playwright.config.ts`:

```typescript
export default defineConfig({
  // Fail build if test.only is left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Run tests serially on CI (more stable)
  workers: process.env.CI ? 1 : undefined,

  // Reporter for CI
  reporter: process.env.CI ? 'github' : 'html',
});
```

---

## Test Coverage Goals

### Current Coverage

- ✅ Homepage: Navigation, sections, CTAs, responsive design
- ✅ Tutorial Interactions: Progress, sidebar, search, navigation
- ✅ User Journeys: Multi-page flows, state persistence

### Future Test Ideas

- Error handling (404 pages, broken links)
- Accessibility (keyboard navigation, screen reader support)
- Performance (page load times, resource loading)
- Mobile-specific scenarios
- Browser compatibility (Firefox, WebKit)
- API integration points
- Form submissions
- Authentication flows (when added)

---

## Resources

### Official Documentation

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)

### Project Files

- `playwright.config.ts` - Playwright configuration
- `e2e/` - Test files directory
- `package.json` - Test scripts configuration

### Getting Help

1. Check this documentation
2. Review existing tests for examples
3. Use Playwright Inspector for debugging
4. Check Playwright documentation
5. Ask the team

---

## Maintenance

### Updating Tests

When the application changes:

1. Update affected test files
2. Run tests locally: `npm run e2e`
3. Verify all tests pass
4. Commit changes
5. Verify tests pass on CI

### Adding New Features

When adding new features:

1. Write E2E tests for the feature
2. Follow the structure in existing test files
3. Use appropriate test type (homepage/interactions/journeys)
4. Ensure tests are stable (no flakiness)
5. Update this documentation if needed

### Best Practices Review

Periodically review tests for:

- Flakiness (tests that occasionally fail)
- Slow tests (optimize or split)
- Outdated selectors
- Missing coverage
- Code duplication

---

**Last Updated:** 2025-10-31
**Maintainer:** dstack Team

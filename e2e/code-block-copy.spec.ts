import { test, expect } from '@playwright/test';

test.describe('Code Block Copy Functionality', () => {
  test('should display code blocks with copy buttons', async ({ page }) => {
    await page.goto('/tutorial/blockchain-setup');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that code blocks exist
    const codeBlocks = page.locator('.code-block-wrapper');
    await expect(codeBlocks.first()).toBeVisible();

    // Check that copy button exists
    const copyButton = page.locator('.copy-button').first();
    await expect(copyButton).toBeVisible();

    // Check that copy button has the copy icon
    const copyIcon = copyButton.locator('i.fa-copy');
    await expect(copyIcon).toBeVisible();
  });

  test('should have code text visible in code blocks', async ({ page }) => {
    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    // Find the first code block with "cast wallet new"
    const codeBlock = page.locator('code:has-text("cast wallet new")').first();
    await expect(codeBlock).toBeVisible();

    // Verify the text is actually visible (not just in the DOM)
    const textContent = await codeBlock.textContent();
    expect(textContent).toContain('cast wallet new');
  });

  test('should copy code to clipboard when copy button is clicked', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    // Find a specific code block with known content
    const targetCode = 'cast wallet new';
    const codeElement = page.locator(`code:has-text("${targetCode}")`).first();
    await expect(codeElement).toBeVisible();

    // Get the parent code-block wrapper
    const codeBlockWrapper = codeElement.locator('xpath=ancestor::div[contains(@class, "code-block")]').first();

    // Find the copy button within this code block
    const copyButton = codeBlockWrapper.locator('.copy-button').first();
    await expect(copyButton).toBeVisible();

    // Get the data-code attribute value (what should be copied)
    const expectedCode = await copyButton.getAttribute('data-code');
    expect(expectedCode).toBeTruthy();
    expect(expectedCode).toContain('cast wallet new');

    // Click the copy button
    await copyButton.click();

    // Wait a bit for the copy operation to complete
    await page.waitForTimeout(100);

    // Verify the clipboard contents
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(expectedCode);
  });

  test('should show success feedback after copying', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    const copyButton = page.locator('.copy-button').first();
    const icon = copyButton.locator('i').first();

    // Initial state should have copy icon
    await expect(icon).toHaveClass(/fa-copy/);

    // Click to copy
    await copyButton.click();

    // Should change to checkmark
    await expect(icon).toHaveClass(/fa-check/, { timeout: 1000 });

    // Should have lime-green class
    await expect(copyButton).toHaveClass(/text-lime-green/, { timeout: 1000 });

    // Wait for reset (2 seconds)
    await page.waitForTimeout(2500);

    // Should return to copy icon
    await expect(icon).toHaveClass(/fa-copy/);

    // Check that the text-lime-green class was removed (not hover:text-lime-green)
    const classes = await copyButton.getAttribute('class');
    expect(classes).not.toMatch(/^text-lime-green|[\s]text-lime-green/); // Don't match hover:text-lime-green
  });

  test('should have copy buttons for multiple code blocks', async ({ page }) => {
    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    // Count code blocks
    const codeBlocks = page.locator('.code-block-wrapper');
    const count = await codeBlocks.count();

    // Should have multiple code blocks (blockchain tutorial has many)
    expect(count).toBeGreaterThan(5);

    // Each should have a copy button
    const copyButtons = page.locator('.copy-button');
    const buttonCount = await copyButtons.count();
    expect(buttonCount).toBe(count);
  });

  test('should copy different content for different code blocks', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    // Get first two copy buttons
    const firstButton = page.locator('.copy-button').nth(0);
    const secondButton = page.locator('.copy-button').nth(1);

    // Get their data-code attributes
    const firstCode = await firstButton.getAttribute('data-code');
    const secondCode = await secondButton.getAttribute('data-code');

    // They should be different
    expect(firstCode).not.toBe(secondCode);

    // Copy from first button
    await firstButton.click();
    await page.waitForTimeout(100);
    const firstClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(firstClipboard).toBe(firstCode);

    // Copy from second button
    await secondButton.click();
    await page.waitForTimeout(100);
    const secondClipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(secondClipboard).toBe(secondCode);
  });

  test('should work on different tutorial pages', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Test on TDX hardware verification page
    await page.goto('/tutorial/tdx-hardware-verification');
    await page.waitForLoadState('networkidle');

    const copyButton = page.locator('.copy-button').first();
    await expect(copyButton).toBeVisible();

    // Get the code that should be copied
    const dataCode = await copyButton.getAttribute('data-code');
    expect(dataCode).toBeTruthy();

    // Click and verify copy works
    await copyButton.click();
    await page.waitForTimeout(100);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(dataCode);
  });

  test('should preserve code formatting including newlines', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    // Find a multi-line code block (the wallet creation example has multiple lines)
    const multiLineButton = page.locator('.copy-button').filter({
      has: page.locator('[data-code*="Successfully"]')
    }).first();

    if (await multiLineButton.count() > 0) {
      const dataCode = await multiLineButton.getAttribute('data-code');

      // Click to copy
      await multiLineButton.click();
      await page.waitForTimeout(100);

      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

      // Should preserve the exact content including newlines
      expect(clipboardText).toBe(dataCode);
    }
  });

  test('should have proper styling for code blocks', async ({ page }) => {
    await page.goto('/tutorial/blockchain-setup');
    await page.waitForLoadState('networkidle');

    const codeBlock = page.locator('.code-block').first();

    // Check for proper styling classes
    await expect(codeBlock).toHaveClass(/relative/);
    await expect(codeBlock).toHaveClass(/bg-bg-card/);
    await expect(codeBlock).toHaveClass(/border/);
    await expect(codeBlock).toHaveClass(/rounded-lg/);

    // Check that code text is visible (has color)
    const code = codeBlock.locator('code').first();
    const color = await code.evaluate((el) => window.getComputedStyle(el).color);

    // Should not be transparent or invisible
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
    expect(color).not.toBe('transparent');
  });
});

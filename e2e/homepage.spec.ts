import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/dstack - Deploy Confidential Applications in Minutes/);
  });

  test('should have navigation links', async ({ page }) => {
    // Check for navigation bar
    await expect(page.locator('nav')).toBeVisible();

    // Verify key navigation links exist in nav
    await expect(page.locator('nav a[href="#what-is"]')).toBeVisible();
    await expect(page.locator('nav a[href="#features"]')).toBeVisible();
    await expect(page.locator('nav a[href="#use-cases"]')).toBeVisible();
    await expect(page.locator('nav a[href="/tutorial"]')).toBeVisible();
  });

  test('should have hero section with CTAs', async ({ page }) => {
    // Check hero heading - use first() to get the main heading
    await expect(page.locator('h1').first()).toContainText('Deploy Confidential Applications in Minutes');

    // Check CTA buttons exist
    const getStartedBtn = page.locator('a[href="#getting-started"]').first();
    await expect(getStartedBtn).toBeVisible();
    await expect(getStartedBtn).toContainText('Get Started');

    const githubBtn = page.locator('a[href="https://github.com/Dstack-TEE/dstack"]').first();
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toContainText('View on GitHub');
  });

  test('should navigate to Getting Started section when clicking CTA', async ({ page }) => {
    // Click "Get Started" button
    await page.locator('a[href="#getting-started"]').first().click();

    // Wait for scroll and verify we're at the section
    await page.waitForTimeout(500);

    // Check that Getting Started section is in viewport
    const gettingStartedSection = page.locator('#getting-started');
    await expect(gettingStartedSection).toBeVisible();
  });

  test('should have all major sections', async ({ page }) => {
    // Verify all main sections exist
    await expect(page.locator('#what-is')).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
    await expect(page.locator('#use-cases')).toBeVisible();
    await expect(page.locator('#examples')).toBeVisible();
    await expect(page.locator('#getting-started')).toBeVisible();
    await expect(page.locator('#ecosystem')).toBeVisible();
    await expect(page.locator('#resources')).toBeVisible();
  });

  test('should have Linux Foundation badge', async ({ page }) => {
    const badge = page.locator('a[href="https://phala.com/posts/dstack-linux-foundation"]').first();
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Transitioning to Linux Foundation');
  });

  test('should have footer with links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Verify footer contains copyright
    await expect(footer).toContainText('© 2025 dstack');
    await expect(footer).toContainText('Licensed under Apache 2.0');
  });

  test('should have 6 feature cards', async ({ page }) => {
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    // Check for feature card text
    await expect(featuresSection).toContainText('Docker Native');
    await expect(featuresSection).toContainText('Zero-Trust HTTPS');
    await expect(featuresSection).toContainText('Secret Management');
    await expect(featuresSection).toContainText('Remote Attestation');
    await expect(featuresSection).toContainText('Decentralized KMS');
    await expect(featuresSection).toContainText('Web Dashboard');
  });

  test('should navigate to tutorials when clicking Tutorials link', async ({ page }) => {
    // Click tutorial link in nav
    await page.locator('nav a[href="/tutorial"]').click();

    // Wait for navigation (will redirect to first tutorial)
    await page.waitForURL('**/tutorial/**', { timeout: 5000 });

    // Verify we're on a tutorial page (should redirect to first incomplete tutorial)
    // First tutorial by section alphabetically is "Host Setup" > "tdx-hardware-verification"
    await expect(page).toHaveURL(/\/tutorial\/[a-z-]+/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still functional - use first h1
    await expect(page.locator('h1').first()).toBeVisible();

    // On mobile, nav links should be hidden
    const navLinks = page.locator('nav ul');
    await expect(navLinks).toHaveClass(/hidden/);
  });
});

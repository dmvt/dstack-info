import { test, expect } from '@playwright/test';

test.describe('User Journeys', () => {
  test.describe('Homepage to Tutorial Journey', () => {
    test('should navigate from homepage to tutorial via hero CTA', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click "Get Started" button in hero
      const getStartedBtn = page.locator('a[href="#getting-started"]').first();
      await getStartedBtn.click();
      await page.waitForTimeout(500);

      // Getting Started section should be visible
      await expect(page.locator('#getting-started')).toBeVisible();

      // Click "Read Full Documentation" button
      const docsBtn = page.locator('a[href="/tutorial/tdx-hardware-verification"]').first();
      await docsBtn.click();
      await page.waitForLoadState('networkidle');

      // Should be on tutorial page
      await expect(page).toHaveURL(/\/tutorial\/tdx-hardware-verification/);
      await expect(page.locator('h1').first()).toContainText('Hardware');
    });

    test('should navigate from homepage to tutorial via nav link', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click "Tutorials" link in nav
      const tutorialsLink = page.locator('nav a[href="/tutorial/tdx-hardware-verification"]');
      await tutorialsLink.click();
      await page.waitForLoadState('networkidle');

      // Should be on tutorial page
      await expect(page).toHaveURL(/\/tutorial\/tdx-hardware-verification/);
      await expect(page.locator('h1').first()).toContainText('Hardware');
    });

    test('should navigate from homepage to tutorial via resources section', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Scroll to resources section
      await page.locator('#resources').scrollIntoViewIfNeeded();

      // Click documentation card
      const docsCard = page.locator('#resources a[href="/tutorial/tdx-hardware-verification"]').first();
      await docsCard.click();
      await page.waitForLoadState('networkidle');

      // Should be on tutorial page
      await expect(page).toHaveURL(/\/tutorial\/tdx-hardware-verification/);
    });

    test('should return to homepage from tutorial', async ({ page }) => {
      // Start at tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Click logo/home link in sidebar
      const homeLink = page.locator('aside a[href="/"]');
      await homeLink.click();
      await page.waitForLoadState('networkidle');

      // Should be back on homepage
      await expect(page).toHaveURL('/');
      await expect(page.locator('h1').first()).toContainText('Deploy Confidential Applications');
    });
  });

  test.describe('Multi-Tutorial Completion Workflow', () => {
    test('should complete multiple tutorials and track progress', async ({ page }) => {
      // Start at first tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Mark first tutorial as complete
      const progressBtn1 = page.locator('button[aria-label*="Mark as"]');
      const heading1 = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text1 = await heading1.textContent();

      if (text1?.includes('Mark as Complete')) {
        await progressBtn1.click();
        await page.waitForTimeout(300);
      }

      // Verify it's marked complete
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Navigate to next tutorial using next button
      const nextBtn = page.locator('a.nav-next');
      await nextBtn.click();
      await page.waitForLoadState('networkidle');

      // Should be on tdx-software-setup (second tutorial)
      await expect(page).toHaveURL(/\/tutorial\/tdx-software-setup/);

      // Mark second tutorial as complete
      const progressBtn2 = page.locator('button[aria-label*="Mark as"]');
      const heading2 = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text2 = await heading2.textContent();

      if (text2?.includes('Mark as Complete')) {
        await progressBtn2.click();
        await page.waitForTimeout(300);
      }

      // Verify second tutorial is complete
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Navigate back to first tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // First tutorial should still be marked complete (persistence)
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Clean up - mark both as incomplete
      await progressBtn1.click();
      await page.waitForTimeout(300);
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');
      const cleanupBtn = page.locator('button[aria-label*="Mark as"]');
      await cleanupBtn.click();
      await page.waitForTimeout(300);
    });

    test('should navigate through all tutorials in sequence', async ({ page }) => {
      // Start at first tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Navigate through all tutorials using Next button
      const tutorialUrls = [
        '/tutorial/tdx-hardware-verification',
        '/tutorial/tdx-software-setup',
        '/tutorial/tdx-kernel-installation',
        '/tutorial/tdx-status-verification',
        '/tutorial/tdx-bios-configuration',
        '/tutorial/tdx-troubleshooting-next-steps',
      ];

      for (let i = 0; i < tutorialUrls.length - 1; i++) {
        // Verify current URL
        await expect(page).toHaveURL(new RegExp(tutorialUrls[i]));

        // Click next button
        const nextBtn = page.locator('a.nav-next');
        await nextBtn.click();
        await page.waitForLoadState('networkidle');
      }

      // Should be on last tutorial
      await expect(page).toHaveURL(/\/tutorial\/tdx-troubleshooting-next-steps/);

      // Last tutorial should not have a next button (or it should be disabled)
      const nextBtnDisabled = page.locator('div.nav-next-disabled');
      await expect(nextBtnDisabled).toBeVisible();
    });

    test('should navigate backwards through tutorials', async ({ page }) => {
      // Start at last tutorial
      await page.goto('/tutorial/tdx-troubleshooting-next-steps');
      await page.waitForLoadState('networkidle');

      // Navigate backwards using Previous button
      const tutorialUrls = [
        '/tutorial/tdx-troubleshooting-next-steps',
        '/tutorial/tdx-bios-configuration',
        '/tutorial/tdx-status-verification',
        '/tutorial/tdx-kernel-installation',
        '/tutorial/tdx-software-setup',
        '/tutorial/tdx-hardware-verification',
      ];

      for (let i = 0; i < tutorialUrls.length - 1; i++) {
        // Verify current URL
        await expect(page).toHaveURL(new RegExp(tutorialUrls[i]));

        // Click previous button
        const prevBtn = page.locator('a.nav-previous');
        await prevBtn.click();
        await page.waitForLoadState('networkidle');
      }

      // Should be on first tutorial
      await expect(page).toHaveURL(/\/tutorial\/tdx-hardware-verification/);

      // First tutorial should not have a previous button (or it should be disabled)
      const prevBtnDisabled = page.locator('div.nav-previous-disabled');
      await expect(prevBtnDisabled).toBeVisible();
    });
  });

  test.describe('Cross-Page State Persistence', () => {
    test('should persist progress across page reloads', async ({ page }) => {
      // Start at a tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Mark as complete
      const progressBtn = page.locator('button[aria-label*="Mark as"]');
      const heading = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text = await heading.textContent();

      if (text?.includes('Mark as Complete')) {
        await progressBtn.click();
        await page.waitForTimeout(300);
      }

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Progress should persist
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Clean up
      await progressBtn.click();
      await page.waitForTimeout(300);
    });

    test('should persist progress across navigation', async ({ page }) => {
      // Start at a tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Mark as complete
      const progressBtn = page.locator('button[aria-label*="Mark as"]');
      const heading = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text = await heading.textContent();

      if (text?.includes('Mark as Complete')) {
        await progressBtn.click();
        await page.waitForTimeout(300);
      }

      // Navigate to homepage
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigate back to tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Progress should persist
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Clean up
      await progressBtn.click();
      await page.waitForTimeout(300);
    });

    test('should persist progress in new browser tab', async ({ context }) => {
      // Create first page
      const page1 = await context.newPage();
      await page1.goto('/tutorial/tdx-hardware-verification');
      await page1.waitForLoadState('networkidle');

      // Mark as complete in first tab
      const progressBtn1 = page1.locator('button[aria-label*="Mark as"]');
      const heading1 = page1.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text1 = await heading1.textContent();

      if (text1?.includes('Mark as Complete')) {
        await progressBtn1.click();
        await page1.waitForTimeout(300);
      }

      // Create second page (new tab)
      const page2 = await context.newPage();
      await page2.goto('/tutorial/tdx-hardware-verification');
      await page2.waitForLoadState('networkidle');

      // Progress should be visible in second tab (localStorage is shared)
      await expect(page2.locator('text=Tutorial Completed!')).toBeVisible();

      // Clean up
      const cleanupBtn = page2.locator('button[aria-label*="Mark as"]');
      await cleanupBtn.click();
      await page2.waitForTimeout(300);

      await page1.close();
      await page2.close();
    });
  });

  test.describe('Search and Discovery Flow', () => {
    test('should find tutorial via search and complete it', async ({ page }) => {
      // Start at any tutorial page with sidebar
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Use search to find TDX Hardware tutorial
      const searchInput = page.locator('aside input[type="text"], aside input[placeholder*="search"]').first();
      await searchInput.fill('hardware');
      await page.waitForTimeout(300);

      // Click on tdx-hardware-verification from search/sidebar (use first() to avoid strict mode)
      const hardwareLink = page.locator('aside a[href="/tutorial/tdx-hardware-verification"]').first();
      await hardwareLink.click();
      await page.waitForLoadState('networkidle');

      // Should be on TDX hardware verification tutorial
      await expect(page).toHaveURL(/\/tutorial\/tdx-hardware-verification/);
      await expect(page.locator('h1').first()).toContainText('Hardware');

      // Mark as complete
      const progressBtn = page.locator('button[aria-label*="Mark as"]');
      const heading = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text = await heading.textContent();

      if (text?.includes('Mark as Complete')) {
        await progressBtn.click();
        await page.waitForTimeout(300);
      }

      // Verify completion
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Clean up
      await progressBtn.click();
      await page.waitForTimeout(300);
    });

    test('should clear search and browse all tutorials', async ({ page }) => {
      // Start at tutorial
      await page.goto('/tutorial/tdx-hardware-verification');
      await page.waitForLoadState('networkidle');

      // Search for something
      const searchInput = page.locator('aside input[type="text"], aside input[placeholder*="search"]').first();
      await searchInput.fill('deployment');
      await page.waitForTimeout(300);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(300);

      // All tutorials should be visible in sidebar
      const sidebarLinks = page.locator('aside a[href^="/tutorial/"]');
      const count = await sidebarLinks.count();
      expect(count).toBeGreaterThan(3); // Should have all 4 tutorials
    });
  });
});

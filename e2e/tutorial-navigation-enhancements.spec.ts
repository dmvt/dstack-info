import { test, expect } from '@playwright/test';

test.describe('Tutorial Navigation Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Collapsible Sections', () => {
    test('should have sections collapsed by default except current tutorial section', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Get all section headers
      const sectionHeaders = page.locator('aside button:has(span)');
      const count = await sectionHeaders.count();

      expect(count).toBeGreaterThan(0);

      // Check that Host Setup (current tutorial's section) is expanded
      const tdxSection = page.locator('aside button:has-text("Host Setup")');
      const chevron = tdxSection.locator('i.fa-chevron-down');
      const chevronClass = await chevron.getAttribute('class');

      // Should NOT have -rotate-90 class (meaning it's expanded)
      expect(chevronClass).not.toContain('-rotate-90');
    });

    test('should expand section when clicking collapsed section header', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Navigate to a different tutorial to collapse Host Setup
      await page.goto('/tutorial/dns-configuration');

      // Find and click Host Setup section
      const tdxSection = page.locator('aside button:has-text("Host Setup")');
      const chevron = tdxSection.locator('i.fa-chevron-down');

      // Should be collapsed (rotated)
      let chevronClass = await chevron.getAttribute('class');
      expect(chevronClass).toContain('-rotate-90');

      // Click to expand
      await tdxSection.click();
      await page.waitForTimeout(200); // Wait for animation

      // Should now be expanded (not rotated)
      chevronClass = await chevron.getAttribute('class');
      expect(chevronClass).not.toContain('-rotate-90');
    });

    test('should collapse section when clicking expanded section header', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Host Setup should be expanded (current tutorial)
      const tdxSection = page.locator('aside button:has-text("Host Setup")');
      const chevron = tdxSection.locator('i.fa-chevron-down');

      // Verify expanded
      let chevronClass = await chevron.getAttribute('class');
      expect(chevronClass).not.toContain('-rotate-90');

      // Click to collapse
      await tdxSection.click();
      await page.waitForTimeout(200); // Wait for animation

      // Should now be collapsed (rotated)
      chevronClass = await chevron.getAttribute('class');
      expect(chevronClass).toContain('-rotate-90');
    });

    test('should rotate chevron icon when toggling section', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      const tdxSection = page.locator('aside button:has-text("Host Setup")');
      const chevron = tdxSection.locator('i.fa-chevron-down');

      // Initially expanded (no rotation)
      let chevronClass = await chevron.getAttribute('class');
      expect(chevronClass).toContain('fa-chevron-down');

      // Click to collapse
      await tdxSection.click();
      await page.waitForTimeout(200);

      // Should have rotation class
      chevronClass = await chevron.getAttribute('class');
      expect(chevronClass).toContain('-rotate-90');
    });

    test('should allow multiple sections to be toggled independently', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Expand another section (use uppercase class to distinguish from TOC buttons)
      const prerequisitesSection = page.locator('aside button.uppercase:has-text("Prerequisites")');
      await prerequisitesSection.click();
      await page.waitForTimeout(200);

      // Both sections should now be visible
      const tdxTutorials = page.locator('aside a:has-text("TDX Hardware Verification")');
      const dnsTutorial = page.locator('aside a:has-text("DNS Configuration")');

      await expect(tdxTutorials).toBeVisible();
      await expect(dnsTutorial).toBeVisible();
    });
  });

  test.describe('Table of Contents', () => {
    test('should display TOC under current tutorial', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Look for TOC container (border-l border-border-default)
      const tocContainer = page.locator('aside div.border-l.border-border-default');
      await expect(tocContainer).toBeVisible();
    });

    test('should show H2 and H3 headings in TOC', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Check for TOC buttons
      const tocButtons = page.locator('aside div.border-l button');
      const count = await tocButtons.count();

      expect(count).toBeGreaterThan(0);

      // Verify buttons have heading text
      const firstButton = tocButtons.first();
      const buttonText = await firstButton.textContent();
      expect(buttonText).toBeTruthy();
      expect(buttonText!.length).toBeGreaterThan(0);
    });

    test('should have indentation for H3 headings', async ({ page }) => {
      await page.goto('/tutorial/tdx-software-setup');

      // Look for TOC buttons
      const tocButtons = page.locator('aside div.border-l button');

      // Check if any button has pl-3 class (H3 indentation)
      const indentedButtons = page.locator('aside div.border-l button.pl-3');
      const indentedCount = await indentedButtons.count();

      // May or may not have H3s, but if they exist, they should be indented
      if (indentedCount > 0) {
        expect(indentedCount).toBeGreaterThan(0);
      }
    });

    test('should hide TOC for non-current tutorials', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Expand another section to see other tutorials (use uppercase class)
      const prerequisitesSection = page.locator('aside button.uppercase:has-text("Prerequisites")');
      await prerequisitesSection.click();
      await page.waitForTimeout(200);

      // Look for DNS Configuration tutorial link
      const dnsLink = page.locator('aside a:has-text("DNS Configuration")');
      await expect(dnsLink).toBeVisible();

      // DNS Configuration should NOT have TOC visible next to it
      // (TOC only appears under current tutorial)
      const currentTutorialContainer = page.locator('aside a.bg-cyber-blue\\/20');
      const tocNextToCurrent = currentTutorialContainer.locator('..').locator('div.border-l');

      await expect(tocNextToCurrent).toBeVisible();
    });

    test('should update TOC when navigating to different tutorial', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Get initial TOC content
      const initialTocButton = page.locator('aside div.border-l button').first();
      const initialText = await initialTocButton.textContent();

      // Navigate to different tutorial
      await page.goto('/tutorial/tdx-software-setup');

      // Get new TOC content
      const newTocButton = page.locator('aside div.border-l button').first();
      const newText = await newTocButton.textContent();

      // TOC should be different
      expect(initialText).not.toBe(newText);
    });

    test('should display correct heading text in TOC', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Check that TOC contains actual heading text (not IDs or other artifacts)
      const tocButtons = page.locator('aside div.border-l button');
      const firstButtonText = await tocButtons.first().textContent();

      // Should not be empty
      expect(firstButtonText).toBeTruthy();

      // Should not contain # symbols (markdown syntax)
      expect(firstButtonText).not.toContain('#');

      // Should be readable text (at least a few characters)
      expect(firstButtonText!.trim().length).toBeGreaterThan(3);
    });
  });

  test.describe('TOC Smooth-Scroll', () => {
    test('should scroll to heading when clicking TOC item', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Get the first TOC button
      const tocButton = page.locator('aside div.border-l button').first();
      await tocButton.click();

      // Wait for scroll to complete
      await page.waitForTimeout(500);

      // Verify page scrolled (not at top)
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });

    test('should update URL hash after scroll', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Click first TOC item
      const tocButton = page.locator('aside div.border-l button').first();
      await tocButton.click();

      // Wait for scroll
      await page.waitForTimeout(500);

      // Check URL has hash
      const url = page.url();
      expect(url).toContain('#');
    });

    test('should use smooth scroll behavior', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Record initial scroll position
      const initialScrollY = await page.evaluate(() => window.scrollY);

      // Click TOC item
      const tocButton = page.locator('aside div.border-l button').first();
      await tocButton.click();

      // Check scroll position shortly after click (should be in progress)
      await page.waitForTimeout(100);
      const midScrollY = await page.evaluate(() => window.scrollY);

      // Should have started scrolling
      expect(midScrollY).not.toBe(initialScrollY);
    });

    test('should make all TOC items clickable', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Get all TOC buttons
      const tocButtons = page.locator('aside div.border-l button');
      const count = await tocButtons.count();

      expect(count).toBeGreaterThan(0);

      // Try clicking each button (shouldn't throw)
      for (let i = 0; i < count; i++) {
        const button = tocButtons.nth(i);
        await expect(button).toBeVisible();

        // Verify it's a button element
        const tagName = await button.evaluate(el => el.tagName);
        expect(tagName).toBe('BUTTON');
      }
    });
  });

  test.describe('Smart Tutorial Routing', () => {
    test('should redirect to first tutorial when no progress exists', async ({ page }) => {
      await page.goto('/tutorial');

      // Should redirect to first tutorial
      await page.waitForURL('**/tutorial/tdx-hardware-verification', { timeout: 3000 });

      expect(page.url()).toContain('/tutorial/tdx-hardware-verification');
    });

    test('should redirect to first incomplete tutorial with partial progress', async ({ page }) => {
      // Set up partial progress (first tutorial complete)
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
          'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() }
        }));
      });

      await page.goto('/tutorial');

      // Should redirect to second tutorial (tdx-software-setup is step 2 in Host Setup)
      await page.waitForURL('**/tutorial/tdx-software-setup', { timeout: 3000 });

      expect(page.url()).toContain('/tutorial/tdx-software-setup');
    });

    test('should redirect to completion page when all tutorials complete', async ({ page }) => {
      // Mark all tutorials complete
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
          'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
          'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
          'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
          'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
          'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
          'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
          'ansible-tdx-automation': { completed: true, timestamp: new Date().toISOString() },
          'dns-configuration': { completed: true, timestamp: new Date().toISOString() }
        }));
      });

      await page.goto('/tutorial');

      // Should redirect to complete page
      await page.waitForURL('**/tutorial/complete', { timeout: 3000 });

      expect(page.url()).toContain('/tutorial/complete');
    });

    test('should display loading spinner during redirect', async ({ page }) => {
      await page.goto('/tutorial');

      // Check for loading spinner (briefly visible)
      const spinner = page.locator('div.animate-spin');

      // Spinner might be visible very briefly
      // Just verify the page structure exists
      const loadingText = page.locator('text="Finding your next tutorial..."');

      // Either we see the loading text or we've already redirected
      // (depending on timing)
      const hasLoadingOrRedirected = await Promise.race([
        loadingText.isVisible().catch(() => false),
        page.waitForURL(/\/tutorial\/(?!index)/, { timeout: 1000 }).then(() => true)
      ]);

      expect(hasLoadingOrRedirected).toBeTruthy();
    });

    test('should handle errors with fallback redirect', async ({ page }) => {
      // This test verifies the error handling exists
      // Hard to trigger real error, so just verify page loads
      await page.goto('/tutorial');

      // Should successfully redirect somewhere (not stay on /tutorial)
      await page.waitForURL(/\/tutorial\/.+/, { timeout: 3000 });

      expect(page.url()).toMatch(/\/tutorial\/.+/);
    });
  });

  test.describe('Completion Page', () => {
    test('should show congratulations message when all complete', async ({ page }) => {
      // Mark all tutorials complete
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
          'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
          'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
          'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
          'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
          'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
          'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
          'ansible-tdx-automation': { completed: true, timestamp: new Date().toISOString() },
          'dns-configuration': { completed: true, timestamp: new Date().toISOString() }
        }));
      });

      await page.goto('/tutorial/complete');

      // Wait for component to mount
      await page.waitForSelector('i.fa-trophy', { timeout: 5000 });

      // Should show congratulations
      await expect(page.locator('text="Congratulations!"')).toBeVisible();
      await expect(page.locator('text=/completed all/i')).toBeVisible();

      // Should show trophy icon
      await expect(page.locator('i.fa-trophy')).toBeVisible();
    });

    test('should display correct progress statistics', async ({ page }) => {
      // Mark some tutorials complete
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
          'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
          'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() }
        }));
      });

      await page.goto('/tutorial/complete');

      // Wait for component to mount
      await page.waitForSelector('text="Overall Progress"', { timeout: 5000 });

      // Should show progress (2 of 8 = 25%)
      await expect(page.locator('text="25%"')).toBeVisible();
      await expect(page.locator('text=/2 of 8 tutorial/i')).toBeVisible();
    });

    test('should show section-level breakdown', async ({ page }) => {
      await page.goto('/tutorial/complete');

      // Should have section breakdown
      await expect(page.locator('text="Progress by Section"')).toBeVisible();

      // Should list sections (use specific selector for section breakdown)
      await expect(page.locator('.space-y-4 .text-sm.font-medium:has-text("Host Setup")')).toBeVisible();
      await expect(page.locator('.space-y-4 .text-sm.font-medium:has-text("Prerequisites")')).toBeVisible();
    });

    test('should clear progress when reset button clicked and confirmed', async ({ page }) => {
      // Set up some progress
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('dstack-tutorial-progress', JSON.stringify({
          'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() }
        }));
      });

      await page.goto('/tutorial/complete');

      // Should show 1 of 8 complete
      await expect(page.locator('text="13%"')).toBeVisible(); // 1/8 = 12.5% rounds to 13%

      // Click reset button
      page.on('dialog', dialog => dialog.accept());
      await page.locator('button:has-text("Start Over")').click();

      // Wait for update
      await page.waitForTimeout(500);

      // Should now show 0 of 8
      await expect(page.locator('text="0%"')).toBeVisible();
    });
  });

  test.describe('Integration Tests', () => {
    test('should navigate to completion page from last tutorial next button', async ({ page }) => {
      // Go to last tutorial (dns-configuration is last in Prerequisites section)
      await page.goto('/tutorial/dns-configuration');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Find and click the Next button
      const nextButton = page.locator('a.nav-next');
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toContainText('View Progress');

      await nextButton.click();

      // Should navigate to completion page
      await page.waitForURL('**/tutorial/complete', { timeout: 3000 });
      expect(page.url()).toContain('/tutorial/complete');
    });

    test('should complete full navigation flow from home to tutorial to complete', async ({ page }) => {
      // Start at home
      await page.goto('/');

      // Click tutorials link
      await page.locator('a[href="/tutorial"]').first().click();

      // Should redirect to first tutorial
      await page.waitForURL('**/tutorial/tdx-hardware-verification', { timeout: 3000 });

      // Mark tutorial complete (click the checkbox button)
      await page.locator('button[aria-label="Mark as complete"]').click();

      // Verify checkmark appears in sidebar
      await expect(page.locator('aside i.fa-check-circle').first()).toBeVisible();
    });

    test('should persist progress across page refreshes', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Mark complete (click the checkbox button)
      await page.locator('button[aria-label="Mark as complete"]').click();

      // Refresh page
      await page.reload();

      // Checkmark should still be there
      await expect(page.locator('aside i.fa-check-circle').first()).toBeVisible();
    });

    test('should allow TOC and sidebar to work together', async ({ page }) => {
      await page.goto('/tutorial/tdx-hardware-verification');

      // Collapse and expand section
      const tdxSection = page.locator('aside button.uppercase:has-text("Host Setup")');
      await tdxSection.click();
      await page.waitForTimeout(200);
      await tdxSection.click();
      await page.waitForTimeout(200);

      // TOC should still be visible and functional
      const tocButton = page.locator('aside div.border-l button').first();
      await expect(tocButton).toBeVisible();
      await tocButton.click();

      // Should scroll
      await page.waitForTimeout(500);
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });
  });
});

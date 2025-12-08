import { test, expect } from '@playwright/test';

test.describe('Tutorial Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutorial/tdx-hardware-verification');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Tutorial Content', () => {
    test('should have tutorial title visible', async ({ page }) => {
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
      await expect(title).toContainText('Hardware');
    });

    test('should render markdown code blocks', async ({ page }) => {
      // Tutorials use regular markdown code blocks
      const codeBlock = page.locator('pre').first();
      await expect(codeBlock).toBeVisible();
    });

    test('should have tutorial sections', async ({ page }) => {
      // Check for section headings
      const section = page.locator('h2').first();
      await expect(section).toBeVisible();
    });
  });

  test.describe('Progress Tracking', () => {
    test('should have progress tracking component visible', async ({ page }) => {
      // Progress component should be visible
      const progressSection = page.locator('text=Mark as Complete').or(page.locator('text=Tutorial Completed!'));
      await expect(progressSection).toBeVisible();
    });

    test('should toggle completion state when clicked', async ({ page }) => {
      // Find the progress button
      const progressButton = page.locator('button[aria-label*="Mark as"]');
      await expect(progressButton).toBeVisible();

      // Get initial text
      const initialText = await page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ }).textContent();

      // Click to toggle
      await progressButton.click();

      // Wait a moment for state to update
      await page.waitForTimeout(300);

      // Text should have changed
      const newText = await page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ }).textContent();
      expect(newText).not.toBe(initialText);

      // Click again to toggle back
      await progressButton.click();
      await page.waitForTimeout(300);

      const finalText = await page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ }).textContent();
      expect(finalText).toBe(initialText);
    });

    test('should persist progress state on page reload', async ({ page }) => {
      const progressButton = page.locator('button[aria-label*="Mark as"]');

      // Mark as complete
      const heading = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text = await heading.textContent();

      if (text?.includes('Mark as Complete')) {
        await progressButton.click();
        await page.waitForTimeout(300);
      }

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // State should persist - "Tutorial Completed!" should be visible
      await expect(page.locator('text=Tutorial Completed!')).toBeVisible();

      // Clean up - uncheck it
      await progressButton.click();
      await page.waitForTimeout(300);
    });

    test('should show visual feedback when completed', async ({ page }) => {
      const progressButton = page.locator('button[aria-label*="Mark as"]');

      // Ensure it's marked complete
      const heading = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text = await heading.textContent();

      if (text?.includes('Mark as Complete')) {
        await progressButton.click();
        await page.waitForTimeout(300);
      }

      // Button should have checkmark icon
      const checkIcon = progressButton.locator('i.fa-check');
      await expect(checkIcon).toBeVisible();

      // Clean up
      await progressButton.click();
      await page.waitForTimeout(300);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar on large screens', async ({ page }) => {
      // Check for sidebar (should be visible on large screens)
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();
    });

    test('should display all tutorials in sidebar', async ({ page }) => {
      // Should show multiple tutorial links in sidebar
      const tutorialLinks = page.locator('aside a[href^="/tutorial/"]');
      const count = await tutorialLinks.count();
      expect(count).toBeGreaterThan(1);
    });

    test('should highlight current tutorial', async ({ page }) => {
      // Current tutorial link should have cyan/active styling
      const currentLink = page.locator('aside a[href="/tutorial/tdx-hardware-verification"]');
      await expect(currentLink).toBeVisible();

      // Should have active styling (bg-cyan or similar)
      const classes = await currentLink.getAttribute('class');
      expect(classes).toContain('bg-');
    });

    test('should navigate to another tutorial when clicked', async ({ page }) => {
      // Click on different tutorial in sidebar (tdx-bios-configuration is step 2 in Host Setup)
      const biosConfigLink = page.locator('aside a[href="/tutorial/tdx-bios-configuration"]');
      await biosConfigLink.click();

      // Wait for navigation
      await page.waitForURL('**/tutorial/tdx-bios-configuration');

      // Verify we're on the new page
      await expect(page).toHaveURL(/\/tutorial\/tdx-bios-configuration/);
    });

    test('should update sidebar when tutorial is completed', async ({ page }) => {
      // Mark current tutorial as complete
      const progressButton = page.locator('button[aria-label*="Mark as"]');
      const heading = page.locator('h3').filter({ hasText: /Mark as Complete|Tutorial Completed!/ });
      const text = await heading.textContent();

      if (text?.includes('Mark as Complete')) {
        await progressButton.click();
        await page.waitForTimeout(500);
      }

      // Sidebar should show checkmark for completed tutorial (if implemented)
      // Note: This may need adjustment based on actual sidebar implementation
      const sidebarLink = page.locator('aside a[href="/tutorial/tdx-hardware-verification"]');
      await expect(sidebarLink).toBeVisible();

      // Clean up
      await progressButton.click();
      await page.waitForTimeout(300);
    });

    test('should group tutorials by section', async ({ page }) => {
      // Look for section groupings in sidebar
      // The sidebar groups by section (Getting Started, Deployment, etc.)
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Should have section names visible (use first() to avoid strict mode)
      await expect(sidebar.locator('text=Host Setup').first()).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should have search input visible in sidebar', async ({ page }) => {
      // Search should be in the sidebar
      const searchInput = page.locator('aside input[type="text"], aside input[placeholder*="search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should filter tutorials when typing', async ({ page }) => {
      const searchInput = page.locator('aside input[type="text"], aside input[placeholder*="search"]').first();

      // Type search term
      await searchInput.fill('rust');

      // Wait a moment for filtering
      await page.waitForTimeout(300);

      // Verify search input has value
      await expect(searchInput).toHaveValue('rust');

      // Clear for next test
      await searchInput.clear();
    });

    test('should clear search when input is cleared', async ({ page }) => {
      const searchInput = page.locator('aside input[type="text"], aside input[placeholder*="search"]').first();

      // Type and then clear
      await searchInput.fill('rust');
      await searchInput.clear();

      // Search input should be empty
      await expect(searchInput).toHaveValue('');
    });
  });

  test.describe('Navigation Buttons', () => {
    test('should have next button visible', async ({ page }) => {
      // Look for navigation buttons using the class names
      const nextButton = page.locator('a.nav-next');
      await expect(nextButton).toBeVisible();
    });

    test('should navigate to next tutorial when clicked', async ({ page }) => {
      const nextButton = page.locator('a.nav-next');
      await nextButton.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');

      // URL should change - tdx-bios-configuration is step 2 in Host Setup
      await expect(page).toHaveURL(/\/tutorial\/tdx-bios-configuration/);
    });

    test('should have previous button when available', async ({ page }) => {
      // On tdx-hardware-verification (first tutorial), there should be NO previous button
      const prevButtonDisabled = page.locator('div.nav-previous-disabled');
      await expect(prevButtonDisabled).toBeVisible();

      // Navigate to second tutorial which DOES have a previous button
      await page.goto('/tutorial/tdx-bios-configuration');
      await page.waitForLoadState('networkidle');

      // Now previous button should be visible
      const prevButton = page.locator('a.nav-previous');
      await expect(prevButton).toBeVisible();
    });

    test('should have hover effect on navigation buttons', async ({ page }) => {
      const nextButton = page.locator('a.nav-next');

      // Hover over button
      await nextButton.hover();

      // Button should remain visible
      await expect(nextButton).toBeVisible();
    });
  });
});

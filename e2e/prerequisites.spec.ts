import { test, expect } from '@playwright/test';

/**
 * E2E tests for prerequisite box functionality
 *
 * The prerequisite chain goes all the way back to tdx-hardware-verification:
 * tdx-hardware-verification -> tdx-software-setup -> tdx-kernel-installation -> tdx-status-verification
 * -> tdx-bios-configuration -> tdx-troubleshooting-next-steps -> system-baseline-dependencies
 * -> rust-toolchain-installation -> clone-build-dstack-vmm -> vmm-configuration -> vmm-service-setup
 * -> smart-contract-compilation -> contract-deployment -> kms-build-configuration -> kms-bootstrap
 *
 * The prerequisite box should:
 * 1. Not show if all prerequisites (and their prerequisites) are complete
 * 2. Show the nearest incomplete prerequisite in the chain
 * 3. Have proper styling (no bullet, no underline on hover, whole box shifts on hover)
 */

test.describe('Prerequisite Box Display Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should show prerequisite box when prerequisite is not complete', async ({ page }) => {
    // Go to a tutorial with prerequisites
    await page.goto('/tutorial/kms-bootstrap');

    // Should show the prerequisite box (use specific heading selector)
    const prereqBox = page.locator('h2').filter({ hasText: /^.?\s*Prerequisites$/ }).first();
    await expect(prereqBox).toBeVisible();

    // Should show tdx-hardware-verification as the deepest incomplete prerequisite
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toContainText('TDX Hardware Verification');
  });

  test('should hide prerequisite box when all prerequisites are complete', async ({ page }) => {
    // First mark ALL prerequisites in the chain as complete
    await page.goto('/tutorial/smart-contract-compilation');
    await page.evaluate(() => {
      const progress = {
        'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
        'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
        'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
        'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
        'dns-configuration': { completed: true, timestamp: new Date().toISOString() },
        'blockchain-setup': { completed: true, timestamp: new Date().toISOString() },
        'system-baseline-dependencies': { completed: true, timestamp: new Date().toISOString() },
        'rust-toolchain-installation': { completed: true, timestamp: new Date().toISOString() },
        'clone-build-dstack-vmm': { completed: true, timestamp: new Date().toISOString() },
        'vmm-configuration': { completed: true, timestamp: new Date().toISOString() },
        'vmm-service-setup': { completed: true, timestamp: new Date().toISOString() },
        'smart-contract-compilation': { completed: true, timestamp: new Date().toISOString() },
        'contract-deployment': { completed: true, timestamp: new Date().toISOString() },
        'kms-build-configuration': { completed: true, timestamp: new Date().toISOString() }
      };
      localStorage.setItem('dstack-tutorial-progress', JSON.stringify(progress));
    });

    // Go to kms-bootstrap
    await page.goto('/tutorial/kms-bootstrap');

    // Wait for the component to update
    await page.waitForTimeout(500);

    // Should NOT show the prerequisite box (the .prerequisite-link should not exist)
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).not.toBeVisible();
  });

  test('should show nearest incomplete prerequisite in chain - middle incomplete', async ({ page }) => {
    // Set up: complete everything up to vmm-service-setup, but leave smart-contract-compilation incomplete
    await page.goto('/tutorial/kms-bootstrap');
    await page.evaluate(() => {
      const progress = {
        'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
        'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
        'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
        'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
        'dns-configuration': { completed: true, timestamp: new Date().toISOString() },
        'blockchain-setup': { completed: true, timestamp: new Date().toISOString() },
        'system-baseline-dependencies': { completed: true, timestamp: new Date().toISOString() },
        'rust-toolchain-installation': { completed: true, timestamp: new Date().toISOString() },
        'clone-build-dstack-vmm': { completed: true, timestamp: new Date().toISOString() },
        'vmm-configuration': { completed: true, timestamp: new Date().toISOString() },
        'vmm-service-setup': { completed: true, timestamp: new Date().toISOString() }
        // smart-contract-compilation is NOT complete
      };
      localStorage.setItem('dstack-tutorial-progress', JSON.stringify(progress));
    });

    // Reload to pick up the changes
    await page.reload();
    await page.waitForTimeout(500);

    // Should show smart-contract-compilation as the nearest incomplete
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toContainText('Smart Contract Compilation');
  });

  test('should show deepest incomplete prerequisite when nothing is complete', async ({ page }) => {
    // Nothing is complete
    await page.goto('/tutorial/kms-bootstrap');
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Should show tdx-hardware-verification as the deepest incomplete
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toContainText('TDX Hardware Verification');
  });

  test('should show intermediate prerequisite when deeper ones are complete', async ({ page }) => {
    // Set up: complete TDX chain but not VMM chain
    await page.goto('/tutorial/clone-build-dstack-vmm');
    await page.evaluate(() => {
      const progress = {
        'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
        'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
        'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
        'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
        'dns-configuration': { completed: true, timestamp: new Date().toISOString() },
        'blockchain-setup': { completed: true, timestamp: new Date().toISOString() },
        'system-baseline-dependencies': { completed: true, timestamp: new Date().toISOString() }
        // rust-toolchain-installation NOT complete
      };
      localStorage.setItem('dstack-tutorial-progress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Should show rust-toolchain-installation
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toContainText('Rust Toolchain Installation');
  });

  test('should hide box after marking prerequisite complete via event', async ({ page }) => {
    // Go to a tutorial with a single-level prerequisite chain
    // rust-toolchain-installation -> system-baseline-dependencies -> ...
    // We'll complete the entire chain first, then check it hides
    await page.goto('/tutorial/rust-toolchain-installation');
    await page.evaluate(() => {
      // Complete all prerequisites for rust-toolchain-installation
      const progress = {
        'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
        'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
        'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
        'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
        'dns-configuration': { completed: true, timestamp: new Date().toISOString() },
        'blockchain-setup': { completed: true, timestamp: new Date().toISOString() },
        'system-baseline-dependencies': { completed: true, timestamp: new Date().toISOString() }
      };
      localStorage.setItem('dstack-tutorial-progress', JSON.stringify(progress));
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('tutorialProgressUpdate'));
    });

    // Wait for update
    await page.waitForTimeout(500);

    // Should hide the prerequisite box
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).not.toBeVisible();
  });
});

test.describe('Prerequisite Box Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should not have bullet point - prerequisite link is not inside a list', async ({ page }) => {
    await page.goto('/tutorial/kms-bootstrap');

    // Check that the prerequisite link exists
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toBeVisible();

    // The link should be a direct <a> element, not inside a <ul><li>
    const parentTagName = await prereqLink.evaluate(el => el.parentElement?.tagName);
    expect(parentTagName).not.toBe('LI');
  });

  test('should not show underline on hover', async ({ page }) => {
    await page.goto('/tutorial/kms-bootstrap');

    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toBeVisible();

    // Hover over the link
    await prereqLink.hover();
    await page.waitForTimeout(100);

    // Check that text-decoration is none
    const textDecoration = await prereqLink.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.textDecorationLine || style.textDecoration;
    });

    expect(textDecoration).toMatch(/none/);
  });

  test('should shift entire box on hover', async ({ page }) => {
    await page.goto('/tutorial/kms-bootstrap');

    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toBeVisible();

    // Get initial position
    const initialBox = await prereqLink.boundingBox();

    // Hover over the link
    await prereqLink.hover();

    // Wait for transition
    await page.waitForTimeout(300);

    // Get position after hover
    const hoverBox = await prereqLink.boundingBox();

    // X position should have increased (shifted right)
    expect(hoverBox!.x).toBeGreaterThan(initialBox!.x);
  });

  test('should have lime-green border on prerequisite box', async ({ page }) => {
    await page.goto('/tutorial/kms-bootstrap');

    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toBeVisible();

    // Check border color is lime-green
    const borderColor = await prereqLink.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });

    // lime-green is #C4F142 which is rgb(196, 241, 66)
    expect(borderColor).toBe('rgb(196, 241, 66)');
  });

  test('should show estimated time in cyber-blue color', async ({ page }) => {
    await page.goto('/tutorial/kms-bootstrap');

    const timeElement = page.locator('.prerequisite-link .fa-clock').locator('..');
    await expect(timeElement).toBeVisible();

    const color = await timeElement.evaluate(el => {
      return window.getComputedStyle(el).color;
    });

    // cyber-blue is #42C4F1 which is rgb(66, 196, 241)
    expect(color).toBe('rgb(66, 196, 241)');
  });
});

test.describe('Prerequisite Box - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should not show prerequisite box on tutorial with no prerequisites', async ({ page }) => {
    // tdx-hardware-verification has no prerequisites
    await page.goto('/tutorial/tdx-hardware-verification');

    // The prerequisite link specifically should not be visible
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).not.toBeVisible();
  });

  test('should handle localStorage being empty gracefully', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());

    await page.goto('/tutorial/kms-bootstrap');

    // Should show prerequisite box without errors
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toBeVisible();
  });

  test('should update when navigating between tutorials', async ({ page }) => {
    // Complete entire chain up to rust-toolchain
    await page.goto('/tutorial/clone-build-dstack-vmm');
    await page.evaluate(() => {
      const progress = {
        'tdx-hardware-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-software-setup': { completed: true, timestamp: new Date().toISOString() },
        'tdx-kernel-installation': { completed: true, timestamp: new Date().toISOString() },
        'tdx-status-verification': { completed: true, timestamp: new Date().toISOString() },
        'tdx-bios-configuration': { completed: true, timestamp: new Date().toISOString() },
        'tdx-troubleshooting-next-steps': { completed: true, timestamp: new Date().toISOString() },
        'dns-configuration': { completed: true, timestamp: new Date().toISOString() },
        'blockchain-setup': { completed: true, timestamp: new Date().toISOString() },
        'system-baseline-dependencies': { completed: true, timestamp: new Date().toISOString() },
        'rust-toolchain-installation': { completed: true, timestamp: new Date().toISOString() }
      };
      localStorage.setItem('dstack-tutorial-progress', JSON.stringify(progress));
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Should NOT show prerequisite box (all prereqs complete)
    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).not.toBeVisible();

    // Navigate to a tutorial with different, incomplete prerequisites (kms-bootstrap)
    await page.goto('/tutorial/kms-bootstrap');
    await page.waitForTimeout(500);

    // Should show prerequisite box (clone-build-dstack-vmm is incomplete since vmm-configuration depends on it)
    await expect(prereqLink).toBeVisible();
    await expect(prereqLink).toContainText('Clone & Build dstack-vmm');
  });

  test('prerequisite link should navigate to correct tutorial', async ({ page }) => {
    await page.goto('/tutorial/kms-bootstrap');

    const prereqLink = page.locator('.prerequisite-link');
    await expect(prereqLink).toBeVisible();

    // Click the link
    await prereqLink.click();

    // Should navigate to the deepest incomplete prerequisite
    await expect(page).toHaveURL(/\/tutorial\//);

    // Should be on tdx-hardware-verification (the deepest incomplete)
    await expect(page).toHaveURL('/tutorial/tdx-hardware-verification');
  });
});

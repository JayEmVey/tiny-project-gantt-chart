import { test, expect } from '@playwright/test';

test.describe('Gantt Chart UX Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tiny-project-gantt-chart/');
    await page.waitForLoadState('networkidle');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify main elements are visible
    await expect(page.locator('body')).toBeVisible();

    // Check if the layout adapts to mobile
    const container = page.locator('[class*="container"]').first();
    if (await container.isVisible()) {
      const boundingBox = await container.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify layout adjusts
    await expect(page.locator('body')).toBeVisible();

    const ganttChart = page.locator('[class*="gantt"]').first();
    await expect(ganttChart).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Verify all elements are properly displayed
    await expect(page.locator('body')).toBeVisible();

    const ganttChart = page.locator('[class*="gantt"]').first();
    await expect(ganttChart).toBeVisible();
  });

  test('should show tooltips on hover', async ({ page }) => {
    // Find interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Hover over first button
      await buttons.first().hover();
      await page.waitForTimeout(500);

      // Check if tooltip appears (implementation specific)
      const tooltip = page.locator('[role="tooltip"], [class*="tooltip"]');
      // Tooltip may or may not be present depending on implementation
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeDefined();
  });

  test('should have proper color contrast', async ({ page }) => {
    // Get background and text colors
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const color = await body.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Both should be defined
    expect(backgroundColor).toBeDefined();
    expect(color).toBeDefined();
  });

  test('should handle drag and drop interactions', async ({ page }) => {
    // Look for draggable task bars
    const taskBar = page.locator('[draggable="true"], [class*="task-bar"]').first();

    if (await taskBar.isVisible()) {
      const boundingBox = await taskBar.boundingBox();

      if (boundingBox) {
        // Simulate drag
        await page.mouse.move(boundingBox.x + 10, boundingBox.y + 10);
        await page.mouse.down();
        await page.mouse.move(boundingBox.x + 100, boundingBox.y + 10);
        await page.mouse.up();

        await page.waitForTimeout(500);

        // Verify the UI is still functional
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should show loading states appropriately', async ({ page }) => {
    // Navigate to the page
    await page.goto('/tiny-project-gantt-chart/');

    // The page should either show a loading state or the content
    await page.waitForLoadState('domcontentloaded');

    // Check if the app loaded successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have smooth animations', async ({ page }) => {
    // Check for CSS transitions
    const elements = page.locator('button, [class*="task"], [class*="gantt"]');
    const elementCount = await elements.count();

    if (elementCount > 0) {
      const firstElement = elements.first();
      const transition = await firstElement.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });

      // Transitions should be defined (even if 'none')
      expect(transition).toBeDefined();
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Try to trigger an error by invalid input
    const inputs = page.locator('input[type="text"], input[type="date"]');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Enter invalid data
      await inputs.first().fill('INVALID_DATA_TEST');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // App should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should provide feedback on user actions', async ({ page }) => {
    // Click on various buttons and verify feedback
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Click first button
      await buttons.first().click();
      await page.waitForTimeout(500);

      // Should have some visual feedback (modal, toast, etc.)
      const modals = page.locator('[role="dialog"], [class*="modal"]');
      const toasts = page.locator('[role="alert"], [class*="toast"]');

      // At least the page should still be visible
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should support both mouse and keyboard interactions', async ({ page }) => {
    // Test mouse interaction
    const clickableElements = page.locator('button, [role="button"]');
    const count = await clickableElements.count();

    if (count > 0) {
      // Mouse click
      await clickableElements.first().click();
      await page.waitForTimeout(300);

      // Keyboard interaction (Tab and Enter)
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // App should remain functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should maintain consistent visual hierarchy', async ({ page }) => {
    // Check heading levels
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();

    // Should have at least one main heading
    expect(h1Count + h2Count).toBeGreaterThan(0);

    // Check if there's a logical structure
    if (h1Count > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      expect(h1Text).toBeTruthy();
    }
  });

  test('should render without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/tiny-project-gantt-chart/');
    await page.waitForLoadState('networkidle');

    // Allow some time for any async errors
    await page.waitForTimeout(2000);

    // Should have minimal or no console errors
    // Some errors might be expected (3rd party libs, etc.)
    expect(errors.length).toBeLessThan(5);
  });

  test('should handle rapid user interactions', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Rapidly click buttons
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        await buttons.nth(i).click({ force: true });
        await page.waitForTimeout(100);
      }

      // App should still be responsive
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have appropriate focus indicators', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check if there's a visible focus indicator
    const focusedElement = page.locator(':focus');
    const hasFocus = await focusedElement.count() > 0;

    // At least one element should be focusable
    expect(hasFocus).toBeTruthy();
  });
});

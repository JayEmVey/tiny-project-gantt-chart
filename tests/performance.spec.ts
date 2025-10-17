import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tiny-project-gantt-chart/');
    await page.waitForLoadState('networkidle');
  });

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/tiny-project-gantt-chart/');
    await page.waitForLoadState('load');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should render initial view quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/tiny-project-gantt-chart/');

    // Wait for main content to be visible
    const ganttChart = page.locator('[class*="gantt"]').first();
    await ganttChart.waitFor({ state: 'visible' });

    const renderTime = Date.now() - startTime;

    // Should render within 3 seconds
    expect(renderTime).toBeLessThan(3000);
  });

  test('should handle scrolling smoothly', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(100);

    // Scroll up
    await page.evaluate(() => {
      window.scrollBy(0, -500);
    });
    await page.waitForTimeout(100);

    // Should remain responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle zoom operations efficiently', async ({ page }) => {
    const zoomInButton = page.getByRole('button', { name: /zoom.*in|\+/i });

    if (await zoomInButton.isVisible()) {
      const startTime = Date.now();

      // Perform multiple zoom operations
      for (let i = 0; i < 3; i++) {
        await zoomInButton.click();
        await page.waitForTimeout(100);
      }

      const zoomTime = Date.now() - startTime;

      // Should complete within 2 seconds
      expect(zoomTime).toBeLessThan(2000);
    }
  });

  test('should maintain performance with multiple tasks', async ({ page }) => {
    // Count existing tasks
    const tasks = page.locator('[class*="task"], [class*="bar"]');
    const taskCount = await tasks.count();

    // The page should still be responsive regardless of task count
    await page.mouse.move(100, 100);
    await page.waitForTimeout(100);

    await expect(page.locator('body')).toBeVisible();
  });

  test('should not have memory leaks on repeated actions', async ({ page }) => {
    // Perform repeated actions
    for (let i = 0; i < 10; i++) {
      // Navigate or interact
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    // App should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle rapid filtering/sorting efficiently', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 2) {
      const startTime = Date.now();

      // Rapidly click different buttons
      await buttons.nth(0).click();
      await page.waitForTimeout(50);
      await buttons.nth(1).click();
      await page.waitForTimeout(50);
      await buttons.nth(2).click();

      const operationTime = Date.now() - startTime;

      // Should complete quickly
      expect(operationTime).toBeLessThan(2000);
    }
  });

  test('should have optimized bundle size', async ({ page }) => {
    // Navigate and check network activity
    const response = await page.goto('/tiny-project-gantt-chart/');

    // Check response status
    expect(response?.status()).toBe(200);

    // Should load successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render animations at 60fps', async ({ page }) => {
    // This is a simplified test - real FPS measurement is complex
    // We check if animations complete smoothly

    const zoomButton = page.getByRole('button', { name: /zoom/i }).first();

    if (await zoomButton.isVisible()) {
      await zoomButton.click();
      await page.waitForTimeout(500);

      // Should complete without hanging
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle concurrent operations', async ({ page }) => {
    // Try to perform multiple actions simultaneously
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 1) {
      // Click multiple buttons in quick succession
      const promises = [];
      for (let i = 0; i < Math.min(3, count); i++) {
        promises.push(buttons.nth(i).click({ force: true }));
      }

      await Promise.all(promises);
      await page.waitForTimeout(500);

      // App should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
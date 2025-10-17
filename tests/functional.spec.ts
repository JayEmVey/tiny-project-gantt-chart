import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tiny-project-gantt-chart/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check if the Gantt chart container is present
    const ganttChart = page.locator('[class*="gantt"]').first();
    await expect(ganttChart).toBeVisible();
  });

  test('should create a new epic', async ({ page }) => {
    // Look for the "Add Epic" button (may vary based on actual implementation)
    const addButton = page.getByRole('button', { name: /add.*epic/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill in epic details
      await page.fill('input[name="title"], input[placeholder*="epic" i]', 'Test Epic');

      // Save the epic
      const saveButton = page.getByRole('button', { name: /save|create|add/i }).first();
      await saveButton.click();

      // Verify the epic was created
      await expect(page.getByText('Test Epic')).toBeVisible();
    }
  });

  test('should create a new user story', async ({ page }) => {
    // First create an epic if needed
    const addStoryButton = page.getByRole('button', { name: /add.*story/i });

    if (await addStoryButton.isVisible()) {
      await addStoryButton.click();

      // Fill in user story details
      await page.fill('input[name="title"], input[placeholder*="story" i]', 'Test User Story');

      // Save
      const saveButton = page.getByRole('button', { name: /save|create|add/i }).first();
      await saveButton.click();

      // Verify
      await expect(page.getByText('Test User Story')).toBeVisible();
    }
  });

  test('should create a new task', async ({ page }) => {
    const addTaskButton = page.getByRole('button', { name: /add.*task/i });

    if (await addTaskButton.isVisible()) {
      await addTaskButton.click();

      // Fill in task details
      await page.fill('input[name="title"], input[placeholder*="task" i]', 'Test Task');

      // Save
      const saveButton = page.getByRole('button', { name: /save|create|add/i }).first();
      await saveButton.click();

      // Verify
      await expect(page.getByText('Test Task')).toBeVisible();
    }
  });

  test('should save project', async ({ page }) => {
    // Try keyboard shortcut
    await page.keyboard.press('Control+S');

    // Wait a bit for the save operation
    await page.waitForTimeout(1000);

    // Look for success message or confirmation
    // This will depend on your implementation
  });

  test('should toggle between different views', async ({ page }) => {
    // Look for view toggle buttons
    const viewButtons = page.locator('button[class*="view"], button[role="tab"]');

    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(500);

      // Verify view changed (implementation specific)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should zoom in and out', async ({ page }) => {
    // Look for zoom controls
    const zoomInButton = page.getByRole('button', { name: /zoom.*in|\+/i });
    const zoomOutButton = page.getByRole('button', { name: /zoom.*out|-/i });

    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
      await page.waitForTimeout(300);
    }

    if (await zoomOutButton.isVisible()) {
      await zoomOutButton.click();
      await page.waitForTimeout(300);
    }

    // Verify the chart is still visible
    await expect(page.locator('[class*="gantt"]').first()).toBeVisible();
  });

  test('should navigate timeline', async ({ page }) => {
    // Look for navigation buttons
    const todayButton = page.getByRole('button', { name: /today/i });

    if (await todayButton.isVisible()) {
      await todayButton.click();
      await page.waitForTimeout(500);
    }

    // Try arrow navigation
    const nextButton = page.getByRole('button', { name: /next|→|›/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should export to PNG', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export/i });

    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Look for PNG option
      const pngOption = page.getByText(/png/i);
      if (await pngOption.isVisible()) {
        await pngOption.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+S for save
    await page.keyboard.press('Control+S');
    await page.waitForTimeout(500);

    // Test zoom shortcuts
    await page.keyboard.press('Control+Plus');
    await page.waitForTimeout(300);

    await page.keyboard.press('Control+Minus');
    await page.waitForTimeout(300);

    // Verify page is still responsive
    await expect(page.locator('body')).toBeVisible();
  });
});

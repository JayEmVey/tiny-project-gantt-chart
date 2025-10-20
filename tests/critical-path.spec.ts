import { test, expect } from '@playwright/test';

test.describe('Critical Path Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175/tiny-project-gantt-chart/');
    await page.waitForLoadState('networkidle');
  });

  test('should display critical path toggle button', async ({ page }) => {
    const criticalPathButton = page.locator('text=Critical Path');
    await expect(criticalPathButton).toBeVisible();
  });

  test('should toggle critical path visualization', async ({ page }) => {
    // Click the Critical Path button
    const criticalPathButton = page.locator('text=Critical Path');
    await criticalPathButton.click();

    // Check if critical path tasks are highlighted
    const criticalPathTasks = page.locator('.task-bar.critical-path');
    await expect(criticalPathTasks).toHaveCount(4); // Tasks 1, 2, 3, 4 should be on critical path

    // Check if dependency arrows are visible
    const dependencyArrows = page.locator('.dependency-arrows');
    await expect(dependencyArrows).toBeVisible();

    // Click again to turn off
    await criticalPathButton.click();
    await expect(criticalPathTasks).toHaveCount(0);
  });

  test('should show dependency arrows when critical path is enabled', async ({ page }) => {
    // Enable critical path
    const criticalPathButton = page.locator('text=Critical Path');
    await criticalPathButton.click();

    // Check for SVG dependency arrows
    const svgContainer = page.locator('svg.dependency-arrows');
    await expect(svgContainer).toBeVisible();

    // Check for arrow paths
    const arrowPaths = page.locator('svg.dependency-arrows path');
    await expect(arrowPaths.first()).toBeVisible();
  });

  test('should allow editing task dependencies', async ({ page }) => {
    // Click on a task to edit
    const taskBar = page.locator('.task-bar').first();
    await taskBar.click();

    // Check if modal opens
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();

    // Check if dependencies field exists
    const dependenciesSelect = page.locator('select[multiple]');
    await expect(dependenciesSelect).toBeVisible();

    // Close modal
    const closeButton = page.locator('text=Cancel');
    await closeButton.click();
  });

  test('should calculate critical path correctly with dependencies', async ({ page }) => {
    // Enable critical path
    await page.locator('text=Critical Path').click();

    // Verify that tasks with dependencies are highlighted
    // The critical path should be: Task 1 → Task 2 → Task 3 → Task 4
    const task1 = page.locator('[data-task-id="1"]').locator('.task-bar');
    const task2 = page.locator('[data-task-id="2"]').locator('.task-bar');
    const task3 = page.locator('[data-task-id="3"]').locator('.task-bar');
    const task4 = page.locator('[data-task-id="4"]').locator('.task-bar');

    await expect(task1).toHaveClass(/critical-path/);
    await expect(task2).toHaveClass(/critical-path/);
    await expect(task3).toHaveClass(/critical-path/);
    await expect(task4).toHaveClass(/critical-path/);

    // Task 5 and 6 should also be critical (5 → 6)
    const task5 = page.locator('[data-task-id="5"]').locator('.task-bar');
    const task6 = page.locator('[data-task-id="6"]').locator('.task-bar');

    await expect(task5).toHaveClass(/critical-path/);
    await expect(task6).toHaveClass(/critical-path/);
  });

  test('should display red dependency arrows for critical path', async ({ page }) => {
    // Enable critical path
    await page.locator('text=Critical Path').click();

    // Check that critical path arrows are red
    const criticalArrows = page.locator('svg.dependency-arrows path.critical-path');
    await expect(criticalArrows.first()).toBeVisible();
    
    // Verify the stroke color is red
    const arrowStyle = await criticalArrows.first().getAttribute('style');
    expect(arrowStyle).toContain('stroke: red');
  });

  test('should animate critical path tasks with pulsing effect', async ({ page }) => {
    // Enable critical path
    await page.locator('text=Critical Path').click();

    // Check that critical path tasks have animation
    const criticalPathTask = page.locator('.task-bar.critical-path').first();
    await expect(criticalPathTask).toBeVisible();
    
    // Verify CSS animation is applied
    const taskStyle = await criticalPathTask.evaluate(el => 
      window.getComputedStyle(el).animationName
    );
    expect(taskStyle).toBe('pulse-red');
  });
});
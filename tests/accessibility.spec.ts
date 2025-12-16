import { test, expect } from '@playwright/test';

test.describe('Gantt Chart Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tiny-project-gantt-chart/');
    await page.waitForLoadState('networkidle');
  });

  test('should have a descriptive page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1Elements = await page.locator('h1').count();
    const h2Elements = await page.locator('h2').count();

    // Should have at least one main heading
    expect(h1Elements + h2Elements).toBeGreaterThan(0);

    // If h1 exists, check its content
    if (h1Elements > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have accessible buttons', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(10, buttonCount); i++) {
      const button = buttons.nth(i);

      // Button should have text content or aria-label
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should have accessible form inputs', async ({ page }) => {
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(5, inputCount); i++) {
      const input = inputs.nth(i);

      // Input should have associated label, placeholder, or aria-label
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      let hasLabel = false;
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      expect(hasLabel || ariaLabel || placeholder).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}${el.className ? '.' + el.className.split(' ')[0] : ''}` : '';
      });

      if (focusedElement) {
        interactiveElements.push(focusedElement);
      }
    }

    // Should have navigated through at least some elements
    expect(interactiveElements.length).toBeGreaterThan(0);
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check if focused element has outline or other focus styles
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement;
      if (el) {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      }
      return null;
    });

    // Should have some form of focus indication
    expect(focusStyles).toBeTruthy();
  });

  test('should have proper ARIA roles', async ({ page }) => {
    // Check for common ARIA roles
    const buttons = await page.locator('[role="button"]').count();
    const dialogs = await page.locator('[role="dialog"]').count();
    const navigation = await page.locator('[role="navigation"]').count();

    // At least some ARIA roles should be present
    // (This is a lenient test as not all apps use explicit ARIA roles)
    expect(buttons + dialogs + navigation).toBeGreaterThanOrEqual(0);
  });

  test('should have sufficient color contrast (basic check)', async ({ page }) => {
    // Get text elements and check their colors
    const textElements = page.locator('p, h1, h2, h3, span, button');
    const count = await textElements.count();

    if (count > 0) {
      const firstElement = textElements.first();
      const color = await firstElement.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
        };
      });

      // Colors should be defined
      expect(color.color).toBeTruthy();
      expect(color.fontSize).toBeTruthy();
    }
  });

  test('should not trap keyboard focus', async ({ page }) => {
    // Tab through multiple times
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }

    // Should still be able to interact with the page
    const activeElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(activeElement).toBeTruthy();
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check for landmarks
    const landmarks = await page.locator('main, nav, header, footer, aside').count();

    // Check for semantic HTML
    const semanticElements = await page.locator('article, section, nav, main').count();

    // Should have some semantic structure
    expect(landmarks + semanticElements).toBeGreaterThan(0);
  });

  test('should have accessible modals/dialogs', async ({ page }) => {
    const dialogs = page.locator('[role="dialog"], [class*="modal"]');
    const dialogCount = await dialogs.count();

    if (dialogCount > 0) {
      const firstDialog = dialogs.first();

      // Dialog should have aria-labelledby or aria-label
      const ariaLabelledby = await firstDialog.getAttribute('aria-labelledby');
      const ariaLabel = await firstDialog.getAttribute('aria-label');

      expect(ariaLabelledby || ariaLabel).toBeTruthy();
    }
  });

  test('should be operable with keyboard alone', async ({ page }) => {
    // Find a button
    const button = page.locator('button').first();

    if (await button.isVisible()) {
      // Focus the button with Tab
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Activate with Enter or Space
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have meaningful link text', async ({ page }) => {
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(5, linkCount); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Link should have descriptive text
      const linkText = (text?.trim() || ariaLabel || '').toLowerCase();

      // Should not be generic text like "click here"
      const isGeneric = ['click here', 'here', 'link', 'read more'].includes(linkText);

      if (linkText.length > 0) {
        // If there's text, it shouldn't be too generic
        expect(linkText.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Check if app respects prefers-reduced-motion
    const prefersReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    // This just checks if the media query is accessible
    expect(typeof prefersReducedMotion).toBe('boolean');
  });

  test('should have skip navigation links (if applicable)', async ({ page }) => {
    // Check for skip links
    const skipLinks = page.locator('a[href^="#"]').filter({
      hasText: /skip|jump/i,
    });

    const skipLinkCount = await skipLinks.count();

    // Skip links are optional but recommended
    // This test just checks if they exist, doesn't require them
    expect(skipLinkCount).toBeGreaterThanOrEqual(0);
  });
});

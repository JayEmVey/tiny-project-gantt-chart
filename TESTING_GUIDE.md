# Testing Guide

This guide provides comprehensive instructions for testing the Tiny Project Gantt Chart application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Running Tests from Terminal](#running-tests-from-terminal)
3. [Test Suites Overview](#test-suites-overview)
4. [Understanding Test Results](#understanding-test-results)
5. [Debugging Failed Tests](#debugging-failed-tests)
6. [Writing New Tests](#writing-new-tests)
7. [CI/CD Integration](#cicd-integration)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Dependencies installed (`npm install`)

### Run All Tests

The simplest command to run all tests:

```bash
npm test
```

This will:
- Automatically start the dev server
- Run all test suites in headless mode
- Generate a test report
- Display results in the terminal

### Interactive Testing (Recommended for Development)

For the best development experience, use the Playwright UI mode:

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See all tests organized by file
- Run individual tests or suites
- Watch tests execute in real-time
- Inspect DOM, network, and console
- Time-travel through test execution

## Running Tests from Terminal

### All Tests

```bash
# Run all tests in headless mode
npm test

# Run all tests and see the browser
npm run test:headed

# Run all tests in interactive UI mode
npm run test:ui
```

### Specific Test Suites

```bash
# Run only functional tests
npm run test:functional

# Run only UX tests
npm run test:ux

# Run only performance tests
npm run test:performance

# Run only accessibility tests
npm run test:accessibility
```

### Browser-Specific Tests

```bash
# Run tests in Chromium only (Chrome/Edge)
npm run test:chromium

# Run tests in Firefox only
npm run test:firefox

# Run tests in WebKit only (Safari)
npm run test:webkit
```

### View Test Reports

After running tests, view the detailed HTML report:

```bash
npm run test:report
```

This opens a browser with:
- Pass/fail status for each test
- Execution timeline
- Screenshots and videos of failures
- Network activity
- Console logs

## Test Suites Overview

### 1. Functional Tests

**File:** [tests/functional.spec.ts](tests/functional.spec.ts)

**Purpose:** Verify that all core features work correctly

**Tests Include:**
- Application loads successfully
- Creating Epics, User Stories, and Tasks
- Saving projects (keyboard shortcut: Ctrl+S)
- Toggling between different views
- Zoom in/out functionality
- Timeline navigation (Today, Next, Previous)
- Export to PNG functionality
- Keyboard shortcuts (Ctrl+S, Ctrl+Plus, Ctrl+Minus)

**Run Command:**
```bash
npm run test:functional
```

### 2. UX Tests

**File:** [tests/ux.spec.ts](tests/ux.spec.ts)

**Purpose:** Ensure excellent user experience across devices and interactions

**Tests Include:**
- Responsive design on mobile (375x667)
- Responsive design on tablet (768x1024)
- Responsive design on desktop (1920x1080)
- Tooltip behavior on hover
- Keyboard navigation accessibility
- Color contrast compliance
- Drag and drop interactions
- Loading states
- Smooth animations and transitions
- Error handling and user feedback
- Mouse and keyboard interaction parity
- Visual hierarchy consistency
- Console error monitoring
- Rapid interaction handling
- Focus indicators

**Run Command:**
```bash
npm run test:ux
```

### 3. Performance Tests

**File:** [tests/performance.spec.ts](tests/performance.spec.ts)

**Purpose:** Ensure the application performs well under various conditions

**Tests Include:**
- Page load time (< 5 seconds)
- Initial render time (< 3 seconds)
- Smooth scrolling performance
- Zoom operation efficiency
- Performance with multiple tasks
- Memory leak detection
- Rapid filtering/sorting
- Bundle size optimization
- 60fps animation rendering
- Concurrent operation handling

**Run Command:**
```bash
npm run test:performance
```

### 4. Accessibility Tests

**File:** [tests/accessibility.spec.ts](tests/accessibility.spec.ts)

**Purpose:** Ensure the application is accessible to all users

**Tests Include:**
- Descriptive page title
- Proper heading hierarchy (h1, h2, etc.)
- Alt text for images
- Accessible buttons with labels
- Accessible form inputs
- Keyboard navigation support
- Visible focus indicators
- Proper ARIA roles
- Sufficient color contrast
- No keyboard focus traps
- Screen reader navigation support
- Accessible modals/dialogs
- Keyboard-only operation
- Meaningful link text
- Reduced motion preferences
- Skip navigation links

**Run Command:**
```bash
npm run test:accessibility
```

## Understanding Test Results

### Terminal Output

When you run tests, you'll see output like:

```
Running 45 tests using 3 workers

  ✓  functional.spec.ts:5:3 › should load the application successfully (2.5s)
  ✓  functional.spec.ts:12:3 › should create a new epic (1.8s)
  ✗  functional.spec.ts:25:3 › should create a new user story (3.2s)
```

- ✓ (green checkmark) = Test passed
- ✗ (red X) = Test failed
- Time in parentheses = Execution time

### HTML Report

The HTML report (`npm run test:report`) provides:

- **Overview:** Total tests, pass/fail rate, duration
- **Test List:** Expandable list of all tests
- **Failure Details:** Stack traces, error messages
- **Artifacts:** Screenshots, videos, traces
- **Timeline:** Visual representation of test execution

### Artifacts on Failure

When a test fails, Playwright automatically captures:

1. **Screenshot:** Visual state at failure point
2. **Video:** Recording of the entire test
3. **Trace:** Detailed timeline with DOM snapshots
4. **Logs:** Console output and network activity

These are saved in the `test-results/` directory.

## Debugging Failed Tests

### Method 1: UI Mode (Best for Development)

```bash
npm run test:ui
```

1. Click on the failed test
2. Watch it run in the browser
3. Inspect the DOM, network, console
4. Use time-travel debugging

### Method 2: Headed Mode

```bash
npm run test:headed
```

This runs tests in a visible browser, so you can watch what's happening.

### Method 3: Debug Specific Test

```bash
npx playwright test tests/functional.spec.ts --debug
```

This opens the Playwright Inspector for step-by-step debugging.

### Method 4: Review Artifacts

```bash
npm run test:report
```

Then click on the failed test to see:
- Screenshot at failure
- Video recording
- Error details

### Common Issues and Solutions

**Issue:** Tests fail with "locator not found"
- **Solution:** The UI may have changed. Update selectors in test files.

**Issue:** Tests timeout
- **Solution:** Increase timeout in `playwright.config.ts` or add `{ timeout: 60000 }` to specific tests.

**Issue:** Tests fail on CI but pass locally
- **Solution:** Check viewport size, timing issues, or use `waitForLoadState('networkidle')`.

**Issue:** Flaky tests (sometimes pass, sometimes fail)
- **Solution:** Add proper wait conditions instead of `waitForTimeout()`.

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/tiny-project-gantt-chart/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange: Set up test data
    const button = page.getByRole('button', { name: /click me/i });

    // Act: Perform action
    await button.click();

    // Assert: Verify result
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors:**
   - ✅ `page.getByRole('button', { name: /submit/i })`
   - ✅ `page.getByText('Welcome')`
   - ❌ `page.locator('.btn-primary-123')`

2. **Wait for conditions, not time:**
   - ✅ `await page.waitForLoadState('networkidle')`
   - ✅ `await element.waitFor({ state: 'visible' })`
   - ❌ `await page.waitForTimeout(5000)`

3. **Make tests independent:**
   - Each test should be able to run in isolation
   - Use `beforeEach` for setup
   - Don't rely on test execution order

4. **Use descriptive test names:**
   - ✅ `'should display error when username is empty'`
   - ❌ `'test 1'`

5. **Test user scenarios, not implementation:**
   - Focus on what users do, not how the code works
   - Test from the user's perspective

### Adding a New Test File

1. Create a new file in the `tests/` directory:
   ```bash
   touch tests/my-feature.spec.ts
   ```

2. Write your tests using the structure above

3. Run your tests:
   ```bash
   npx playwright test tests/my-feature.spec.ts
   ```

4. Optionally, add a script to `package.json`:
   ```json
   "test:my-feature": "playwright test tests/my-feature.spec.ts"
   ```

## CI/CD Integration

### GitHub Actions

The test suite is configured to work with CI environments. When running in CI:

- `process.env.CI` is set to `true`
- Tests run in headless mode
- Failed tests are retried up to 2 times
- Tests run sequentially (1 worker) for stability
- HTML and JSON reports are generated

### Example GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm test

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Running Tests in Docker

You can also run tests in a Docker container:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.56.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Getting Help

If you encounter issues:

1. Check the [Playwright documentation](https://playwright.dev/)
2. Review existing test files for examples
3. Run tests in UI mode for better debugging
4. Open an issue on the GitHub repository

---

Happy Testing! 🎭

# E2E Testing Guide

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Tests cover all interactive elements including model selection tabs, parameter sliders, generate button, and navigation.

## Quick Start

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode (interactive)
npm run test:ui

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test tests/model-tabs.spec.ts

# Run tests matching a pattern
npx playwright test -g "should switch model"
```

### Debug Tests

```bash
# Debug mode with Playwright Inspector
npm run test:debug

# Debug specific test
npx playwright test tests/model-tabs.spec.ts --debug
```

### View Test Reports

```bash
# View last test results
npm run test:report
```

## Test Structure

### Test Files

- **`model-tabs.spec.ts`** - Tests for model selection tabs
  - Tab switching (click & keyboard)
  - Visual feedback (checkmark, hover states)
  - ARIA attributes
  - Accessibility

- **`sliders.spec.ts`** - Tests for parameter sliders
  - Temperature, Max Tokens, Top-P sliders
  - Value updates
  - Range validation
  - Persistence

- **`generate-button.spec.ts`** - Tests for AI generation
  - Button states
  - Loading animation
  - Error handling
  - Response display
  - Model name inclusion

- **`page-elements.spec.ts`** - General page tests
  - Navigation & routing
  - Hero section
  - Features display
  - Animations
  - Accessibility

## Test Coverage

✅ **Model Selection (11 tests)**
- Click to select models
- Keyboard navigation (Tab, Enter, Space)
- Visual checkmark on active tab
- Selected model display update
- ARIA attributes (role, aria-pressed)
- Hover effects

✅ **Parameter Sliders (7 tests)**
- All three sliders present
- Default values correct
- Value updates on change
- Range validation
- Independent updates
- Value persistence

✅ **Generate Button (10 tests)**
- Empty prompt validation
- Loading state
- Response generation
- Model name in response
- Multiple generations
- Button state changes
- Prompt preservation

✅ **Navigation & Elements (13+ tests)**
- /app redirect handling
- Smooth scroll
- Hero section
- Features section
- Footer
- Responsive layout
- Animations
- Accessibility

## CI/CD Integration

Tests run automatically on:
- Push to `master` or `main`
- Pull requests
- Manual trigger via GitHub Actions

### Viewing CI Results

1. Go to **Actions** tab in GitHub
2. Select the **E2E Tests** workflow
3. View test results and download artifacts
4. Screenshots/videos available on failure

## Configuration

### `playwright.config.ts`

Key settings:
- **Base URL**: `http://localhost:8080` (local) or custom via `BASE_URL` env var
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Trace**: Enabled on first retry
- **Screenshots**: Only on failure
- **Video**: Retained on failure

### Environment Variables

```bash
# Test against production
BASE_URL=https://ai.blackroadai.com npm test

# Test against staging
BASE_URL=https://staging.blackroadai.com npm test
```

## Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('#my-element');
    
    // Act
    await element.click();
    
    // Assert
    await expect(element).toHaveClass('active');
  });
});
```

### Best Practices

1. **Use Descriptive Names**: Test names should clearly state what they test
2. **Wait for Network Idle**: Use `waitForLoadState('networkidle')` before interactions
3. **Use Locators**: Prefer `page.locator()` over deprecated methods
4. **Explicit Assertions**: Use Playwright's built-in assertions
5. **Avoid Fixed Timeouts**: Use `waitFor` methods instead of `setTimeout`
6. **Test in Isolation**: Each test should be independent
7. **Clean Up**: Reset state between tests with `beforeEach`

## Troubleshooting

### Tests Failing Locally

```bash
# Update Playwright
npm install -D @playwright/test@latest

# Reinstall browsers
npx playwright install --force

# Clear cache
rm -rf node_modules playwright-report test-results
npm install
```

### Debugging Flaky Tests

```bash
# Run with retries
npx playwright test --retries=3

# Run with trace always on
npx playwright test --trace=on

# Run single test multiple times
for i in {1..10}; do npx playwright test tests/model-tabs.spec.ts; done
```

### View Trace

```bash
# Show trace for failed test
npx playwright show-trace test-results/path-to-trace.zip
```

## Performance Testing

### Add Performance Metrics

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

## Accessibility Testing

Tests include basic accessibility checks:
- Heading hierarchy
- ARIA attributes
- Keyboard navigation
- Focus management

For comprehensive accessibility testing, consider:
- [axe-core](https://www.deque.com/axe/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - Record tests automatically
- [Trace Viewer](https://playwright.dev/docs/trace-viewer) - Debug test failures

## Support

Issues? Check:
1. [Playwright Discord](https://discord.gg/playwright)
2. [GitHub Issues](https://github.com/microsoft/playwright/issues)
3. Project maintainers

---

**Total Tests**: 41+  
**Browsers Tested**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari  
**Coverage**: All interactive elements & user flows

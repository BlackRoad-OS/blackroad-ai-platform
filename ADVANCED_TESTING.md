# Advanced E2E Testing Features

## Overview

This guide covers the advanced testing features added to the BlackRoad AI Platform test suite.

## 🎯 New Test Suites

### 1. Accessibility Testing (`accessibility.spec.ts`)

Comprehensive WCAG 2.1 Level AA compliance testing using axe-core.

**Features:**
- ✅ Automated accessibility scanning
- ✅ Color contrast verification
- ✅ Keyboard navigation testing
- ✅ Screen reader compatibility
- ✅ Touch target size validation
- ✅ Semantic HTML structure
- ✅ ARIA attributes validation
- ✅ Focus management
- ✅ Reduced motion support
- ✅ Error message accessibility

**Run:**
```bash
npm run test:a11y
```

**What's Tested:**
- No accessibility violations detected
- Proper heading hierarchy
- All interactive elements keyboard accessible
- Sufficient color contrast ratios
- Alt text on images
- ARIA labels on controls
- Live regions for dynamic content
- Focus visible indicators
- Touch targets meet 44x44px minimum

### 2. Performance Testing (`performance.spec.ts`)

Comprehensive performance metrics and monitoring.

**Features:**
- ✅ Page load time measurement
- ✅ First Contentful Paint (FCP)
- ✅ DOM interactive time
- ✅ Main thread blocking detection
- ✅ Resource size monitoring
- ✅ Interaction response time
- ✅ Mobile performance testing
- ✅ Memory leak detection
- ✅ Caching strategy validation

**Run:**
```bash
npm run test:perf
```

**Performance Targets:**
- Page load: < 3 seconds
- FCP: < 1.8 seconds
- DOM Interactive: < 1.5 seconds
- Slider response: < 100ms
- Total page size: < 500KB
- JS Heap usage: < 50% of limit

### 3. Visual Regression Testing (`visual-regression.spec.ts`)

Pixel-perfect visual comparison to detect unintended UI changes.

**Features:**
- ✅ Full page screenshots
- ✅ Component-level snapshots
- ✅ State variations (hover, focus, loading)
- ✅ Responsive breakpoint testing
- ✅ Dark mode testing
- ✅ Cross-viewport comparison

**Run:**
```bash
npm run test:visual
```

**Update Snapshots:**
```bash
npm test -- tests/visual-regression.spec.ts --update-snapshots
```

**What's Captured:**
- Homepage (mobile, tablet, desktop)
- Model selector in all states
- Active/inactive tabs
- Button states (default, hover, loading)
- Slider controls
- Error messages
- All responsive breakpoints

### 4. Advanced Workflows (`advanced-workflows.spec.ts`)

Real-world user scenarios and edge cases.

**Features:**
- ✅ Complete user workflows
- ✅ Rapid interaction stress testing
- ✅ State persistence testing
- ✅ Error recovery testing
- ✅ Edge case handling
- ✅ Keyboard-only navigation
- ✅ Concurrent operations
- ✅ Network condition testing

**Scenarios Tested:**
- New user explores all features
- Power user rapid workflow
- User makes and corrects mistakes
- 100 rapid slider changes
- 50 model switches in succession
- Multiple concurrent operations
- Slow 3G network
- Offline functionality

## 🛠️ Test Helpers & Utilities

### Page Object Model

Reusable page interactions via `AIPlaygroundPage` class:

```typescript
import { AIPlaygroundPage } from './test-helpers';

test('example', async ({ page }) => {
  const playground = new AIPlaygroundPage(page);
  
  await playground.selectModelByName('Claude Sonnet 4');
  await playground.setTemperature(1.2);
  await playground.generateResponse('Test prompt');
  await playground.expectOutputContains('AI Response');
});
```

### Test Data Factory

Consistent test data via `TestData` object:

```typescript
import { TestData } from './test-helpers';

await playground.enterPrompt(TestData.prompts.complex);
await playground.setTemperature(TestData.sliders.temperature.max);
```

### Utilities

Helper functions for common operations:

```typescript
import { TestUtils } from './test-helpers';

await TestUtils.waitForAnimation(page);
await TestUtils.logPerformanceMetrics(page);
await TestUtils.takeTimestampedScreenshot(page, 'error-state');
```

## 📊 CI/CD Integration

### Test Matrix

The GitHub Actions workflow now runs tests across multiple dimensions:

**Browsers:**
- Chromium
- Firefox
- WebKit

**Test Suites:**
- Functional (core features)
- Accessibility (WCAG compliance)
- Performance (speed & efficiency)
- Visual Regression (UI consistency)
- Mobile (responsive behavior)

**Total Combinations:** 3 browsers × 3 test suites + mobile + visual = **12 parallel jobs**

### Scheduled Tests

Production smoke tests run every 6 hours:
```yaml
schedule:
  - cron: '0 */6 * * *'
```

### Visual Regression on PRs

Visual regression tests run automatically on pull requests to catch UI regressions.

## 📈 Test Statistics

| Category | Tests | Coverage |
|----------|-------|----------|
| Functional | 41 | 100% |
| Accessibility | 15 | WCAG 2.1 AA |
| Performance | 14 | Core Web Vitals |
| Visual Regression | 25+ | All states |
| Advanced Workflows | 20 | User journeys |
| **TOTAL** | **115+** | **Enterprise** |

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Specific Suite
```bash
npm run test:a11y        # Accessibility
npm run test:perf        # Performance
npm run test:visual      # Visual regression
npm run test:smoke       # Quick smoke test
```

### Specific Browser
```bash
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit
```

### Debug Mode
```bash
npm run test:debug       # Step through with debugger
npm run test:ui          # Interactive UI mode
npm run test:headed      # See browser window
```

### Production Testing
```bash
BASE_URL=https://ai.blackroadai.com npm test
```

### Continuous Testing
```bash
npm run test:ui          # Opens interactive mode
# Make changes to code
# Tests auto-rerun on file changes
```

## 🔍 Analyzing Results

### HTML Report
```bash
npm run test:report
```

Opens interactive HTML report with:
- Test results summary
- Screenshots of failures
- Video recordings
- Trace files for debugging

### Lighthouse Report
```bash
npm run lighthouse
```

Generates detailed performance report including:
- Performance score
- Accessibility score
- Best practices score
- SEO score
- Core Web Vitals

### CI Artifacts

After CI runs, download artifacts from GitHub Actions:
1. Go to **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts**
4. Download:
   - Test reports
   - Screenshots
   - Visual regression diffs
   - Performance metrics

## 🎓 Best Practices

### Writing Accessible Tests

Always include accessibility checks:

```typescript
test('should be accessible', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### Performance Testing

Set realistic thresholds:

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
  console.log(`Load time: ${loadTime}ms`);
});
```

### Visual Regression

Update snapshots when UI changes intentionally:

```bash
# Review changes first
npm test -- tests/visual-regression.spec.ts

# If changes are expected:
npm test -- tests/visual-regression.spec.ts --update-snapshots

# Commit new snapshots
git add tests/visual-regression.spec.ts-snapshots/
git commit -m "chore: update visual regression snapshots"
```

### Page Object Model

Keep tests maintainable:

```typescript
// ❌ Don't do this
await page.locator('.model-option').nth(1).click();
await page.locator('#prompt-input').fill('test');

// ✅ Do this
const playground = new AIPlaygroundPage(page);
await playground.selectModel(1);
await playground.enterPrompt('test');
```

## 🐛 Troubleshooting

### Accessibility Violations

```bash
# Run accessibility tests with details
npm run test:a11y -- --reporter=list

# Check specific element
test('debug a11y', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .include('.specific-element')
    .analyze();
  
  console.log(JSON.stringify(results.violations, null, 2));
});
```

### Visual Regression Failures

```bash
# See visual diffs
npm run test:report
# Navigate to failed test
# Click "Show diff" to see before/after comparison
```

### Performance Issues

```bash
# Run with metrics logging
test('debug performance', async ({ page }) => {
  await page.goto('/');
  await TestUtils.logPerformanceMetrics(page);
});
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)

---

**Ready to test!** 🚀

Run `npm test` to execute the full test suite.

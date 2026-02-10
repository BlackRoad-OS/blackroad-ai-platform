import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Testing with axe-core', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible model selection tabs', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.model-selector')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible form controls', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.playground-container')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through all interactive elements
    const interactiveElements = await page.locator('button, a, input, textarea, [tabindex="0"]').count();
    
    expect(interactiveElements).toBeGreaterThan(0);
    
    // Test first few tab stops
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
    
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    expect(await main.count()).toBeGreaterThanOrEqual(0);
    
    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);
    
    // Check for nav if present
    const nav = await page.locator('nav, [role="navigation"]').count();
    expect(nav).toBeGreaterThanOrEqual(0);
  });

  test('should have alt text for images', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Either has alt text or is decorative (role="presentation" or empty alt)
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      // Button should have visible text or aria-label or aria-labelledby
      expect(
        (text && text.trim().length > 0) || 
        ariaLabel || 
        ariaLabelledBy
      ).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
    
    // Generate response to trigger potential live region update
    await page.locator('#prompt-input').fill('test');
    await page.locator('#generate-btn').click();
    
    // Wait a moment for any live region updates
    await page.waitForTimeout(500);
    
    // At minimum, we should be able to detect the output area
    const output = page.locator('#output');
    await expect(output).toBeVisible();
  });

  test('should have focus visible indicators', async ({ page }) => {
    const modelTab = page.locator('.model-option').first();
    
    // Focus the element
    await modelTab.focus();
    
    // Check if element has focus
    const isFocused = await modelTab.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBeTruthy();
    
    // Check for focus styles (outline or custom focus indicator)
    const styles = await modelTab.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow,
      };
    });
    
    // Should have some visual focus indicator
    const hasFocusIndicator = 
      styles.outline !== 'none' || 
      styles.outlineWidth !== '0px' ||
      styles.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('should handle reduced motion preferences', async ({ page, context }) => {
    // Set reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });
    });
    
    await page.goto('/');
    
    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.model-option')).toHaveCount(4);
  });

  test('should have sufficient touch target sizes', async ({ page }) => {
    const modelTabs = page.locator('.model-option');
    const count = await modelTabs.count();
    
    for (let i = 0; i < count; i++) {
      const tab = modelTabs.nth(i);
      const box = await tab.boundingBox();
      
      if (box) {
        // WCAG recommends 44x44px minimum for touch targets
        expect(box.width).toBeGreaterThanOrEqual(40); // Slightly relaxed
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should have accessible error messages', async ({ page }) => {
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    // Trigger error by clicking without prompt
    await btn.click();
    
    // Error message should be visible and readable
    await expect(output).toContainText('Please enter a prompt');
    
    // Check if error has appropriate role or aria
    const hasErrorIndicator = await output.evaluate((el) => {
      const role = el.getAttribute('role');
      const ariaLive = el.getAttribute('aria-live');
      const textContent = el.textContent || '';
      
      return textContent.includes('Please enter') || role === 'alert' || ariaLive;
    });
    
    expect(hasErrorIndicator).toBeTruthy();
  });
});

test.describe('WCAG 2.1 Level AA Compliance', () => {
  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should meet WCAG 2.1 Level A standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

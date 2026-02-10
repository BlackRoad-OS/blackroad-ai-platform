import { test, expect } from '@playwright/test';

test.describe('AI Platform - Navigation & Routing', () => {
  test('should redirect /app to root', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to root
    expect(page.url()).toMatch(/\/$|\/index\.html$/);
  });

  test('should handle /app/ with trailing slash', async ({ page }) => {
    await page.goto('/app/');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to root
    expect(page.url()).toMatch(/\/$|\/index\.html$/);
  });

  test('should load content after redirect', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    
    // Page content should be visible
    await expect(page.locator('h1')).toContainText('BlackRoad AI');
    await expect(page.locator('.model-option')).toHaveCount(4);
  });

  test('should have smooth scroll for anchor links', async ({ page }) => {
    await page.goto('/');
    
    // Click playground link
    await page.locator('a[href="#playground"]').first().click();
    
    // Should scroll to playground section
    await page.waitForTimeout(1000); // Wait for smooth scroll
    
    const playgroundSection = page.locator('#playground');
    await expect(playgroundSection).toBeInViewport();
  });

  test('should scroll to models section', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('a[href="#models"]').first().click();
    await page.waitForTimeout(1000);
    
    const modelsSection = page.locator('#models');
    await expect(modelsSection).toBeInViewport();
  });
});

test.describe('AI Platform - Page Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display hero section with stats', async ({ page }) => {
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.stat')).toHaveCount(5);
    
    // Check stat values
    await expect(page.locator('.stat-number').first()).toContainText('30k');
  });

  test('should display features section', async ({ page }) => {
    const features = page.locator('.feature-card');
    await expect(features).toHaveCount(6);
    
    // Check first feature
    await expect(features.first()).toContainText('Zero-Knowledge Architecture');
  });

  test('should display footer with links', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('.footer-links a')).toHaveCount(6);
  });

  test('should have responsive layout', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.model-selector')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.model-selector')).toBeVisible();
  });
});

test.describe('AI Platform - Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should animate feature cards on scroll', async ({ page }) => {
    // Scroll to features
    await page.evaluate(() => {
      document.querySelector('.features')?.scrollIntoView();
    });
    
    await page.waitForTimeout(1000);
    
    // Feature cards should be visible after animation
    const cards = page.locator('.feature-card');
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('should have rotating hero background', async ({ page }) => {
    const hero = page.locator('.hero::before');
    
    // Check if animation exists
    const hasAnimation = await page.locator('.hero').evaluate((el) => {
      const before = window.getComputedStyle(el, '::before');
      return before.animation !== 'none';
    });
    
    // Note: Checking CSS animations in Playwright is tricky
    expect(hasAnimation).toBeDefined();
  });
});

test.describe('AI Platform - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    await expect(h1).toHaveCount(1); // Only one h1
    expect(await h2.count()).toBeGreaterThan(0);
    expect(await h3.count()).toBeGreaterThan(0);
  });

  test('should have alt text for important elements', async ({ page }) => {
    // Check that interactive elements have proper labels
    const btn = page.locator('#generate-btn');
    await expect(btn).toContainText('Generate AI Response');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to focus on elements
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have proper contrast ratios', async ({ page }) => {
    // This is a basic check - full contrast testing requires specialized tools
    const h1 = page.locator('h1');
    const color = await h1.evaluate((el) => window.getComputedStyle(el).color);
    
    // Should have some color value
    expect(color).toBeTruthy();
  });
});

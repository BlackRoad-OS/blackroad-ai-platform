import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match homepage snapshot', async ({ page }) => {
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match model selector snapshot', async ({ page }) => {
    const modelSelector = page.locator('.model-selector');
    
    await expect(modelSelector).toHaveScreenshot('model-selector.png', {
      animations: 'disabled',
    });
  });

  test('should match active model tab snapshot', async ({ page }) => {
    const activeTab = page.locator('.model-option.active').first();
    
    await expect(activeTab).toHaveScreenshot('active-tab.png');
  });

  test('should match playground section snapshot', async ({ page }) => {
    const playground = page.locator('.playground-container');
    
    await expect(playground).toHaveScreenshot('playground.png', {
      animations: 'disabled',
    });
  });

  test('should match button states', async ({ page }) => {
    const button = page.locator('#generate-btn');
    
    // Default state
    await expect(button).toHaveScreenshot('button-default.png');
    
    // Hover state
    await button.hover();
    await page.waitForTimeout(200);
    await expect(button).toHaveScreenshot('button-hover.png');
  });

  test('should match slider controls', async ({ page }) => {
    const controls = page.locator('.controls');
    
    await expect(controls).toHaveScreenshot('slider-controls.png');
  });

  test('should match error state', async ({ page }) => {
    const button = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    // Trigger error
    await button.click();
    await page.waitForTimeout(500);
    
    await expect(output).toHaveScreenshot('error-message.png');
  });

  test('should match different model selections', async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.locator('.model-option').nth(i).click();
      await page.waitForTimeout(300);
      
      const selector = page.locator('.model-selector');
      await expect(selector).toHaveScreenshot(`model-selected-${i}.png`, {
        animations: 'disabled',
      });
    }
  });

  test('should match mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('mobile-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('tablet-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match desktop wide viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('desktop-wide-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match hero section', async ({ page }) => {
    const hero = page.locator('.hero');
    
    await expect(hero).toHaveScreenshot('hero-section.png', {
      animations: 'disabled',
    });
  });

  test('should match features grid', async ({ page }) => {
    const features = page.locator('.features-grid');
    
    await expect(features).toHaveScreenshot('features-grid.png', {
      animations: 'disabled',
    });
  });

  test('should match footer', async ({ page }) => {
    const footer = page.locator('footer');
    
    await expect(footer).toHaveScreenshot('footer.png');
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Set dark color scheme preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match dark mode homepage', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dark-homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Interactive States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match focus state on model tab', async ({ page }) => {
    const tab = page.locator('.model-option').first();
    await tab.focus();
    await page.waitForTimeout(200);
    
    await expect(tab).toHaveScreenshot('tab-focused.png');
  });

  test('should match loading state', async ({ page }) => {
    await page.locator('#prompt-input').fill('Test');
    const button = page.locator('#generate-btn');
    await button.click();
    
    // Capture loading state
    await page.waitForTimeout(200);
    await expect(button).toHaveScreenshot('button-loading.png');
  });

  test('should match slider at different values', async ({ page }) => {
    const slider = page.locator('#temperature');
    const sliderContainer = page.locator('.control-group').first();
    
    // Test different slider positions
    await slider.fill('0');
    await expect(sliderContainer).toHaveScreenshot('slider-min.png');
    
    await slider.fill('1');
    await expect(sliderContainer).toHaveScreenshot('slider-mid.png');
    
    await slider.fill('2');
    await expect(sliderContainer).toHaveScreenshot('slider-max.png');
  });
});

test.describe('Visual Regression - Responsive Breakpoints', () => {
  const breakpoints = [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile', width: 375, height: 667 },
    { name: 'mobile-large', width: 414, height: 896 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1024, height: 768 },
    { name: 'desktop-hd', width: 1920, height: 1080 },
  ];

  for (const breakpoint of breakpoints) {
    test(`should match ${breakpoint.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(`${breakpoint.name}-view.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual Regression - Component Comparison', () => {
  test('should detect visual changes in model tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const tabs = page.locator('.model-option');
    const count = await tabs.count();
    
    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toHaveScreenshot(`model-tab-${i}.png`);
    }
  });

  test('should detect visual changes in all sliders', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const sliderGroups = page.locator('.control-group');
    const count = await sliderGroups.count();
    
    for (let i = 0; i < count; i++) {
      const group = sliderGroups.nth(i);
      await expect(group).toHaveScreenshot(`slider-group-${i}.png`);
    }
  });
});

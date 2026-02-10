import { test, expect } from '@playwright/test';

test.describe('AI Platform - Parameter Sliders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display all three sliders', async ({ page }) => {
    await expect(page.locator('#temperature')).toBeVisible();
    await expect(page.locator('#max-tokens')).toBeVisible();
    await expect(page.locator('#top-p')).toBeVisible();
  });

  test('should show correct default values', async ({ page }) => {
    await expect(page.locator('#temp-value')).toHaveText('0.7');
    await expect(page.locator('#tokens-value')).toHaveText('2048');
    await expect(page.locator('#topp-value')).toHaveText('0.9');
  });

  test('should update temperature value when slider changes', async ({ page }) => {
    const slider = page.locator('#temperature');
    const display = page.locator('#temp-value');
    
    // Set to maximum
    await slider.fill('2');
    await expect(display).toHaveText('2');
    
    // Set to minimum
    await slider.fill('0');
    await expect(display).toHaveText('0');
    
    // Set to middle value
    await slider.fill('1');
    await expect(display).toHaveText('1');
  });

  test('should update max tokens value when slider changes', async ({ page }) => {
    const slider = page.locator('#max-tokens');
    const display = page.locator('#tokens-value');
    
    // Set to maximum
    await slider.fill('8192');
    await expect(display).toHaveText('8192');
    
    // Set to minimum
    await slider.fill('128');
    await expect(display).toHaveText('128');
    
    // Set to custom value
    await slider.fill('4096');
    await expect(display).toHaveText('4096');
  });

  test('should update top-p value when slider changes', async ({ page }) => {
    const slider = page.locator('#top-p');
    const display = page.locator('#topp-value');
    
    // Set to maximum
    await slider.fill('1');
    await expect(display).toHaveText('1');
    
    // Set to minimum
    await slider.fill('0');
    await expect(display).toHaveText('0');
    
    // Set to middle value
    await slider.fill('0.5');
    await expect(display).toHaveText('0.5');
  });

  test('should have correct slider ranges', async ({ page }) => {
    // Temperature: 0-2
    await expect(page.locator('#temperature')).toHaveAttribute('min', '0');
    await expect(page.locator('#temperature')).toHaveAttribute('max', '2');
    await expect(page.locator('#temperature')).toHaveAttribute('step', '0.1');
    
    // Max Tokens: 128-8192
    await expect(page.locator('#max-tokens')).toHaveAttribute('min', '128');
    await expect(page.locator('#max-tokens')).toHaveAttribute('max', '8192');
    await expect(page.locator('#max-tokens')).toHaveAttribute('step', '128');
    
    // Top P: 0-1
    await expect(page.locator('#top-p')).toHaveAttribute('min', '0');
    await expect(page.locator('#top-p')).toHaveAttribute('max', '1');
    await expect(page.locator('#top-p')).toHaveAttribute('step', '0.05');
  });

  test('should update all sliders independently', async ({ page }) => {
    await page.locator('#temperature').fill('1.5');
    await page.locator('#max-tokens').fill('4096');
    await page.locator('#top-p').fill('0.8');
    
    await expect(page.locator('#temp-value')).toHaveText('1.5');
    await expect(page.locator('#tokens-value')).toHaveText('4096');
    await expect(page.locator('#topp-value')).toHaveText('0.8');
  });

  test('should maintain slider values after model switch', async ({ page }) => {
    // Set custom values
    await page.locator('#temperature').fill('1.2');
    await page.locator('#max-tokens').fill('1024');
    
    // Switch model
    await page.locator('.model-option').nth(1).click();
    
    // Values should persist
    await expect(page.locator('#temp-value')).toHaveText('1.2');
    await expect(page.locator('#tokens-value')).toHaveText('1024');
  });
});

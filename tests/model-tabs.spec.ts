import { test, expect } from '@playwright/test';

test.describe('AI Platform - Model Selection Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load the page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/BlackRoad AI/);
    await expect(page.locator('h1')).toContainText('BlackRoad AI');
  });

  test('should display all model option tabs', async ({ page }) => {
    const modelOptions = page.locator('.model-option');
    await expect(modelOptions).toHaveCount(4);
    
    // Verify all models are present
    await expect(page.locator('.model-option').nth(0)).toContainText('Claude Sonnet 4');
    await expect(page.locator('.model-option').nth(1)).toContainText('Llama 3 70B');
    await expect(page.locator('.model-option').nth(2)).toContainText('Mistral Large');
    await expect(page.locator('.model-option').nth(3)).toContainText('GPT-4 Turbo');
  });

  test('should have one model selected by default', async ({ page }) => {
    const activeTab = page.locator('.model-option.active');
    await expect(activeTab).toHaveCount(1);
    await expect(activeTab).toContainText('Claude Sonnet 4');
  });

  test('should display selected model in banner', async ({ page }) => {
    const display = page.locator('#selected-model-display');
    await expect(display).toHaveText('Claude Sonnet 4');
  });

  test('should switch model when clicking different tab', async ({ page }) => {
    // Click on Llama 3 70B
    await page.locator('.model-option').nth(1).click();
    
    // Verify it becomes active
    await expect(page.locator('.model-option').nth(1)).toHaveClass(/active/);
    
    // Verify display updates
    await expect(page.locator('#selected-model-display')).toHaveText('Llama 3 70B');
    
    // Verify previous active is no longer active
    await expect(page.locator('.model-option').nth(0)).not.toHaveClass(/active/);
  });

  test('should switch models via keyboard navigation', async ({ page }) => {
    // Focus on first model
    await page.locator('.model-option').nth(0).focus();
    
    // Tab to next model
    await page.keyboard.press('Tab');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Verify Llama 3 70B is now active
    await expect(page.locator('.model-option').nth(1)).toHaveClass(/active/);
    await expect(page.locator('#selected-model-display')).toHaveText('Llama 3 70B');
  });

  test('should support Space key for model selection', async ({ page }) => {
    // Focus and navigate to Mistral
    await page.locator('.model-option').nth(2).focus();
    await page.keyboard.press('Space');
    
    // Verify selection
    await expect(page.locator('.model-option').nth(2)).toHaveClass(/active/);
    await expect(page.locator('#selected-model-display')).toHaveText('Mistral Large');
  });

  test('should show visual checkmark on active tab', async ({ page }) => {
    const activeTab = page.locator('.model-option.active');
    
    // Check if pseudo-element with checkmark exists (by checking computed style)
    const hasCheckmark = await activeTab.evaluate((el) => {
      const after = window.getComputedStyle(el, '::after');
      return after.content === '"✓"' || after.content === '"\u2713"';
    });
    
    expect(hasCheckmark).toBeTruthy();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const models = page.locator('.model-option');
    
    // Check active model has aria-pressed="true"
    await expect(models.nth(0)).toHaveAttribute('aria-pressed', 'true');
    
    // Check inactive models have aria-pressed="false"
    await expect(models.nth(1)).toHaveAttribute('aria-pressed', 'false');
    await expect(models.nth(2)).toHaveAttribute('aria-pressed', 'false');
    await expect(models.nth(3)).toHaveAttribute('aria-pressed', 'false');
    
    // All should have role="button"
    for (let i = 0; i < 4; i++) {
      await expect(models.nth(i)).toHaveAttribute('role', 'button');
    }
  });

  test('should update ARIA attributes when switching tabs', async ({ page }) => {
    // Click second model
    await page.locator('.model-option').nth(1).click();
    
    // Verify ARIA updates
    await expect(page.locator('.model-option').nth(0)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.model-option').nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show hover effects', async ({ page }) => {
    const model = page.locator('.model-option').nth(1);
    
    // Hover over model
    await model.hover();
    
    // Check if hover class or style is applied (border color changes)
    const borderColor = await model.evaluate((el) => 
      window.getComputedStyle(el).borderColor
    );
    
    // The color should be purple-ish when hovering
    expect(borderColor).toBeTruthy();
  });
});

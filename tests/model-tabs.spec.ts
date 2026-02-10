import { test, expect } from '@playwright/test';

test.describe('AI Platform - Model Selection Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    // Make sure we're on the AI Models tab
    const aiTab = page.locator('.main-tab[data-tab="ai"]');
    if (!(await aiTab.getAttribute('aria-selected')) === 'true') {
      await aiTab.click();
      await page.waitForTimeout(500);
    }
    await page.waitForLoadState('networkidle');
  });

  test('should load the page successfully', async ({ page }) => {
    // Verify main navigation tabs exist
    await expect(page.locator('.main-tabs')).toBeVisible();
    await expect(page.locator('.main-tab[data-tab="ai"]')).toBeVisible();
    
    // Verify AI panel is active
    await expect(page.locator('#ai-panel')).toHaveClass(/active/);
  });

  test('should display all model option tabs', async ({ page }) => {
    // Model options should be inside the AI panel
    const modelOptions = page.locator('#ai-panel .model-option');
    await expect(modelOptions).toHaveCount(4);
    
    // Verify all models are present
    await expect(modelOptions.nth(0)).toContainText('Claude Sonnet 4');
    await expect(modelOptions.nth(1)).toContainText('Llama 3 70B');
    await expect(modelOptions.nth(2)).toContainText('Mistral Large');
    await expect(modelOptions.nth(3)).toContainText('GPT-4 Turbo');
  });

  test('should have one model selected by default', async ({ page }) => {
    const activeModels = await page.locator('#ai-panel .model-option.active').count();
    expect(activeModels).toBe(1);
  });

  test('should display selected model in banner', async ({ page }) => {
    await expect(page.locator('#ai-panel #selected-model-display')).toBeVisible();
  });

  test('should switch model when clicking different tab', async ({ page }) => {
    // Click on a model option inside AI panel
    const firstModel = page.locator('#ai-panel .model-option').first();
    await firstModel.click();
    
    // Verify it becomes active
    await expect(firstModel).toHaveClass(/active/);
    
    // Click on a different model
    const secondModel = page.locator('#ai-panel .model-option').nth(1);
    await secondModel.click();
    
    // Verify second model is now active
    await expect(secondModel).toHaveClass(/active/);
  });

  test('should switch models via keyboard navigation', async ({ page }) => {
    // Focus on first model inside AI panel
    const firstModel = page.locator('#ai-panel .model-option').first();
    await firstModel.focus();
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Verify it's active
    await expect(firstModel).toHaveClass(/active/);
  });

  test('should support Space key for model selection', async ({ page }) => {
    const firstModel = page.locator('#ai-panel .model-option').first();
    await firstModel.focus();
    await page.keyboard.press('Space');
    
    await expect(firstModel).toHaveClass(/active/);
  });

  test('should show visual checkmark on active tab', async ({ page }) => {
    const activeModel = page.locator('#ai-panel .model-option.active');
    await expect(activeModel).toBeVisible();
    
    // Check if ::after pseudo-element exists by checking computed styles
    const hasCheckmark = await activeModel.evaluate((el) => {
      const after = window.getComputedStyle(el, '::after');
      return after.content !== 'none' && after.content !== '';
    });
    
    expect(hasCheckmark).toBe(true);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const modelOptions = page.locator('#ai-panel .model-option');
    const firstModel = modelOptions.first();
    
    // Check for accessibility attributes
    await expect(firstModel).toHaveAttribute('tabindex', '0');
    await expect(firstModel).toHaveAttribute('role', 'button');
    
    // Active model should have aria-pressed="true"
    const activeModel = page.locator('#ai-panel .model-option.active');
    const ariaPressed = await activeModel.getAttribute('aria-pressed');
    expect(ariaPressed).toBe('true');
  });

  test('should update ARIA attributes when switching tabs', async ({ page }) => {
    const firstModel = page.locator('#ai-panel .model-option').first();
    await firstModel.click();
    
    expect(await firstModel.getAttribute('aria-pressed')).toBe('true');
  });

  test('should show hover effects', async ({ page }) => {
    const firstModel = page.locator('#ai-panel .model-option').first();
    
    // Hover over the model
    await firstModel.hover();
    
    // Wait a moment for hover effect
    await page.waitForTimeout(300);
    
    // Element should still be visible (hover doesn't hide it)
    await expect(firstModel).toBeVisible();
  });
});

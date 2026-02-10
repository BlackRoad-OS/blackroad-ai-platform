import { test, expect } from '@playwright/test';

test.describe('AI Platform - Generate Button & AI Response', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display generate button', async ({ page }) => {
    const btn = page.locator('#generate-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('Generate AI Response');
  });

  test('should show error when generating with empty prompt', async ({ page }) => {
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    await btn.click();
    
    // Should show error message
    await expect(output).toContainText('Please enter a prompt first');
  });

  test('should generate response with valid prompt', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    // Enter a prompt
    await input.fill('Write a Python function for factorial');
    await btn.click();
    
    // Should show loading state
    await expect(btn).toContainText('Generating...');
    await expect(btn).toBeDisabled();
    await expect(output).toContainText('Thinking...');
    
    // Wait for response (2 seconds timeout in the code)
    await page.waitForTimeout(2500);
    
    // Should show response
    await expect(output).toContainText('AI Response');
    await expect(btn).toContainText('Generate AI Response');
    await expect(btn).toBeEnabled();
  });

  test('should include selected model in response', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    // Switch to Llama model
    await page.locator('.model-option').nth(1).click();
    
    // Generate response
    await input.fill('Test prompt');
    await btn.click();
    await page.waitForTimeout(2500);
    
    // Response should mention Llama 3 70B
    await expect(output).toContainText('Llama 3 70B');
  });

  test('should show model name from default selection', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    // Generate with default model (Claude Sonnet 4)
    await input.fill('Test');
    await btn.click();
    await page.waitForTimeout(2500);
    
    await expect(output).toContainText('Claude Sonnet 4');
  });

  test('should handle multiple generations', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    
    // First generation
    await input.fill('First prompt');
    await btn.click();
    await page.waitForTimeout(2500);
    await expect(btn).toBeEnabled();
    
    // Second generation
    await input.clear();
    await input.fill('Second prompt');
    await btn.click();
    await page.waitForTimeout(2500);
    await expect(btn).toBeEnabled();
  });

  test('should display loading animation', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    await input.fill('Test');
    await btn.click();
    
    // Check for loading class
    const loadingSpan = output.locator('.loading');
    await expect(loadingSpan).toBeVisible();
    await expect(loadingSpan).toContainText('Thinking');
  });

  test('should show proper button state changes', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    
    await input.fill('Test');
    
    // Initial state
    await expect(btn).toBeEnabled();
    
    // Click to generate
    await btn.click();
    
    // Loading state
    await expect(btn).toBeDisabled();
    const opacity = await btn.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
    
    // Wait for completion
    await page.waitForTimeout(2500);
    
    // Final state
    await expect(btn).toBeEnabled();
  });

  test('should preserve prompt text during generation', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    
    const promptText = 'Write a function to sort an array';
    await input.fill(promptText);
    await btn.click();
    
    // Prompt should still be there
    await expect(input).toHaveValue(promptText);
    
    await page.waitForTimeout(2500);
    
    // Still there after generation
    await expect(input).toHaveValue(promptText);
  });

  test('should include prompt text in response', async ({ page }) => {
    const input = page.locator('#prompt-input');
    const btn = page.locator('#generate-btn');
    const output = page.locator('#output');
    
    await input.fill('Write a hello world program');
    await btn.click();
    await page.waitForTimeout(2500);
    
    // Response should reference the prompt
    await expect(output).toContainText('Based on your prompt');
  });
});

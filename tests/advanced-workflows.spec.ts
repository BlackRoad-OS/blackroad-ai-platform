import { test, expect } from '@playwright/test';
import { TestData, TestUtils, AIPlaygroundPage } from './test-helpers';

test.describe('Advanced User Workflows', () => {
  let playground: AIPlaygroundPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    playground = new AIPlaygroundPage(page);
  });

  test('should complete full user workflow', async ({ page }) => {
    // User selects a different model
    await playground.selectModelByName('Llama 3 70B');
    await playground.expectModelSelected('Llama 3 70B');

    // User adjusts parameters
    await playground.setTemperature(1.2);
    await playground.setMaxTokens(4096);
    await playground.setTopP(0.95);

    // User enters prompt and generates
    await playground.generateResponse(TestData.prompts.simple);

    // Verify response includes model name
    await playground.expectOutputContains('Llama 3 70B');
  });

  test('should handle rapid model switching', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        await playground.selectModel(j);
        await TestUtils.waitForAnimation(page, 100);
      }
    }

    // Should end in a stable state
    await expect(playground.activeModel).toHaveCount(1);
  });

  test('should maintain state across interactions', async ({ page }) => {
    // Set custom values
    await playground.enterPrompt(TestData.prompts.complex);
    await playground.setTemperature(1.5);
    await playground.setMaxTokens(1024);

    // Switch models
    await playground.selectModel(1);
    await playground.selectModel(2);
    await playground.selectModel(0);

    // Values should persist
    await expect(playground.promptInput).toHaveValue(TestData.prompts.complex);
    await expect(page.locator('#temp-value')).toHaveText('1.5');
    await expect(page.locator('#tokens-value')).toHaveText('1024');
  });

  test('should recover from errors gracefully', async ({ page }) => {
    // Trigger error with empty prompt
    await playground.clickGenerate();
    await playground.expectOutputContains('Please enter a prompt');

    // Should recover and work normally
    await playground.generateResponse(TestData.prompts.simple);
    await playground.expectOutputContains('AI Response');
  });

  test('should handle edge cases', async ({ page }) => {
    // Very long prompt
    await playground.enterPrompt(TestData.prompts.long);
    await expect(playground.promptInput).toHaveValue(TestData.prompts.long);

    // Special characters
    await playground.enterPrompt(TestData.prompts.special);
    await playground.clickGenerate();
    await playground.waitForResponse();

    // Should handle without errors
    await playground.expectGenerateButtonEnabled();
  });

  test('should support keyboard-only navigation', async ({ page }) => {
    // Navigate using only keyboard
    await page.keyboard.press('Tab'); // First interactive element
    await page.keyboard.press('Tab'); // Maybe CTA button
    await page.keyboard.press('Tab'); // Eventually reach model tabs

    // Press Enter on a model tab
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    await page.keyboard.press('Enter');

    // Should have selected a model
    const activeModel = await playground.activeModel.count();
    expect(activeModel).toBeGreaterThanOrEqual(1);
  });

  test('should handle concurrent operations', async ({ page }) => {
    // Start multiple operations at once
    const promises = [
      playground.setTemperature(1.8),
      playground.setMaxTokens(8000),
      playground.setTopP(0.85),
      playground.selectModel(2),
    ];

    await Promise.all(promises);

    // All operations should complete successfully
    await expect(page.locator('#temp-value')).toHaveText('1.8');
    await expect(page.locator('#tokens-value')).toHaveText('8000');
    await expect(page.locator('#topp-value')).toHaveText('0.85');
  });
});

test.describe('Stress Testing', () => {
  let playground: AIPlaygroundPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    playground = new AIPlaygroundPage(page);
  });

  test('should handle 100 rapid slider changes', async ({ page }) => {
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      const value = TestUtils.randomSliderValue('temperature');
      await playground.setTemperature(value);
    }

    const duration = performance.now() - startTime;
    console.log(`100 slider changes completed in ${duration}ms`);

    // Should remain responsive
    await playground.expectGenerateButtonEnabled();
  });

  test('should handle 50 model switches', async ({ page }) => {
    for (let i = 0; i < 50; i++) {
      const modelIndex = TestUtils.randomModel();
      await playground.selectModel(modelIndex);
    }

    // Should still be in valid state
    await expect(playground.activeModel).toHaveCount(1);
  });

  test('should handle multiple generations in succession', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await playground.enterPrompt(`Test prompt ${i}`);
      await playground.clickGenerate();
      await TestUtils.waitForAnimation(page, 2500);
    }

    // Button should be enabled for next generation
    await playground.expectGenerateButtonEnabled();
  });
});

test.describe('User Journey Tests', () => {
  let playground: AIPlaygroundPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    playground = new AIPlaygroundPage(page);
  });

  test('new user explores all features', async ({ page }) => {
    // Step 1: User reads the page
    await expect(page.locator('h1')).toContainText('BlackRoad AI');
    await TestUtils.waitForAnimation(page, 500);

    // Step 2: User tries different models
    for (let i = 0; i < 4; i++) {
      await playground.selectModel(i);
      await TestUtils.waitForAnimation(page, 300);
    }

    // Step 3: User experiments with sliders
    await playground.setTemperature(1.5);
    await playground.setMaxTokens(4096);
    await playground.setTopP(0.8);

    // Step 4: User tries generation
    await playground.generateResponse(TestData.prompts.simple);
    await playground.expectOutputContains('AI Response');

    // Step 5: User tries again with different settings
    await playground.selectModelByName('Mistral Large');
    await playground.generateResponse(TestData.prompts.complex);
    await playground.expectOutputContains('Mistral Large');
  });

  test('power user rapid workflow', async ({ page }) => {
    // Power user knows exactly what they want
    await playground.selectModelByName('Claude Sonnet 4');
    await playground.setTemperature(0.3);
    await playground.setMaxTokens(8192);
    await playground.enterPrompt(TestData.prompts.code);
    await playground.clickGenerate();

    // Should complete workflow quickly
    await playground.waitForResponse();
    await playground.expectOutputContains('AI Response');
  });

  test('user makes and corrects mistakes', async ({ page }) => {
    // User tries to generate without prompt
    await playground.clickGenerate();
    await playground.expectOutputContains('Please enter a prompt');

    // User realizes mistake and enters prompt
    await playground.enterPrompt(TestData.prompts.simple);

    // User accidentally clears prompt
    await playground.clearPrompt();

    // User re-enters prompt
    await playground.enterPrompt(TestData.prompts.simple);
    await playground.clickGenerate();

    // Should work correctly
    await playground.waitForResponse();
    await playground.expectGenerateButtonEnabled();
  });
});

test.describe('Cross-Browser Consistency', () => {
  let playground: AIPlaygroundPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    playground = new AIPlaygroundPage(page);
  });

  test('should work identically across browsers', async ({ page, browserName }) => {
    console.log(`Testing on: ${browserName}`);

    // Same workflow on all browsers
    await playground.selectModel(1);
    await playground.setTemperature(1.0);
    await playground.enterPrompt(TestData.prompts.simple);
    await playground.clickGenerate();
    await playground.waitForResponse();

    // Should have same results
    await playground.expectOutputContains('AI Response');
    await playground.expectModelSelected('Llama 3 70B');
  });
});

test.describe('Network Conditions', () => {
  test('should work on slow 3G', async ({ page, context }) => {
    // Simulate slow network
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should still be functional
    const playground = new AIPlaygroundPage(page);
    await playground.selectModel(1);
    await expect(playground.activeModel).toHaveCount(1);
  });

  test('should handle offline gracefully', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Page should still be interactive (it's client-side)
    const playground = new AIPlaygroundPage(page);
    await playground.selectModel(1);
    await playground.setTemperature(1.2);

    // Should work without network
    await expect(playground.selectedModelDisplay).toContainText('Llama');
  });
});

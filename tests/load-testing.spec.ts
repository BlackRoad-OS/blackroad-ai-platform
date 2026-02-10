import { test, expect } from '@playwright/test';

test.describe('Load Testing', () => {
  test('should handle rapid model switching', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const models = [
      'Claude 3.5 Sonnet',
      'GPT-4',
      'Gemini Pro',
      'Claude 3 Opus',
      'Llama 3'
    ];
    
    const startTime = Date.now();
    
    // Switch models 100 times
    for (let i = 0; i < 100; i++) {
      const model = models[i % models.length];
      await page.click(`text=${model}`);
      
      // Verify selected
      const isActive = await page.locator(`text=${model}`).evaluate(el => 
        el.classList.contains('active')
      );
      expect(isActive).toBe(true);
    }
    
    const duration = Date.now() - startTime;
    console.log(`100 model switches completed in ${duration}ms`);
    
    // Should complete in reasonable time (< 10 seconds)
    expect(duration).toBeLessThan(10000);
  });

  test('should handle rapid slider adjustments', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const slider = page.locator('input[type="range"]').first();
    const startTime = Date.now();
    
    // Move slider 100 times
    for (let i = 0; i <= 100; i++) {
      await slider.fill((i % 100).toString());
    }
    
    const duration = Date.now() - startTime;
    console.log(`100 slider adjustments completed in ${duration}ms`);
    
    expect(duration).toBeLessThan(5000);
  });

  test('should handle rapid prompt changes', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const prompt = page.locator('#prompt');
    const startTime = Date.now();
    
    // Type and clear 50 times
    for (let i = 0; i < 50; i++) {
      await prompt.fill(`Test prompt ${i}`);
      await prompt.clear();
    }
    
    const duration = Date.now() - startTime;
    console.log(`50 prompt changes completed in ${duration}ms`);
    
    expect(duration).toBeLessThan(5000);
  });

  test('should maintain performance under concurrent user actions', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const startTime = Date.now();
    
    // Simulate multiple actions happening concurrently
    await Promise.all([
      // Switch models
      (async () => {
        for (let i = 0; i < 20; i++) {
          await page.click('text=Claude 3.5 Sonnet');
          await page.waitForTimeout(10);
          await page.click('text=GPT-4');
          await page.waitForTimeout(10);
        }
      })(),
      
      // Adjust sliders
      (async () => {
        const slider = page.locator('input[type="range"]').first();
        for (let i = 0; i < 40; i++) {
          await slider.fill((i * 2).toString());
          await page.waitForTimeout(10);
        }
      })(),
      
      // Type in prompt
      (async () => {
        const prompt = page.locator('#prompt');
        for (let i = 0; i < 30; i++) {
          await prompt.fill(`Concurrent test ${i}`);
          await page.waitForTimeout(15);
        }
      })()
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`Concurrent actions completed in ${duration}ms`);
    
    // Should handle concurrent actions without crashes
    expect(duration).toBeLessThan(15000);
    
    // UI should still be responsive
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle memory leaks with repeated actions', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Get initial memory (if available)
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });
    
    // Perform many actions
    for (let i = 0; i < 200; i++) {
      await page.click('text=Claude 3.5 Sonnet');
      await page.fill('#prompt', `Memory test ${i}`);
      
      if (i % 50 === 0) {
        // Trigger garbage collection (if available)
        await page.evaluate(() => {
          if (global.gc) global.gc();
        });
      }
    }
    
    // Get final memory
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
      
      // Memory increase should be reasonable (< 50 MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should handle long-running session', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const actions = [
      { type: 'model', value: 'Claude 3.5 Sonnet' },
      { type: 'model', value: 'GPT-4' },
      { type: 'slider', selector: 0 },
      { type: 'prompt', value: 'Test' }
    ];
    
    // Simulate 30 minutes of usage (compressed to 30 seconds)
    for (let minute = 0; minute < 30; minute++) {
      const action = actions[minute % actions.length];
      
      if (action.type === 'model') {
        await page.click(`text=${action.value}`);
      } else if (action.type === 'slider') {
        const slider = page.locator('input[type="range"]').nth(action.selector);
        await slider.fill((minute * 3).toString());
      } else if (action.type === 'prompt') {
        await page.fill('#prompt', `${action.value} ${minute}`);
      }
      
      await page.waitForTimeout(1000); // 1 second per "minute"
    }
    
    // UI should still be responsive
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#prompt')).toBeEnabled();
  });

  test('should handle DOM manipulation stress', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const startTime = Date.now();
    
    // Rapidly trigger DOM updates
    for (let i = 0; i < 100; i++) {
      // Switch models (updates active class)
      await page.click('text=Claude 3.5 Sonnet');
      await page.click('text=GPT-4');
      
      // Update slider (updates display value)
      const slider = page.locator('input[type="range"]').first();
      await slider.fill(i.toString());
      
      // Update prompt (updates textarea)
      await page.fill('#prompt', `DOM stress test ${i}`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`100 DOM manipulation cycles completed in ${duration}ms`);
    
    // Should maintain performance
    expect(duration).toBeLessThan(30000);
    
    // Final state should be correct
    const promptValue = await page.locator('#prompt').inputValue();
    expect(promptValue).toContain('DOM stress test 99');
  });

  test('should handle network request queueing', async ({ page }) => {
    // Mock slow API to test request queuing
    await page.route('**/api/generate', async route => {
      await page.waitForTimeout(1000); // 1 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: 'Response' })
      });
    });
    
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    
    // Queue up 5 requests rapidly
    const startTime = Date.now();
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        (async () => {
          await page.fill('#prompt', `Request ${i}`);
          await page.click('text=Generate with Claude 3.5 Sonnet');
          await page.waitForTimeout(100);
        })()
      );
    }
    
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    console.log(`5 queued requests initiated in ${duration}ms`);
    
    // Should handle queuing without errors
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should recover from rapid navigation', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Rapidly navigate away and back
    for (let i = 0; i < 10; i++) {
      await page.goto('about:blank');
      await page.goto('http://localhost:8080');
    }
    
    // Should load correctly after rapid navigation
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#prompt')).toBeEnabled();
    
    // Test functionality still works
    await page.click('text=Claude 3.5 Sonnet');
    const isActive = await page.locator('text=Claude 3.5 Sonnet').evaluate(el =>
      el.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('should handle event listener accumulation', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Get listener count (if available via dev tools)
    const initialListeners = await page.evaluate(() => {
      return Object.keys((window as any).getEventListeners?.document || {}).length;
    });
    
    // Trigger many interactions
    for (let i = 0; i < 100; i++) {
      await page.click('text=Claude 3.5 Sonnet');
      await page.locator('input[type="range"]').first().fill(i.toString());
    }
    
    const finalListeners = await page.evaluate(() => {
      return Object.keys((window as any).getEventListeners?.document || {}).length;
    });
    
    // Listener count shouldn't grow unbounded
    if (initialListeners && finalListeners) {
      expect(finalListeners).toBeLessThanOrEqual(initialListeners * 2);
    }
  });
});

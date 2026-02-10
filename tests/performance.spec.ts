import { test, expect, devices } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.use({ ...devices['Desktop Chrome'] });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page loaded in ${loadTime}ms`);
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have fast First Contentful Paint', async ({ page }) => {
    await page.goto('/');
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      return {
        fcp: fcp ? fcp.startTime : 0,
      };
    });
    
    console.log(`First Contentful Paint: ${metrics.fcp}ms`);
    
    // FCP should be under 1.8s (good threshold)
    expect(metrics.fcp).toBeLessThan(1800);
  });

  test('should have minimal main thread blocking', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for long tasks (blocking main thread for >50ms)
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries.filter((entry: any) => entry.duration > 50).length);
        });
        
        try {
          observer.observe({ entryTypes: ['longtask'] });
          setTimeout(() => {
            observer.disconnect();
            resolve(0);
          }, 5000);
        } catch {
          // PerformanceObserver for longtask not supported in all browsers
          resolve(0);
        }
      });
    });
    
    console.log(`Long tasks detected: ${longTasks}`);
    
    // Should have minimal long tasks
    expect(longTasks).toBeLessThanOrEqual(5);
  });

  test('should have fast DOM interactive time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const domInteractiveTime = Date.now() - startTime;
    console.log(`DOM Interactive: ${domInteractiveTime}ms`);
    
    // DOM should be interactive in under 1.5s
    expect(domInteractiveTime).toBeLessThan(1500);
  });

  test('should efficiently render model tabs', async ({ page }) => {
    await page.goto('/');
    
    const startTime = performance.now();
    await page.locator('.model-option').first().waitFor();
    const renderTime = performance.now() - startTime;
    
    console.log(`Model tabs rendered in ${renderTime}ms`);
    
    // Should render quickly
    expect(renderTime).toBeLessThan(500);
  });

  test('should handle rapid interactions without lag', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = performance.now();
    
    // Rapidly click through model tabs
    for (let i = 0; i < 4; i++) {
      await page.locator('.model-option').nth(i).click();
      await page.waitForTimeout(50); // Minimal wait
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`4 rapid clicks completed in ${totalTime}ms`);
    
    // Should handle rapid interactions smoothly
    expect(totalTime).toBeLessThan(1000);
  });

  test('should load fonts efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Check for font loading performance
    const fontMetrics = await page.evaluate(() => {
      const fontEntries = performance.getEntriesByType('resource')
        .filter((entry: any) => entry.name.includes('font'));
      
      return {
        count: fontEntries.length,
        totalSize: fontEntries.reduce((sum: number, entry: any) => sum + (entry.transferSize || 0), 0),
      };
    });
    
    console.log(`Fonts loaded: ${fontMetrics.count}, Total size: ${fontMetrics.totalSize} bytes`);
    
    // Should have reasonable font usage
    expect(fontMetrics.count).toBeLessThanOrEqual(5);
  });

  test('should have small total page size', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Measure total resource size
    const resourceSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const totalSize = resources.reduce((sum: number, entry: any) => {
        return sum + (entry.transferSize || 0);
      }, 0);
      
      return {
        totalSize,
        resourceCount: resources.length,
      };
    });
    
    console.log(`Total resources: ${resourceSize.resourceCount}, Total size: ${(resourceSize.totalSize / 1024).toFixed(2)} KB`);
    
    // Since it's a single HTML file, should be lightweight
    expect(resourceSize.totalSize).toBeLessThan(500 * 1024); // 500KB
  });

  test('should have fast slider response time', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const slider = page.locator('#temperature');
    const display = page.locator('#temp-value');
    
    const startTime = performance.now();
    await slider.fill('1.5');
    await expect(display).toHaveText('1.5');
    const responseTime = performance.now() - startTime;
    
    console.log(`Slider response time: ${responseTime}ms`);
    
    // Should update instantly
    expect(responseTime).toBeLessThan(100);
  });

  test('should maintain performance with multiple interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = performance.now();
    
    // Simulate real user interaction pattern
    await page.locator('.model-option').nth(1).click();
    await page.locator('#temperature').fill('1.2');
    await page.locator('#max-tokens').fill('4096');
    await page.locator('#prompt-input').fill('Test prompt');
    await page.locator('.model-option').nth(2).click();
    
    const totalTime = performance.now() - startTime;
    console.log(`Complex interaction sequence: ${totalTime}ms`);
    
    // Should remain responsive
    expect(totalTime).toBeLessThan(2000);
  });
});

test.describe('Performance on Mobile', () => {
  test.use({ ...devices['Pixel 5'] });

  test('should load quickly on mobile', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Mobile load time: ${loadTime}ms`);
    
    // Mobile should still load in under 4 seconds
    expect(loadTime).toBeLessThan(4000);
  });

  test('should be responsive to touch on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = performance.now();
    
    // Tap a model tab
    await page.locator('.model-option').nth(1).tap();
    await page.locator('.model-option').nth(1).waitFor({ state: 'attached' });
    
    const responseTime = performance.now() - startTime;
    console.log(`Touch response time: ${responseTime}ms`);
    
    // Should respond quickly to touch
    expect(responseTime).toBeLessThan(300);
  });
});

test.describe('Resource Loading Performance', () => {
  test('should minimize number of requests', async ({ page }) => {
    let requestCount = 0;
    
    page.on('request', () => {
      requestCount++;
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log(`Total HTTP requests: ${requestCount}`);
    
    // Single HTML file architecture should have minimal requests
    expect(requestCount).toBeLessThan(10);
  });

  test('should have efficient caching strategy', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Second visit (should use cache)
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const secondLoadTime = Date.now() - startTime;
    
    console.log(`Cached load time: ${secondLoadTime}ms`);
    
    // Cached load should be faster
    expect(secondLoadTime).toBeLessThan(2000);
  });
});

test.describe('Memory Performance', () => {
  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Perform multiple interactions
    for (let i = 0; i < 10; i++) {
      await page.locator('.model-option').nth(i % 4).click();
      await page.locator('#temperature').fill(`${1 + (i % 10) * 0.1}`);
    }
    
    // Check JavaScript heap size
    const metrics = await page.evaluate(() => {
      if (performance && (performance as any).memory) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        };
      }
      return null;
    });
    
    if (metrics) {
      console.log(`JS Heap used: ${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      
      // Should use reasonable amount of memory
      const heapUsagePercent = (metrics.usedJSHeapSize / metrics.jsHeapSizeLimit) * 100;
      expect(heapUsagePercent).toBeLessThan(50); // Less than 50% of heap limit
    }
  });
});

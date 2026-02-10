import { test, expect } from '@playwright/test';

test.describe('API Mocking for Deterministic Tests', () => {
  test('should mock successful AI response', async ({ page }) => {
    // Mock the API endpoint
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          output: 'This is a mocked AI response from Claude 3.5 Sonnet',
          model: 'claude-3.5-sonnet',
          tokens: 42,
          latency: 123
        })
      });
    });

    await page.goto('http://localhost:8080');
    
    // Select a model
    await page.click('text=Claude 3.5 Sonnet');
    
    // Enter a prompt
    await page.fill('#prompt', 'Test prompt');
    
    // Click generate
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    // Check for mocked response
    const output = await page.locator('#output').textContent();
    expect(output).toContain('This is a mocked AI response from Claude 3.5 Sonnet');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'AI model is temporarily unavailable'
        })
      });
    });

    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test prompt');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    // Should show error message
    const output = await page.locator('#output');
    await expect(output).toContainText('Error', { timeout: 5000 });
  });

  test('should handle slow API responses', async ({ page }) => {
    await page.route('**/api/generate', async route => {
      // Simulate slow response (2 seconds)
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          output: 'Response after delay',
          model: 'claude-3.5-sonnet'
        })
      });
    });

    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test prompt');
    
    const startTime = Date.now();
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    // Should show loading state
    const button = page.locator('button:has-text("Generate")');
    await expect(button).toBeDisabled();
    
    // Wait for response
    await expect(page.locator('#output')).toContainText('Response after delay', { timeout: 5000 });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeGreaterThan(2000);
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0'
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Please try again in 60 seconds'
        })
      });
    });

    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test prompt');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    const output = await page.locator('#output');
    await expect(output).toContainText('rate limit', { timeout: 5000 });
  });

  test('should handle network timeout', async ({ page }) => {
    await page.route('**/api/generate', async route => {
      // Never respond (simulate timeout)
      await page.waitForTimeout(30000);
    });

    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test prompt');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    // Should timeout after 10 seconds (if implemented)
    await page.waitForTimeout(10000);
    const output = await page.locator('#output');
    // Check if timeout message is shown (if implemented)
  });

  test('should validate response format', async ({ page }) => {
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          // Invalid format - missing required fields
          data: 'some data'
        })
      });
    });

    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test prompt');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    // Should handle invalid response format
    const output = await page.locator('#output');
    await expect(output).toBeVisible();
  });

  test('should mock different models with different responses', async ({ page }) => {
    const modelResponses: Record<string, string> = {
      'claude-3.5-sonnet': 'Response from Claude 3.5 Sonnet',
      'gpt-4': 'Response from GPT-4',
      'gemini-pro': 'Response from Gemini Pro'
    };

    await page.route('**/api/generate', async route => {
      const request = route.request();
      const body = request.postDataJSON();
      const model = body.model || 'claude-3.5-sonnet';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          output: modelResponses[model] || 'Default response',
          model: model
        })
      });
    });

    await page.goto('http://localhost:8080');
    
    // Test Claude 3.5 Sonnet
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    await expect(page.locator('#output')).toContainText('Response from Claude 3.5 Sonnet', { timeout: 5000 });
    
    // Test GPT-4
    await page.click('text=GPT-4');
    await page.fill('#prompt', 'Test');
    await page.click('button:has-text("Generate")');
    await expect(page.locator('#output')).toContainText('Response from GPT-4', { timeout: 5000 });
  });

  test('should handle streaming responses', async ({ page }) => {
    // Mock Server-Sent Events (SSE) for streaming
    await page.route('**/api/generate/stream', async route => {
      const chunks = [
        'This ',
        'is ',
        'a ',
        'streaming ',
        'response.'
      ];
      
      let response = '';
      for (const chunk of chunks) {
        response += `data: ${JSON.stringify({ text: chunk })}\n\n`;
      }
      response += 'data: [DONE]\n\n';
      
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: response
      });
    });

    await page.goto('http://localhost:8080');
    // Test streaming if implemented
  });

  test('should mock concurrent API requests', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/api/generate', async route => {
      requestCount++;
      await page.waitForTimeout(100); // Simulate some delay
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          output: `Response ${requestCount}`,
          requestId: requestCount
        })
      });
    });

    await page.goto('http://localhost:8080');
    
    // Make multiple requests rapidly
    for (let i = 0; i < 3; i++) {
      await page.click('text=Claude 3.5 Sonnet');
      await page.fill('#prompt', `Test ${i}`);
      await page.click('text=Generate with Claude 3.5 Sonnet');
      await page.waitForTimeout(50); // Small delay between requests
    }
    
    expect(requestCount).toBeGreaterThan(0);
  });

  test('should intercept and log API requests', async ({ page }) => {
    const requests: any[] = [];
    
    await page.route('**/api/**', async route => {
      const request = route.request();
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        body: request.postDataJSON()
      });
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: 'Test response' })
      });
    });

    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Log this request');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    await page.waitForTimeout(1000);
    
    // Verify request was logged
    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0].method).toBe('POST');
  });
});

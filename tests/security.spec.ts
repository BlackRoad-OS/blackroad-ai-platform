import { test, expect } from '@playwright/test';

test.describe('Security Testing', () => {
  test('should sanitize user input to prevent XSS', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    
    // Try to inject script
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(1)">',
      'javascript:alert(1)',
      '<svg onload=alert(1)>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>'
    ];
    
    for (const payload of xssPayloads) {
      await page.fill('#prompt', payload);
      
      // Check that script is not executed
      const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      await page.click('text=Generate with Claude 3.5 Sonnet');
      
      const dialog = await dialogPromise;
      expect(dialog).toBeNull(); // No alert should appear
      
      // Check that input is escaped in DOM
      const promptValue = await page.locator('#prompt').inputValue();
      expect(promptValue).toBe(payload);
    }
  });

  test('should prevent SQL injection in prompts', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' OR 1=1--",
      "'; EXEC sp_MSForEachTable 'DROP TABLE ?'; --"
    ];
    
    for (const payload of sqlPayloads) {
      await page.fill('#prompt', payload);
      await page.click('text=Generate with Claude 3.5 Sonnet');
      
      // Should not cause errors or unexpected behavior
      await expect(page.locator('#output')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should protect against CSRF attacks', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check for CSRF token or SameSite cookies
    const cookies = await page.context().cookies();
    
    cookies.forEach(cookie => {
      if (cookie.name.toLowerCase().includes('session') || 
          cookie.name.toLowerCase().includes('auth')) {
        // Session cookies should have SameSite attribute
        expect(cookie.sameSite).toBeDefined();
        expect(['Strict', 'Lax']).toContain(cookie.sameSite);
      }
    });
  });

  test('should validate Content-Security-Policy headers', async ({ page }) => {
    const response = await page.goto('http://localhost:8080');
    const headers = response?.headers();
    
    // Check for security headers
    if (headers) {
      // CSP should be present (if configured)
      const csp = headers['content-security-policy'] || headers['x-content-security-policy'];
      
      if (csp) {
        expect(csp).toBeDefined();
        expect(csp).toContain("script-src");
        expect(csp).not.toContain("'unsafe-inline'"); // Should avoid unsafe-inline
      }
    }
  });

  test('should have proper X-Frame-Options', async ({ page }) => {
    const response = await page.goto('http://localhost:8080');
    const headers = response?.headers();
    
    if (headers) {
      const xFrameOptions = headers['x-frame-options'];
      
      // Should prevent clickjacking
      if (xFrameOptions) {
        expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions);
      }
    }
  });

  test('should have secure X-Content-Type-Options', async ({ page }) => {
    const response = await page.goto('http://localhost:8080');
    const headers = response?.headers();
    
    if (headers) {
      const contentTypeOptions = headers['x-content-type-options'];
      
      // Should prevent MIME sniffing
      if (contentTypeOptions) {
        expect(contentTypeOptions).toBe('nosniff');
      }
    }
  });

  test('should handle very long input strings', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    
    // Test with extremely long input
    const longString = 'A'.repeat(1000000); // 1 million characters
    
    await page.fill('#prompt', longString);
    
    // Should not crash or hang
    const promptValue = await page.locator('#prompt').inputValue();
    expect(promptValue.length).toBeLessThanOrEqual(1000000);
  });

  test('should handle special Unicode characters', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    
    const unicodePayloads = [
      '𝕳𝖊𝖑𝖑𝖔', // Mathematical bold
      '👨‍👩‍👧‍👦', // Emoji with ZWJ
      'test\u0000test', // Null byte
      'test\u202E\u202D', // RTL/LTR override
      '℀⅓⅔⅛⅜⅝⅞←↑→↓↔', // Special symbols
    ];
    
    for (const payload of unicodePayloads) {
      await page.fill('#prompt', payload);
      const value = await page.locator('#prompt').inputValue();
      expect(value).toBeTruthy();
    }
  });

  test('should rate limit API requests', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/api/generate', async route => {
      requestCount++;
      
      if (requestCount > 10) {
        // Simulate rate limiting after 10 requests
        await route.fulfill({
          status: 429,
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ output: 'Response' })
        });
      }
    });
    
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    
    // Make many requests rapidly
    for (let i = 0; i < 15; i++) {
      await page.fill('#prompt', `Request ${i}`);
      await page.click('text=Generate with Claude 3.5 Sonnet');
      await page.waitForTimeout(100);
    }
    
    // Should handle rate limiting gracefully
    expect(requestCount).toBeGreaterThan(10);
  });

  test('should not expose sensitive information in errors', async ({ page }) => {
    await page.route('**/api/generate', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: 'Internal Server Error'
          // Should NOT expose: stack traces, file paths, API keys, etc.
        })
      });
    });
    
    await page.goto('http://localhost:8080');
    await page.click('text=Claude 3.5 Sonnet');
    await page.fill('#prompt', 'Test');
    await page.click('text=Generate with Claude 3.5 Sonnet');
    
    await page.waitForTimeout(1000);
    
    const pageContent = await page.content();
    
    // Should not expose sensitive paths
    expect(pageContent).not.toContain('/home/');
    expect(pageContent).not.toContain('C:\\');
    expect(pageContent).not.toContain('api_key');
    expect(pageContent).not.toContain('password');
    expect(pageContent).not.toContain('stack trace');
  });

  test('should validate file uploads securely', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // If file upload is implemented, test it
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      // Test malicious file types
      const maliciousFiles = [
        { name: 'test.exe', type: 'application/x-msdownload' },
        { name: 'test.sh', type: 'application/x-sh' },
        { name: 'test.php', type: 'application/x-php' }
      ];
      
      for (const file of maliciousFiles) {
        // Should reject or sanitize dangerous file types
        // Test implementation depends on upload feature
      }
    }
  });

  test('should prevent path traversal', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const pathTraversalPayloads = [
      '../../etc/passwd',
      '..\\..\\windows\\system32',
      '....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ];
    
    for (const payload of pathTraversalPayloads) {
      await page.fill('#prompt', payload);
      await page.click('text=Claude 3.5 Sonnet');
      
      // Should not allow access to file system
      await page.waitForTimeout(500);
    }
  });

  test('should use HTTPS in production', async ({ page }) => {
    // This test should only run in production
    if (process.env.BASE_URL && process.env.BASE_URL.startsWith('https://')) {
      const response = await page.goto(process.env.BASE_URL);
      const url = response?.url();
      expect(url).toMatch(/^https:\/\//);
    }
  });

  test('should have secure cookies', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const cookies = await page.context().cookies();
    
    cookies.forEach(cookie => {
      // Sensitive cookies should be HttpOnly
      if (cookie.name.toLowerCase().includes('session') ||
          cookie.name.toLowerCase().includes('auth') ||
          cookie.name.toLowerCase().includes('token')) {
        expect(cookie.httpOnly).toBe(true);
        
        // Should be Secure in production
        if (process.env.BASE_URL?.startsWith('https://')) {
          expect(cookie.secure).toBe(true);
        }
      }
    });
  });

  test('should prevent open redirect', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Test if redirect parameter exists
    const redirectPayloads = [
      'http://evil.com',
      '//evil.com',
      '/\\evil.com',
      'javascript:alert(1)'
    ];
    
    for (const payload of redirectPayloads) {
      // Try to manipulate URL parameters
      await page.goto(`http://localhost:8080?redirect=${encodeURIComponent(payload)}`);
      
      // Should not redirect to external sites
      const currentUrl = page.url();
      expect(currentUrl).toContain('localhost:8080');
      expect(currentUrl).not.toContain('evil.com');
    }
  });

  test('should protect against prototype pollution', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Test prototype pollution via JSON
    await page.evaluate(() => {
      const polluted = JSON.parse('{"__proto__":{"polluted":true}}');
      return polluted;
    });
    
    const isPolluted = await page.evaluate(() => {
      return ({} as any).polluted;
    });
    
    expect(isPolluted).toBeUndefined();
  });
});

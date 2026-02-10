import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface TestMetrics {
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  retries?: number;
  screenshots?: string[];
}

interface TestSuiteReport {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  tests: TestMetrics[];
  environment: {
    browser: string;
    viewport: { width: number; height: number };
    userAgent: string;
    platform: string;
  };
}

class TestReporter {
  private report: TestSuiteReport;
  private startTime: number;

  constructor(suiteName: string, browser: string, viewport: { width: number; height: number }) {
    this.startTime = Date.now();
    this.report = {
      name: suiteName,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      passRate: 0,
      tests: [],
      environment: {
        browser,
        viewport,
        userAgent: '',
        platform: process.platform
      }
    };
  }

  addTest(test: TestMetrics) {
    this.report.tests.push(test);
    this.report.totalTests++;

    if (test.status === 'passed') this.report.passed++;
    if (test.status === 'failed') this.report.failed++;
    if (test.status === 'skipped') this.report.skipped++;
  }

  finalize() {
    this.report.endTime = new Date().toISOString();
    this.report.duration = Date.now() - this.startTime;
    this.report.passRate = (this.report.passed / this.report.totalTests) * 100;
  }

  saveReport(filename: string) {
    const reportPath = path.join(__dirname, '..', 'test-results', filename);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
  }

  getReport(): TestSuiteReport {
    return this.report;
  }

  generateHTML(): string {
    const passColor = '#22c55e';
    const failColor = '#ef4444';
    const skipColor = '#f59e0b';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - ${this.report.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #fff;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { opacity: 0.9; font-size: 1.1em; }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      padding: 25px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    .stat-card h3 { font-size: 0.9em; opacity: 0.7; margin-bottom: 10px; }
    .stat-card .value {
      font-size: 2.5em;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-card.passed .value { color: ${passColor}; -webkit-text-fill-color: ${passColor}; }
    .stat-card.failed .value { color: ${failColor}; -webkit-text-fill-color: ${failColor}; }
    .stat-card.skipped .value { color: ${skipColor}; -webkit-text-fill-color: ${skipColor}; }
    
    .progress-bar {
      height: 30px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 30px;
      display: flex;
    }
    .progress-segment {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85em;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .progress-passed { background: ${passColor}; }
    .progress-failed { background: ${failColor}; }
    .progress-skipped { background: ${skipColor}; }
    
    .test-list {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .test-list h2 { margin-bottom: 20px; }
    
    .test-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      border-left: 4px solid;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
    }
    .test-item:hover { transform: translateX(5px); background: rgba(255, 255, 255, 0.08); }
    .test-item.passed { border-color: ${passColor}; }
    .test-item.failed { border-color: ${failColor}; }
    .test-item.skipped { border-color: ${skipColor}; }
    
    .test-name { font-weight: 500; flex: 1; }
    .test-duration {
      padding: 5px 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 0.85em;
      margin-left: 15px;
    }
    .test-status {
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 10px;
    }
    .test-status.passed { background: ${passColor}; color: white; }
    .test-status.failed { background: ${failColor}; color: white; }
    .test-status.skipped { background: ${skipColor}; color: white; }
    
    .error-details {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
      overflow-x: auto;
    }
    
    .environment {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 20px;
      margin-top: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .environment h3 { margin-bottom: 15px; }
    .environment p { opacity: 0.8; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 ${this.report.name}</h1>
      <p>Test execution completed at ${new Date(this.report.endTime).toLocaleString()}</p>
      <p>Duration: ${(this.report.duration / 1000).toFixed(2)}s</p>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <h3>TOTAL TESTS</h3>
        <div class="value">${this.report.totalTests}</div>
      </div>
      <div class="stat-card passed">
        <h3>PASSED</h3>
        <div class="value">${this.report.passed}</div>
      </div>
      <div class="stat-card failed">
        <h3>FAILED</h3>
        <div class="value">${this.report.failed}</div>
      </div>
      <div class="stat-card skipped">
        <h3>SKIPPED</h3>
        <div class="value">${this.report.skipped}</div>
      </div>
      <div class="stat-card">
        <h3>PASS RATE</h3>
        <div class="value">${this.report.passRate.toFixed(1)}%</div>
      </div>
    </div>
    
    <div class="progress-bar">
      ${this.report.passed > 0 ? `<div class="progress-segment progress-passed" style="width: ${(this.report.passed / this.report.totalTests) * 100}%">${this.report.passed}</div>` : ''}
      ${this.report.failed > 0 ? `<div class="progress-segment progress-failed" style="width: ${(this.report.failed / this.report.totalTests) * 100}%">${this.report.failed}</div>` : ''}
      ${this.report.skipped > 0 ? `<div class="progress-segment progress-skipped" style="width: ${(this.report.skipped / this.report.totalTests) * 100}%">${this.report.skipped}</div>` : ''}
    </div>
    
    <div class="test-list">
      <h2>Test Results</h2>
      ${this.report.tests.map(test => `
        <div class="test-item ${test.status}">
          <div class="test-name">${test.name}</div>
          <div class="test-duration">${test.duration.toFixed(0)}ms</div>
          <div class="test-status ${test.status}">${test.status.toUpperCase()}</div>
        </div>
        ${test.error ? `<div class="error-details">${test.error}</div>` : ''}
      `).join('')}
    </div>
    
    <div class="environment">
      <h3>Environment</h3>
      <p><strong>Browser:</strong> ${this.report.environment.browser}</p>
      <p><strong>Viewport:</strong> ${this.report.environment.viewport.width}x${this.report.environment.viewport.height}</p>
      <p><strong>Platform:</strong> ${this.report.environment.platform}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  saveHTMLReport(filename: string) {
    const reportPath = path.join(__dirname, '..', 'test-results', filename);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, this.generateHTML());
  }
}

test.describe('Custom Test Reporting', () => {
  test('should generate detailed test reports', async ({ page, browserName }) => {
    const reporter = new TestReporter('Custom Report Test', browserName, page.viewportSize()!);
    
    await page.goto('http://localhost:8080');
    
    // Run a series of tests and collect metrics
    const tests = [
      { name: 'Load homepage', fn: async () => {
        const start = Date.now();
        await page.goto('http://localhost:8080');
        await expect(page.locator('h1')).toBeVisible();
        return Date.now() - start;
      }},
      { name: 'Select model', fn: async () => {
        const start = Date.now();
        await page.click('text=Claude 3.5 Sonnet');
        await expect(page.locator('text=Claude 3.5 Sonnet')).toHaveClass(/active/);
        return Date.now() - start;
      }},
      { name: 'Enter prompt', fn: async () => {
        const start = Date.now();
        await page.fill('#prompt', 'Test prompt for reporting');
        return Date.now() - start;
      }},
      { name: 'Adjust slider', fn: async () => {
        const start = Date.now();
        await page.locator('input[type="range"]').first().fill('50');
        return Date.now() - start;
      }}
    ];
    
    for (const testCase of tests) {
      try {
        const duration = await testCase.fn();
        reporter.addTest({
          name: testCase.name,
          duration,
          status: 'passed'
        });
      } catch (error) {
        reporter.addTest({
          name: testCase.name,
          duration: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    reporter.finalize();
    reporter.saveReport('custom-report.json');
    reporter.saveHTMLReport('custom-report.html');
    
    const report = reporter.getReport();
    expect(report.totalTests).toBe(4);
    expect(report.passRate).toBeGreaterThan(0);
    
    console.log(`✅ Generated custom report with ${report.totalTests} tests`);
    console.log(`   Pass rate: ${report.passRate.toFixed(1)}%`);
  });
});

// Export for use in other tests
export { TestReporter, TestMetrics, TestSuiteReport };

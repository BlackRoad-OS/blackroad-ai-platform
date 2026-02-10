/**
 * Test Data Factory
 * Provides consistent test data for E2E tests
 */

export const TestData = {
  prompts: {
    simple: 'Write a hello world program',
    complex: 'Create a Python function that implements a binary search tree with insert, delete, and search operations',
    empty: '',
    whitespace: '   ',
    long: 'A'.repeat(5000),
    special: 'Test with special chars: <>&"\'{}[]',
    multiline: `Line 1
Line 2
Line 3`,
    code: '```python\ndef hello():\n    print("Hello")\n```',
  },

  models: {
    claude: {
      name: 'Claude Sonnet 4',
      selector: 0,
      dataModel: 'claude-sonnet-4',
    },
    llama: {
      name: 'Llama 3 70B',
      selector: 1,
      dataModel: 'llama-3-70b',
    },
    mistral: {
      name: 'Mistral Large',
      selector: 2,
      dataModel: 'mistral-large',
    },
    gpt4: {
      name: 'GPT-4 Turbo',
      selector: 3,
      dataModel: 'gpt-4-turbo',
    },
  },

  sliders: {
    temperature: {
      id: 'temperature',
      default: 0.7,
      min: 0,
      max: 2,
      step: 0.1,
      displayId: 'temp-value',
    },
    maxTokens: {
      id: 'max-tokens',
      default: 2048,
      min: 128,
      max: 8192,
      step: 128,
      displayId: 'tokens-value',
    },
    topP: {
      id: 'top-p',
      default: 0.9,
      min: 0,
      max: 1,
      step: 0.05,
      displayId: 'topp-value',
    },
  },

  responses: {
    success: 'AI Response\n\nBased on your prompt',
    error: 'Please enter a prompt first',
    loading: 'Thinking...',
  },

  timing: {
    animation: 300,
    responseDelay: 2000,
    shortWait: 100,
    mediumWait: 500,
    longWait: 1000,
  },

  urls: {
    local: 'http://localhost:8080',
    production: 'https://ai.blackroadai.com',
    staging: 'https://staging.blackroadai.com',
  },
};

/**
 * Test Utilities
 */
export const TestUtils = {
  /**
   * Wait for animations to complete
   */
  waitForAnimation: async (page: any, duration = TestData.timing.animation) => {
    await page.waitForTimeout(duration);
  },

  /**
   * Generate random prompt
   */
  randomPrompt: () => {
    const prompts = Object.values(TestData.prompts);
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  /**
   * Generate random model index
   */
  randomModel: () => {
    return Math.floor(Math.random() * 4);
  },

  /**
   * Generate random slider value
   */
  randomSliderValue: (slider: keyof typeof TestData.sliders) => {
    const config = TestData.sliders[slider];
    const steps = (config.max - config.min) / config.step;
    const randomStep = Math.floor(Math.random() * steps);
    return config.min + (randomStep * config.step);
  },

  /**
   * Take screenshot with timestamp
   */
  takeTimestampedScreenshot: async (page: any, name: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  },

  /**
   * Log performance metrics
   */
  logPerformanceMetrics: async (page: any) => {
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as any;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: nav?.domContentLoadedEventEnd - nav?.domContentLoadedEventStart,
        loadComplete: nav?.loadEventEnd - nav?.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
    return metrics;
  },
};

/**
 * Page Object Model
 */
export class AIPlaygroundPage {
  constructor(private page: any) {}

  // Locators
  get modelOptions() {
    return this.page.locator('.model-option');
  }

  get activeModel() {
    return this.page.locator('.model-option.active');
  }

  get promptInput() {
    return this.page.locator('#prompt-input');
  }

  get generateButton() {
    return this.page.locator('#generate-btn');
  }

  get output() {
    return this.page.locator('#output');
  }

  get temperatureSlider() {
    return this.page.locator('#temperature');
  }

  get maxTokensSlider() {
    return this.page.locator('#max-tokens');
  }

  get topPSlider() {
    return this.page.locator('#top-p');
  }

  get selectedModelDisplay() {
    return this.page.locator('#selected-model-display');
  }

  // Actions
  async selectModel(index: number) {
    await this.modelOptions.nth(index).click();
    await TestUtils.waitForAnimation(this.page);
  }

  async selectModelByName(name: string) {
    const model = Object.values(TestData.models).find(m => m.name === name);
    if (model) {
      await this.selectModel(model.selector);
    }
  }

  async enterPrompt(text: string) {
    await this.promptInput.fill(text);
  }

  async clearPrompt() {
    await this.promptInput.clear();
  }

  async setTemperature(value: number) {
    await this.temperatureSlider.fill(value.toString());
  }

  async setMaxTokens(value: number) {
    await this.maxTokensSlider.fill(value.toString());
  }

  async setTopP(value: number) {
    await this.topPSlider.fill(value.toString());
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async generateResponse(prompt: string) {
    await this.enterPrompt(prompt);
    await this.clickGenerate();
    await this.page.waitForTimeout(TestData.timing.responseDelay + 500);
  }

  async waitForResponse() {
    await this.page.waitForTimeout(TestData.timing.responseDelay + 500);
  }

  // Assertions
  async expectModelSelected(name: string) {
    await this.page.expect(this.selectedModelDisplay).toHaveText(name);
  }

  async expectOutputContains(text: string) {
    await this.page.expect(this.output).toContainText(text);
  }

  async expectGenerateButtonEnabled() {
    await this.page.expect(this.generateButton).toBeEnabled();
  }

  async expectGenerateButtonDisabled() {
    await this.page.expect(this.generateButton).toBeDisabled();
  }
}

/**
 * Mock API Response Builder
 */
export class MockAPIResponse {
  static success(prompt: string, model: string) {
    return {
      id: `mock-${Date.now()}`,
      model,
      prompt,
      response: `# AI Response from ${model}\n\nBased on your prompt: "${prompt.substring(0, 50)}..."\n\nThis is a mocked response for testing purposes.`,
      tokens: 247,
      latency: 47,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string) {
    return {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static timeout() {
    return {
      error: true,
      message: 'Request timed out',
      code: 'TIMEOUT',
      timestamp: new Date().toISOString(),
    };
  }

  static rateLimit() {
    return {
      error: true,
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT',
      retryAfter: 60,
      timestamp: new Date().toISOString(),
    };
  }
}

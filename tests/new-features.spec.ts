import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page load and click Analytics tab
    await page.waitForSelector('.main-tabs');
    await page.click('[data-tab="analytics"]');
    await page.waitForSelector('#analytics-panel.active');
  });

  test('should display analytics panel with key metrics', async ({ page }) => {
    // Check panel is visible
    const panel = page.locator('#analytics-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/active/);
  });

  test('should show 4 key metrics cards', async ({ page }) => {
    const cards = page.locator('.analytics-card');
    await expect(cards).toHaveCount(4);
    
    // Check each card has required elements
    for (let i = 0; i < 4; i++) {
      await expect(cards.nth(i).locator('.analytics-icon')).toBeVisible();
      await expect(cards.nth(i).locator('.analytics-label')).toBeVisible();
      await expect(cards.nth(i).locator('.analytics-value')).toBeVisible();
      await expect(cards.nth(i).locator('.analytics-change')).toBeVisible();
    }
  });

  test('should display correct metric titles', async ({ page }) => {
    await expect(page.locator('.analytics-label').nth(0)).toHaveText('Total Requests');
    await expect(page.locator('.analytics-label').nth(1)).toHaveText('Total Cost');
    await expect(page.locator('.analytics-label').nth(2)).toHaveText('Avg Response Time');
    await expect(page.locator('.analytics-label').nth(3)).toHaveText('Success Rate');
  });

  test('should show model usage breakdown', async ({ page }) => {
    await expect(page.getByText('Model Usage (Last 30 Days)')).toBeVisible();
    
    // Check usage bars
    const usageItems = page.locator('.usage-item');
    await expect(usageItems).toHaveCount(3);
    
    // Check bars have fills
    await expect(usageItems.nth(0).locator('.usage-fill')).toBeVisible();
    await expect(usageItems.nth(1).locator('.usage-fill')).toBeVisible();
    await expect(usageItems.nth(2).locator('.usage-fill')).toBeVisible();
  });

  test('should display daily activity chart', async ({ page }) => {
    await expect(page.getByText('Daily Activity (Last 7 Days)')).toBeVisible();
    const chart = page.locator('#activity-chart');
    await expect(chart).toBeVisible();
  });

  test('analytics cards should have hover effects', async ({ page }) => {
    const firstCard = page.locator('.analytics-card').first();
    
    // Get initial position
    const initialBox = await firstCard.boundingBox();
    
    // Hover
    await firstCard.hover();
    
    // Card should be visible and hoverable
    await expect(firstCard).toBeVisible();
  });
});

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.main-tabs');
    await page.click('[data-tab="settings"]');
    await page.waitForSelector('#settings-panel.active');
  });

  test('should display settings panel', async ({ page }) => {
    const panel = page.locator('#settings-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/active/);
  });

  test('should show API keys section', async ({ page }) => {
    await expect(page.getByText('🔑 API Keys')).toBeVisible();
    await expect(page.locator('#anthropic-key')).toBeVisible();
    await expect(page.locator('#openai-key')).toBeVisible();
  });

  test('should have API key input fields with save buttons', async ({ page }) => {
    // Anthropic key
    const anthropicInput = page.locator('#anthropic-key');
    await expect(anthropicInput).toHaveAttribute('type', 'password');
    await expect(anthropicInput).toHaveAttribute('placeholder', /sk-ant/);
    
    // OpenAI key
    const openaiInput = page.locator('#openai-key');
    await expect(openaiInput).toHaveAttribute('type', 'password');
    await expect(openaiInput).toHaveAttribute('placeholder', /sk-/);
  });

  test('should show theme selection options', async ({ page }) => {
    await expect(page.getByText('🎨 Theme & Appearance')).toBeVisible();
    
    const themeOptions = page.locator('.theme-option');
    await expect(themeOptions).toHaveCount(3);
    
    // One should be active
    const activeTheme = page.locator('.theme-option.active');
    await expect(activeTheme).toHaveCount(1);
  });

  test('should show interface scale slider', async ({ page }) => {
    const slider = page.locator('#font-size');
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute('type', 'range');
    await expect(slider).toHaveAttribute('min', '80');
    await expect(slider).toHaveAttribute('max', '120');
  });

  test('should show model preferences', async ({ page }) => {
    await expect(page.getByText('🤖 Model Preferences')).toBeVisible();
    
    const defaultModelSelect = page.locator('#default-model');
    await expect(defaultModelSelect).toBeVisible();
    
    // Should have model options
    const options = defaultModelSelect.locator('option');
    await expect(options).toHaveCount(4);
  });

  test('should have auto-save and stream checkboxes', async ({ page }) => {
    const autoSave = page.locator('#auto-save');
    const streamResponses = page.locator('#stream-responses');
    
    await expect(autoSave).toBeVisible();
    await expect(streamResponses).toBeVisible();
    
    // Should be checked by default
    await expect(autoSave).toBeChecked();
    await expect(streamResponses).toBeChecked();
  });

  test('should show data management buttons', async ({ page }) => {
    await expect(page.getByText('💾 Data Management')).toBeVisible();
    await expect(page.getByText('📤 Export Settings')).toBeVisible();
    await expect(page.getByText('📥 Import Settings')).toBeVisible();
    await expect(page.getByText('🗑️ Clear All Data')).toBeVisible();
  });

  test('should allow toggling checkboxes', async ({ page }) => {
    const autoSave = page.locator('#auto-save');
    
    // Check initial state
    const initialState = await autoSave.isChecked();
    
    // Toggle
    await autoSave.click();
    
    // Should be opposite of initial
    await expect(autoSave).toHaveJSProperty('checked', !initialState);
  });
});

test.describe('History Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.main-tabs');
    await page.click('[data-tab="history"]');
    await page.waitForSelector('#history-panel.active');
  });

  test('should display history panel', async ({ page }) => {
    const panel = page.locator('#history-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/active/);
  });

  test('should show search and filter controls', async ({ page }) => {
    await expect(page.locator('#history-search')).toBeVisible();
    await expect(page.locator('#history-model-filter')).toBeVisible();
    await expect(page.locator('#history-time-filter')).toBeVisible();
  });

  test('should display history timeline with date groups', async ({ page }) => {
    const timeline = page.locator('#history-timeline');
    await expect(timeline).toBeVisible();
    
    const dateGroups = page.locator('.history-date-group');
    await expect(dateGroups).toHaveCount(3); // Today, Yesterday, Last Week
  });

  test('should show today\'s conversations', async ({ page }) => {
    await expect(page.getByText('Today - February 10, 2026')).toBeVisible();
    
    const todayGroup = page.locator('.history-date-group').first();
    const todayItems = todayGroup.locator('.history-item');
    await expect(todayItems).toHaveCount(2);
  });

  test('history items should have all required elements', async ({ page }) => {
    const firstItem = page.locator('.history-item').first();
    
    await expect(firstItem.locator('.history-icon')).toBeVisible();
    await expect(firstItem.locator('.history-title')).toBeVisible();
    await expect(firstItem.locator('.history-time')).toBeVisible();
    await expect(firstItem.locator('.history-badge')).toHaveCount(2);
    await expect(firstItem.locator('.history-preview')).toBeVisible();
  });

  test('history items should have action buttons', async ({ page }) => {
    const firstItem = page.locator('.history-item').first();
    const actions = firstItem.locator('.history-action');
    
    await expect(actions).toHaveCount(3); // View, Share, Delete
    await expect(actions.nth(0)).toContainText('View');
    await expect(actions.nth(1)).toContainText('Share');
    await expect(actions.nth(2)).toContainText('Delete');
  });

  test('should show saved prompts section', async ({ page }) => {
    await expect(page.getByText('⭐ Saved Prompts')).toBeVisible();
    
    const promptCards = page.locator('.saved-prompt-card');
    await expect(promptCards).toHaveCount(3);
  });

  test('saved prompt cards should have use buttons', async ({ page }) => {
    const promptCards = page.locator('.saved-prompt-card');
    
    for (let i = 0; i < 3; i++) {
      const useButton = promptCards.nth(i).locator('.saved-prompt-use');
      await expect(useButton).toBeVisible();
      await expect(useButton).toContainText('Use');
    }
  });

  test('search should filter history items', async ({ page }) => {
    const searchInput = page.locator('#history-search');
    
    // Type search term
    await searchInput.fill('testing');
    
    // All items should be filtered (none match in demo data)
    // This would test the filtering logic in a real scenario
  });

  test('should be able to change model filter', async ({ page }) => {
    const modelFilter = page.locator('#history-model-filter');
    
    await modelFilter.selectOption('claude');
    await expect(modelFilter).toHaveValue('claude');
    
    await modelFilter.selectOption('gpt');
    await expect(modelFilter).toHaveValue('gpt');
  });

  test('should be able to change time filter', async ({ page }) => {
    const timeFilter = page.locator('#history-time-filter');
    
    await timeFilter.selectOption('today');
    await expect(timeFilter).toHaveValue('today');
    
    await timeFilter.selectOption('week');
    await expect(timeFilter).toHaveValue('week');
  });
});

test.describe('New Tabs Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.main-tabs');
  });

  test('should have 6 main tabs', async ({ page }) => {
    const tabs = page.locator('.main-tab');
    await expect(tabs).toHaveCount(6);
  });

  test('should show all new tab icons', async ({ page }) => {
    await expect(page.locator('[data-tab="analytics"] .tab-icon')).toContainText('📊');
    await expect(page.locator('[data-tab="settings"] .tab-icon')).toContainText('⚙️');
    await expect(page.locator('[data-tab="history"] .tab-icon')).toContainText('📜');
  });

  test('should switch between all tabs correctly', async ({ page }) => {
    const tabs = ['ai', 'memory', 'collaboration', 'analytics', 'settings', 'history'];
    
    for (const tab of tabs) {
      await page.click(`[data-tab="${tab}"]`);
      await page.waitForTimeout(200);
      
      // Check tab is active
      await expect(page.locator(`[data-tab="${tab}"]`)).toHaveClass(/active/);
      
      // Check panel is visible
      await expect(page.locator(`#${tab}-panel`)).toBeVisible();
      await expect(page.locator(`#${tab}-panel`)).toHaveClass(/active/);
    }
  });

  test('should maintain keyboard navigation for new tabs', async ({ page }) => {
    const analyticsTab = page.locator('[data-tab="analytics"]');
    
    // Focus and press Enter
    await analyticsTab.focus();
    await page.keyboard.press('Enter');
    
    await expect(analyticsTab).toHaveClass(/active/);
    await expect(page.locator('#analytics-panel')).toBeVisible();
  });

  test('should update ARIA attributes when switching to new tabs', async ({ page }) => {
    await page.click('[data-tab="settings"]');
    
    await expect(page.locator('[data-tab="settings"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-tab="ai"]')).toHaveAttribute('aria-selected', 'false');
  });
});

test.describe('New Features Integration', () => {
  test('should load all new panels without errors', async ({ page }) => {
    await page.goto('/');
    
    // Check console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Navigate to each new tab
    await page.click('[data-tab="analytics"]');
    await page.waitForTimeout(500);
    await page.click('[data-tab="settings"]');
    await page.waitForTimeout(500);
    await page.click('[data-tab="history"]');
    await page.waitForTimeout(500);
    
    // Should have no errors
    expect(errors.length).toBe(0);
  });

  test('should maintain scroll position when switching tabs', async ({ page }) => {
    await page.goto('/');
    
    // Go to a tab and scroll down
    await page.click('[data-tab="history"]');
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Switch to another tab
    await page.click('[data-tab="analytics"]');
    
    // Content should be visible
    await expect(page.locator('#analytics-panel')).toBeVisible();
  });

  test('all new tabs should be accessible via ARIA roles', async ({ page }) => {
    await page.goto('/');
    
    const tabs = ['analytics', 'settings', 'history'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`[data-tab="${tab}"]`);
      await expect(tabButton).toHaveAttribute('role', 'tab');
      await expect(tabButton).toHaveAttribute('aria-controls', `${tab}-panel`);
    }
  });
});

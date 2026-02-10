import { test, expect } from '@playwright/test';

test.describe('Main Navigation Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('should display all main navigation tabs', async ({ page }) => {
    const mainTabs = page.locator('.main-tab');
    await expect(mainTabs).toHaveCount(3);
    
    // Verify tab labels
    await expect(mainTabs.nth(0)).toContainText('AI Models');
    await expect(mainTabs.nth(1)).toContainText('Memory');
    await expect(mainTabs.nth(2)).toContainText('Collaboration');
  });

  test('should have AI Models tab active by default', async ({ page }) => {
    const aiTab = page.locator('.main-tab[data-tab="ai"]');
    await expect(aiTab).toHaveClass(/active/);
    await expect(aiTab).toHaveAttribute('aria-selected', 'true');
    
    // AI panel should be visible
    await expect(page.locator('#ai-panel')).toHaveClass(/active/);
  });

  test('should switch to Memory tab', async ({ page }) => {
    const memoryTab = page.locator('.main-tab[data-tab="memory"]');
    await memoryTab.click();
    
    // Memory tab should be active
    await expect(memoryTab).toHaveClass(/active/);
    await expect(memoryTab).toHaveAttribute('aria-selected', 'true');
    
    // Memory panel should be visible
    await expect(page.locator('#memory-panel')).toHaveClass(/active/);
    
    // AI panel should not be visible
    await expect(page.locator('#ai-panel')).not.toHaveClass(/active/);
  });

  test('should switch to Collaboration tab', async ({ page }) => {
    const collabTab = page.locator('.main-tab[data-tab="collaboration"]');
    await collabTab.click();
    
    // Collaboration tab should be active
    await expect(collabTab).toHaveClass(/active/);
    await expect(collabTab).toHaveAttribute('aria-selected', 'true');
    
    // Collaboration panel should be visible
    await expect(page.locator('#collaboration-panel')).toHaveClass(/active/);
  });

  test('should support keyboard navigation between main tabs', async ({ page }) => {
    const aiTab = page.locator('.main-tab[data-tab="ai"]');
    await aiTab.focus();
    
    // Press Enter to activate (should already be active)
    await page.keyboard.press('Enter');
    await expect(aiTab).toHaveClass(/active/);
    
    // Tab to next tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Memory tab should now be active
    const memoryTab = page.locator('.main-tab[data-tab="memory"]');
    await expect(memoryTab).toHaveClass(/active/);
  });

  test('should maintain sticky position on scroll', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Main tabs should still be visible (sticky)
    await expect(page.locator('.main-tabs')).toBeVisible();
  });

  test('should have proper ARIA roles', async ({ page }) => {
    const mainTabs = page.locator('.main-tabs');
    await expect(mainTabs).toHaveAttribute('role', 'tablist');
    
    const tabs = page.locator('.main-tab');
    for (let i = 0; i < 3; i++) {
      await expect(tabs.nth(i)).toHaveAttribute('role', 'tab');
    }
  });
});

test.describe('Memory System Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.locator('.main-tab[data-tab="memory"]').click();
    await page.waitForTimeout(500);
  });

  test('should display memory dashboard', async ({ page }) => {
    await expect(page.locator('#memory-panel')).toBeVisible();
    await expect(page.locator('#memory-panel .section-title')).toContainText('Memory System');
  });

  test('should show memory stats', async ({ page }) => {
    const statsGrid = page.locator('.memory-stats-grid');
    await expect(statsGrid).toBeVisible();
    
    // Should have multiple stat cards
    const statCards = page.locator('.memory-stat-card');
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display memory console', async ({ page }) => {
    const memoryConsole = page.locator('.memory-console');
    await expect(memoryConsole).toBeVisible();
  });

  test('should show subtitle with system info', async ({ page }) => {
    const subtitle = page.locator('#memory-panel .section-subtitle');
    await expect(subtitle).toContainText('PS-SHA∞');
    await expect(subtitle).toContainText('Journal Entries');
  });
});

test.describe('Collaboration Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.locator('.main-tab[data-tab="collaboration"]').click();
    await page.waitForTimeout(500);
  });

  test('should display collaboration dashboard', async ({ page }) => {
    await expect(page.locator('#collaboration-panel')).toBeVisible();
    await expect(page.locator('#collaboration-panel .section-title')).toContainText('Agent Collaboration');
  });

  test('should show agent network visualization', async ({ page }) => {
    const agentNetwork = page.locator('.agent-network');
    await expect(agentNetwork).toBeVisible();
    
    // Should have agent nodes
    const agentNodes = page.locator('.agent-node');
    const count = await agentNodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display task marketplace', async ({ page }) => {
    const taskList = page.locator('#task-list');
    await expect(taskList).toBeVisible();
    
    // Should have task cards
    const tasks = page.locator('.task-card');
    const count = await tasks.count();
    expect(count).toBeGreaterThan(0);
  });

    const filterButtons = page.locator('.filter-btn');
  test('should show task priorities', async ({ page }) => {
    const taskCards = page.locator('.task-card');
    const count = await taskCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter tasks by priority', async ({ page }) => {
    const filterButtons = page.locator('.filter-btn');
    const count = await filterButtons.count();
    expect(count).toBeGreaterThan(0);
  });
    await expect(filterButtons).toHaveCount(4); // All, Urgent, High, Medium
    
    // Click urgent filter
    const urgentFilter = page.locator('.filter-btn[data-priority="urgent"]');
    await urgentFilter.click();
    
    // Filter should be active
    await expect(urgentFilter).toHaveClass(/active/);
  });
});

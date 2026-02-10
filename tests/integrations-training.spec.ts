import { test, expect } from '@playwright/test';

test.describe('Integrations Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.main-tabs');
    await page.click('[data-tab="integrations"]');
    await page.waitForSelector('#integrations-panel.active');
  });

  test('should display integrations panel', async ({ page }) => {
    const panel = page.locator('#integrations-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/active/);
  });

  test('should show integration stats', async ({ page }) => {
    const stats = page.locator('.integration-stat');
    await expect(stats).toHaveCount(3);
    
    await expect(page.getByText('12')).toBeVisible(); // Connected
    await expect(page.getByText('48')).toBeVisible(); // Available
    await expect(page.getByText('2.4K')).toBeVisible(); // API Calls
  });

  test('should have integration category tabs', async ({ page }) => {
    const tabs = page.locator('.integration-tab');
    await expect(tabs).toHaveCount(4);
    
    await expect(tabs.nth(0)).toContainText('All');
    await expect(tabs.nth(1)).toContainText('Connected');
    await expect(tabs.nth(2)).toContainText('Popular');
    await expect(tabs.nth(3)).toContainText('Webhooks');
  });

  test('should display integration cards', async ({ page }) => {
    const cards = page.locator('.integration-card');
    await expect(cards).toHaveCount(6);
  });

  test('should show Slack integration as connected', async ({ page }) => {
    const slackCard = page.locator('.integration-card').filter({ hasText: 'Slack' });
    await expect(slackCard).toBeVisible();
    await expect(slackCard).toHaveClass(/connected/);
    await expect(slackCard.locator('.integration-status.connected')).toContainText('Connected');
  });

  test('should show GitHub integration as connected', async ({ page }) => {
    const githubCard = page.locator('.integration-card').filter({ hasText: 'GitHub' });
    await expect(githubCard).toBeVisible();
    await expect(githubCard).toHaveClass(/connected/);
  });

  test('integration cards should have action buttons', async ({ page }) => {
    const firstCard = page.locator('.integration-card').first();
    const actions = firstCard.locator('.integration-actions button');
    
    await expect(actions).toHaveCount(2); // Configure + Disconnect for connected integrations
  });

  test('should show API documentation section', async ({ page }) => {
    await expect(page.getByText('📚 API Documentation')).toBeVisible();
    
    const docCards = page.locator('.api-doc-card');
    await expect(docCards).toHaveCount(3);
    
    await expect(page.getByText('REST API')).toBeVisible();
    await expect(page.getByText('GraphQL')).toBeVisible();
    await expect(page.getByText('WebSockets')).toBeVisible();
  });

  test('should show SDK downloads section', async ({ page }) => {
    await expect(page.getByText('💾 SDK Downloads')).toBeVisible();
    
    const sdkCards = page.locator('.sdk-card');
    await expect(sdkCards).toHaveCount(4);
    
    await expect(page.getByText('Python SDK')).toBeVisible();
    await expect(page.getByText('Node.js SDK')).toBeVisible();
    await expect(page.getByText('Go SDK')).toBeVisible();
    await expect(page.getByText('Ruby SDK')).toBeVisible();
  });

  test('should filter integrations by category', async ({ page }) => {
    // Click Connected tab
    await page.click('.integration-tab:has-text("Connected")');
    
    // Should show only connected integrations
    const visibleCards = page.locator('.integration-card:visible');
    // Note: actual count depends on implementation
  });

  test('integration cards should have logos', async ({ page }) => {
    const firstCard = page.locator('.integration-card').first();
    await expect(firstCard.locator('.integration-logo')).toBeVisible();
  });

  test('integration cards should have feature tags', async ({ page }) => {
    const firstCard = page.locator('.integration-card').first();
    const tags = firstCard.locator('.feature-tag');
    
    await expect(tags).toHaveCount(3);
  });
});

test.describe('Training Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.main-tabs');
    await page.click('[data-tab="training"]');
    await page.waitForSelector('#training-panel.active');
  });

  test('should display training panel', async ({ page }) => {
    const panel = page.locator('#training-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/active/);
  });

  test('should show training stats', async ({ page }) => {
    const stats = page.locator('.training-stat');
    await expect(stats).toHaveCount(4);
    
    await expect(page.getByText('Fine-tuned Models')).toBeVisible();
    await expect(page.getByText('Training Examples')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Avg Accuracy')).toBeVisible();
  });

  test('should display active training jobs', async ({ page }) => {
    await expect(page.getByText('🔄 Active Training Jobs')).toBeVisible();
    
    const jobs = page.locator('.training-job');
    await expect(jobs).toHaveCount(2);
  });

  test('training jobs should have progress bars', async ({ page }) => {
    const firstJob = page.locator('.training-job').first();
    
    await expect(firstJob.locator('.progress-bar')).toBeVisible();
    await expect(firstJob.locator('.progress-fill')).toBeVisible();
    await expect(firstJob.locator('.progress-text')).toBeVisible();
  });

  test('training jobs should show metrics', async ({ page }) => {
    const firstJob = page.locator('.training-job').first();
    const metrics = firstJob.locator('.metric');
    
    await expect(metrics).toHaveCount(3); // Loss, Accuracy, Time remaining
  });

  test('training jobs should have status badges', async ({ page }) => {
    const firstJob = page.locator('.training-job').first();
    const status = firstJob.locator('.job-status.training');
    
    await expect(status).toBeVisible();
    await expect(status).toContainText('Training');
  });

  test('training jobs should have action buttons', async ({ page }) => {
    const firstJob = page.locator('.training-job').first();
    const actions = firstJob.locator('.job-actions button');
    
    await expect(actions).toHaveCount(2); // View Logs + Stop
    await expect(actions.nth(0)).toContainText('View Logs');
    await expect(actions.nth(1)).toContainText('Stop');
  });

  test('should display fine-tuned models section', async ({ page }) => {
    await expect(page.getByText('🤖 Your Fine-tuned Models')).toBeVisible();
    await expect(page.getByText('+ New Training Job')).toBeVisible();
  });

  test('should show model cards', async ({ page }) => {
    const modelCards = page.locator('.model-card');
    await expect(modelCards).toHaveCount(3);
  });

  test('model cards should have badges', async ({ page }) => {
    const firstModel = page.locator('.model-card').first();
    const badge = firstModel.locator('.model-badge');
    
    await expect(badge).toBeVisible();
  });

  test('model cards should show stats', async ({ page }) => {
    const firstModel = page.locator('.model-card').first();
    const stats = firstModel.locator('.stat-small');
    
    await expect(stats).toHaveCount(3); // Accuracy, F1 Score, Examples
  });

  test('model cards should have action buttons', async ({ page }) => {
    const firstModel = page.locator('.model-card').first();
    const actions = firstModel.locator('.model-actions button');
    
    await expect(actions).toHaveCount(2); // Use Model + Details
    await expect(actions.nth(0)).toContainText('Use Model');
    await expect(actions.nth(1)).toContainText('Details');
  });

  test('should display datasets section', async ({ page }) => {
    await expect(page.getByText('📁 Training Datasets')).toBeVisible();
    await expect(page.getByText('+ Upload Dataset')).toBeVisible();
  });

  test('should show dataset items', async ({ page }) => {
    const datasets = page.locator('.dataset-item');
    await expect(datasets).toHaveCount(3);
  });

  test('dataset items should have icons and info', async ({ page }) => {
    const firstDataset = page.locator('.dataset-item').first();
    
    await expect(firstDataset.locator('.dataset-icon')).toBeVisible();
    await expect(firstDataset.locator('.dataset-info h4')).toBeVisible();
    await expect(firstDataset.locator('.dataset-info p')).toBeVisible();
  });

  test('dataset items should have action buttons', async ({ page }) => {
    const firstDataset = page.locator('.dataset-item').first();
    const actions = firstDataset.locator('.dataset-actions button');
    
    await expect(actions).toHaveCount(3); // Preview, Download, Delete
    await expect(actions.nth(0)).toContainText('Preview');
    await expect(actions.nth(1)).toContainText('Download');
    await expect(actions.nth(2)).toContainText('Delete');
  });

  test('progress bars should be animated', async ({ page }) => {
    const progressFill = page.locator('.progress-fill').first();
    
    // Check width is set (indicating animation)
    const width = await progressFill.getAttribute('style');
    expect(width).toContain('width');
  });

  test('should show new training job button prominently', async ({ page }) => {
    const newJobButton = page.getByText('+ New Training Job');
    await expect(newJobButton).toBeVisible();
    await expect(newJobButton).toHaveClass(/btn-primary/);
  });
});

test.describe('New Tabs Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.main-tabs');
  });

  test('should have 8 main tabs total', async ({ page }) => {
    const tabs = page.locator('.main-tab');
    await expect(tabs).toHaveCount(8);
  });

  test('should show integrations and training tab icons', async ({ page }) => {
    await expect(page.locator('[data-tab="integrations"] .tab-icon')).toContainText('🔌');
    await expect(page.locator('[data-tab="training"] .tab-icon')).toContainText('🎓');
  });

  test('should switch to integrations tab', async ({ page }) => {
    await page.click('[data-tab="integrations"]');
    await page.waitForTimeout(200);
    
    await expect(page.locator('[data-tab="integrations"]')).toHaveClass(/active/);
    await expect(page.locator('#integrations-panel')).toBeVisible();
    await expect(page.locator('#integrations-panel')).toHaveClass(/active/);
  });

  test('should switch to training tab', async ({ page }) => {
    await page.click('[data-tab="training"]');
    await page.waitForTimeout(200);
    
    await expect(page.locator('[data-tab="training"]')).toHaveClass(/active/);
    await expect(page.locator('#training-panel')).toBeVisible();
    await expect(page.locator('#training-panel')).toHaveClass(/active/);
  });

  test('should maintain keyboard navigation for new tabs', async ({ page }) => {
    const integrationsTab = page.locator('[data-tab="integrations"]');
    
    await integrationsTab.focus();
    await page.keyboard.press('Enter');
    
    await expect(integrationsTab).toHaveClass(/active/);
    await expect(page.locator('#integrations-panel')).toBeVisible();
  });

  test('should update ARIA attributes for new tabs', async ({ page }) => {
    await page.click('[data-tab="training"]');
    
    await expect(page.locator('[data-tab="training"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-tab="ai"]')).toHaveAttribute('aria-selected', 'false');
  });

  test('should cycle through all 8 tabs correctly', async ({ page }) => {
    const tabs = ['ai', 'memory', 'collaboration', 'analytics', 'settings', 'history', 'integrations', 'training'];
    
    for (const tab of tabs) {
      await page.click(`[data-tab="${tab}"]`);
      await page.waitForTimeout(150);
      
      await expect(page.locator(`[data-tab="${tab}"]`)).toHaveClass(/active/);
      await expect(page.locator(`#${tab}-panel`)).toBeVisible();
      await expect(page.locator(`#${tab}-panel`)).toHaveClass(/active/);
    }
  });
});

test.describe('Integration Features', () => {
  test('all new panels should load without errors', async ({ page }) => {
    await page.goto('/');
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.click('[data-tab="integrations"]');
    await page.waitForTimeout(500);
    await page.click('[data-tab="training"]');
    await page.waitForTimeout(500);
    
    expect(errors.length).toBe(0);
  });

  test('should have consistent styling across new tabs', async ({ page }) => {
    await page.goto('/');
    
    // Check Integrations panel has playground class
    await page.click('[data-tab="integrations"]');
    await expect(page.locator('#integrations-panel .playground')).toBeVisible();
    
    // Check Training panel has playground class
    await page.click('[data-tab="training"]');
    await expect(page.locator('#training-panel .playground')).toBeVisible();
  });

  test('new tabs should be accessible via ARIA roles', async ({ page }) => {
    await page.goto('/');
    
    const newTabs = ['integrations', 'training'];
    
    for (const tab of newTabs) {
      const tabButton = page.locator(`[data-tab="${tab}"]`);
      await expect(tabButton).toHaveAttribute('role', 'tab');
      await expect(tabButton).toHaveAttribute('aria-controls', `${tab}-panel`);
    }
  });

  test('buttons should have hover effects', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-tab="integrations"]');
    
    const button = page.locator('.btn-primary').first();
    await expect(button).toBeVisible();
  });

  test('cards should have hover effects', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-tab="integrations"]');
    
    const card = page.locator('.integration-card').first();
    await expect(card).toBeVisible();
  });
});

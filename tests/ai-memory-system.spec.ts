/**
 * BlackRoad AI Platform - E2E Tests for AI Components with Memory
 * Tests real AI functionality including conversation memory, context persistence,
 * and agent state management
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

test.describe('AI Components with Memory System', () => {
    
    // ========== AI MODEL PANEL TESTS ==========
    
    test.describe('AI Models Panel', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(BASE_URL);
            // Wait for page load
            await page.waitForLoadState('networkidle');
            // Click AI Models tab
            const aiModelsTab = page.locator('[data-tab="ai-models"]');
            await aiModelsTab.click();
            await page.waitForTimeout(500);
        });

        test('should display AI Models panel with all components', async ({ page }) => {
            const panel = page.locator('#ai-models-panel.active');
            await expect(panel).toBeVisible();
            
            // Check model selector
            await expect(page.locator('#model-selector')).toBeVisible();
            
            // Check prompt textarea
            await expect(page.locator('#prompt-input')).toBeVisible();
            
            // Check temperature slider
            await expect(page.locator('#temperature')).toBeVisible();
            
            // Check generate button
            await expect(page.locator('#generate-btn')).toBeVisible();
        });

        test('should load available models from API', async ({ page }) => {
            // Wait for models to load
            await page.waitForTimeout(1000);
            
            const modelSelect = page.locator('#model-selector');
            const options = await modelSelect.locator('option').all();
            
            // Should have multiple model options
            expect(options.length).toBeGreaterThan(0);
        });

        test('should accept prompt input', async ({ page }) => {
            const promptInput = page.locator('#prompt-input');
            const testPrompt = 'Write a haiku about BlackRoad AI';
            
            await promptInput.fill(testPrompt);
            const value = await promptInput.inputValue();
            
            expect(value).toBe(testPrompt);
        });

        test('should adjust temperature slider', async ({ page }) => {
            const tempSlider = page.locator('#temperature');
            const tempValue = page.locator('#temp-value');
            
            // Set temperature to 0.8
            await tempSlider.fill('0.8');
            
            const displayValue = await tempValue.textContent();
            expect(displayValue).toBe('0.8');
        });

        test('should generate AI response', async ({ page }) => {
            const promptInput = page.locator('#prompt-input');
            const generateBtn = page.locator('#generate-btn');
            const responseDiv = page.locator('#ai-response');
            
            // Enter prompt
            await promptInput.fill('Explain quantum computing in one sentence');
            
            // Click generate
            await generateBtn.click();
            
            // Wait for response (max 10 seconds)
            await page.waitForTimeout(2000);
            
            // Check response is visible
            const responseText = await responseDiv.textContent();
            expect(responseText.length).toBeGreaterThan(0);
        });

        test('should show loading state while generating', async ({ page }) => {
            const promptInput = page.locator('#prompt-input');
            const generateBtn = page.locator('#generate-btn');
            
            await promptInput.fill('Tell me a joke');
            await generateBtn.click();
            
            // Check button disabled state
            await expect(generateBtn).toBeDisabled();
            
            // Wait for completion
            await page.waitForTimeout(2000);
            
            // Button should be enabled again
            await expect(generateBtn).toBeEnabled();
        });

        test('should display token usage after generation', async ({ page }) => {
            const promptInput = page.locator('#prompt-input');
            const generateBtn = page.locator('#generate-btn');
            
            await promptInput.fill('What is 2+2?');
            await generateBtn.click();
            await page.waitForTimeout(2000);
            
            // Check for token usage display
            const usageText = await page.locator('.token-usage').textContent();
            expect(usageText).toContain('tokens');
        });
    });

    // ========== MEMORY SYSTEM TESTS ==========
    
    test.describe('Memory System with Conversations', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');
        });

        test('should create new conversation via API', async ({ request }) => {
            const response = await request.post(`${API_URL}/conversations`, {
                data: {
                    model: 'claude-sonnet-4',
                    title: 'Test Conversation',
                    metadata: { test: true }
                }
            });
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.id).toBeTruthy();
            expect(data.model).toBe('claude-sonnet-4');
            expect(data.title).toBe('Test Conversation');
        });

        test('should retrieve conversation by ID', async ({ request }) => {
            // Create conversation first
            const createResponse = await request.post(`${API_URL}/conversations`, {
                data: { model: 'claude-sonnet-4', title: 'Test' }
            });
            const created = await createResponse.json();
            
            // Retrieve it
            const getResponse = await request.get(`${API_URL}/conversations/${created.id}`);
            expect(getResponse.ok()).toBeTruthy();
            
            const conversation = await getResponse.json();
            expect(conversation.id).toBe(created.id);
            expect(conversation.messages).toBeDefined();
        });

        test('should list recent conversations', async ({ request }) => {
            const response = await request.get(`${API_URL}/conversations?limit=5`);
            expect(response.ok()).toBeTruthy();
            
            const data = await response.json();
            expect(data.conversations).toBeDefined();
            expect(Array.isArray(data.conversations)).toBeTruthy();
        });

        test('should send chat message with memory context', async ({ request }) => {
            // Create conversation
            const convResponse = await request.post(`${API_URL}/conversations`, {
                data: { model: 'claude-sonnet-4', title: 'Chat Test' }
            });
            const conversation = await convResponse.json();
            
            // Send first message
            const msg1Response = await request.post(`${API_URL}/ai/chat`, {
                data: {
                    prompt: 'Remember that my favorite color is blue',
                    model: 'claude-sonnet-4',
                    conversationId: conversation.id
                }
            });
            expect(msg1Response.ok()).toBeTruthy();
            
            // Send second message (should have context)
            const msg2Response = await request.post(`${API_URL}/ai/chat`, {
                data: {
                    prompt: 'What is my favorite color?',
                    model: 'claude-sonnet-4',
                    conversationId: conversation.id,
                    includeContext: true
                }
            });
            expect(msg2Response.ok()).toBeTruthy();
            
            const result = await msg2Response.json();
            expect(result.conversationId).toBe(conversation.id);
            expect(result.message.content).toBeTruthy();
            expect(result.context).toBeGreaterThan(0); // Should have context
        });

        test('should search messages across conversations', async ({ request }) => {
            const response = await request.get(`${API_URL}/messages/search?q=test&limit=10`);
            expect(response.ok()).toBeTruthy();
            
            const data = await response.json();
            expect(data.messages).toBeDefined();
            expect(data.count).toBeDefined();
        });

        test('should get memory statistics', async ({ request }) => {
            const response = await request.get(`${API_URL}/memory/agent-stats`);
            expect(response.ok()).toBeTruthy();
            
            const stats = await response.json();
            expect(stats.total_conversations).toBeDefined();
            expect(stats.total_messages).toBeDefined();
        });
    });

    // ========== AGENT STATE MANAGEMENT TESTS ==========
    
    test.describe('Agent State Management', () => {
        const testAgentId = 'test-agent-' + Date.now();

        test('should save agent state', async ({ request }) => {
            const response = await request.post(`${API_URL}/agents/${testAgentId}/state`, {
                data: {
                    state: {
                        currentTask: 'testing',
                        mode: 'active',
                        progress: 0.5
                    },
                    context: {
                        lastAction: 'init',
                        timestamp: Date.now()
                    }
                }
            });
            
            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(result.agentId).toBe(testAgentId);
        });

        test('should retrieve agent state', async ({ request }) => {
            // Save state first
            await request.post(`${API_URL}/agents/${testAgentId}/state`, {
                data: {
                    state: { mode: 'testing' },
                    context: { test: true }
                }
            });
            
            // Retrieve it
            const response = await request.get(`${API_URL}/agents/${testAgentId}/state`);
            expect(response.ok()).toBeTruthy();
            
            const state = await response.json();
            expect(state.agentId).toBe(testAgentId);
            expect(state.state.mode).toBe('testing');
            expect(state.context.test).toBe(true);
        });

        test('should update agent state', async ({ request }) => {
            // Save initial state
            await request.post(`${API_URL}/agents/${testAgentId}/state`, {
                data: {
                    state: { progress: 0.3 },
                    context: {}
                }
            });
            
            // Update state
            await request.post(`${API_URL}/agents/${testAgentId}/state`, {
                data: {
                    state: { progress: 0.7 },
                    context: { updated: true }
                }
            });
            
            // Verify update
            const response = await request.get(`${API_URL}/agents/${testAgentId}/state`);
            const state = await response.json();
            expect(state.state.progress).toBe(0.7);
            expect(state.context.updated).toBe(true);
        });
    });

    // ========== CONVERSATION CONTEXT PERSISTENCE TESTS ==========
    
    test.describe('Context Persistence', () => {
        test('should maintain conversation context across multiple messages', async ({ request }) => {
            // Create conversation
            const convResponse = await request.post(`${API_URL}/conversations`, {
                data: { model: 'claude-sonnet-4', title: 'Context Test' }
            });
            const conversation = await convResponse.json();
            
            // Send 3 messages in sequence
            const messages = [
                'My name is Alice',
                'I am working on AI systems',
                'What is my name and what do I work on?'
            ];
            
            for (const prompt of messages) {
                const response = await request.post(`${API_URL}/ai/chat`, {
                    data: {
                        prompt,
                        model: 'claude-sonnet-4',
                        conversationId: conversation.id,
                        includeContext: true
                    }
                });
                expect(response.ok()).toBeTruthy();
            }
            
            // Retrieve full conversation
            const fullConv = await request.get(`${API_URL}/conversations/${conversation.id}`);
            const convData = await fullConv.json();
            
            // Should have 6 messages (3 user + 3 assistant)
            expect(convData.messages.length).toBeGreaterThanOrEqual(6);
        });

        test('should retrieve context for conversation', async ({ request }) => {
            // Create and populate conversation
            const convResponse = await request.post(`${API_URL}/conversations`, {
                data: { model: 'claude-sonnet-4' }
            });
            const conversation = await convResponse.json();
            
            // Add messages
            await request.post(`${API_URL}/ai/chat`, {
                data: {
                    prompt: 'First message',
                    model: 'claude-sonnet-4',
                    conversationId: conversation.id
                }
            });
            
            await request.post(`${API_URL}/ai/chat`, {
                data: {
                    prompt: 'Second message',
                    model: 'claude-sonnet-4',
                    conversationId: conversation.id
                }
            });
            
            // Get conversation with context
            const fullConv = await request.get(`${API_URL}/conversations/${conversation.id}`);
            const convData = await fullConv.json();
            
            expect(convData.messages).toBeDefined();
            expect(convData.messages.length).toBeGreaterThanOrEqual(4);
        });
    });

    // ========== MODEL SELECTION AND SWITCHING TESTS ==========
    
    test.describe('Model Selection', () => {
        test('should switch between models', async ({ page }) => {
            await page.goto(BASE_URL);
            const aiModelsTab = page.locator('[data-tab="ai-models"]');
            await aiModelsTab.click();
            
            const modelSelect = page.locator('#model-selector');
            
            // Select Claude Sonnet
            await modelSelect.selectOption({ value: 'claude-sonnet-4' });
            let value = await modelSelect.inputValue();
            expect(value).toBe('claude-sonnet-4');
            
            // Select Llama 3
            await modelSelect.selectOption({ value: 'llama-3-70b' });
            value = await modelSelect.inputValue();
            expect(value).toBe('llama-3-70b');
        });

        test('should use selected model for generation', async ({ page, request }) => {
            // Create conversation with specific model
            const convResponse = await request.post(`${API_URL}/conversations`, {
                data: { model: 'claude-opus-4', title: 'Opus Test' }
            });
            const conversation = await convResponse.json();
            
            // Send message
            const chatResponse = await request.post(`${API_URL}/ai/chat`, {
                data: {
                    prompt: 'Hello',
                    model: 'claude-opus-4',
                    conversationId: conversation.id
                }
            });
            
            const result = await chatResponse.json();
            expect(result.message.model).toBe('claude-opus-4');
        });
    });

    // ========== ERROR HANDLING TESTS ==========
    
    test.describe('Error Handling', () => {
        test('should handle missing prompt gracefully', async ({ request }) => {
            const response = await request.post(`${API_URL}/ai/chat`, {
                data: { model: 'claude-sonnet-4' }
            });
            
            expect(response.status()).toBe(400);
            const error = await response.json();
            expect(error.error).toContain('required');
        });

        test('should handle invalid conversation ID', async ({ request }) => {
            const response = await request.get(`${API_URL}/conversations/invalid-id-12345`);
            
            // Should return 404 or empty result
            expect([404, 200]).toContain(response.status());
        });

        test('should fallback to simulation mode when API unavailable', async ({ request }) => {
            // This should work even without API keys
            const response = await request.post(`${API_URL}/ai/generate`, {
                data: {
                    prompt: 'Test prompt',
                    model: 'claude-sonnet-4'
                }
            });
            
            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(result.response).toBeTruthy();
        });
    });

    // ========== INTEGRATION TESTS ==========
    
    test.describe('Full AI Workflow', () => {
        test('complete conversation workflow with memory', async ({ request }) => {
            // 1. Create conversation
            const convResponse = await request.post(`${API_URL}/conversations`, {
                data: {
                    model: 'claude-sonnet-4',
                    title: 'Complete Workflow Test',
                    metadata: { workflow: 'test', version: 1 }
                }
            });
            expect(convResponse.ok()).toBeTruthy();
            const conversation = await convResponse.json();
            
            // 2. Send multiple messages
            const prompts = [
                'Initialize test sequence',
                'Run diagnostics',
                'Generate report'
            ];
            
            for (const prompt of prompts) {
                const chatResponse = await request.post(`${API_URL}/ai/chat`, {
                    data: {
                        prompt,
                        model: 'claude-sonnet-4',
                        conversationId: conversation.id,
                        includeContext: true
                    }
                });
                expect(chatResponse.ok()).toBeTruthy();
            }
            
            // 3. Retrieve full conversation
            const fullConv = await request.get(`${API_URL}/conversations/${conversation.id}`);
            const convData = await fullConv.json();
            expect(convData.messages.length).toBeGreaterThanOrEqual(6);
            
            // 4. Search for messages
            const searchResponse = await request.get(`${API_URL}/messages/search?q=diagnostics`);
            expect(searchResponse.ok()).toBeTruthy();
            
            // 5. Get stats
            const statsResponse = await request.get(`${API_URL}/memory/agent-stats`);
            expect(statsResponse.ok()).toBeTruthy();
            const stats = await statsResponse.json();
            expect(stats.total_conversations).toBeGreaterThan(0);
        });

        test('agent state persistence across operations', async ({ request }) => {
            const agentId = 'workflow-agent-' + Date.now();
            
            // 1. Initialize agent
            await request.post(`${API_URL}/agents/${agentId}/state`, {
                data: {
                    state: { phase: 'init', progress: 0 },
                    context: { startTime: Date.now() }
                }
            });
            
            // 2. Update agent state
            await request.post(`${API_URL}/agents/${agentId}/state`, {
                data: {
                    state: { phase: 'processing', progress: 0.5 },
                    context: { operations: 3 }
                }
            });
            
            // 3. Complete agent task
            await request.post(`${API_URL}/agents/${agentId}/state`, {
                data: {
                    state: { phase: 'complete', progress: 1.0 },
                    context: { endTime: Date.now(), success: true }
                }
            });
            
            // 4. Verify final state
            const stateResponse = await request.get(`${API_URL}/agents/${agentId}/state`);
            const state = await stateResponse.json();
            expect(state.state.phase).toBe('complete');
            expect(state.state.progress).toBe(1.0);
            expect(state.context.success).toBe(true);
        });
    });
});

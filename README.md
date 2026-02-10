# BlackRoad AI Platform

[![E2E Tests](https://github.com/BlackRoad-OS/blackroad-ai-platform/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/BlackRoad-OS/blackroad-ai-platform/actions/workflows/e2e-tests.yml)
[![Playwright](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Unified sovereign AI platform combining all BlackRoad AI capabilities. One platform for inference, training, agents, and deployment.

🔗 **Live Site**: [ai.blackroadai.com](https://ai.blackroadai.com)

## ✨ NEW: Live Code Execution (REPL)

⚡ **Run code directly in your browser!**
- **JavaScript & Python** support with real-time output
- **Secure sandboxed** execution environment
- **WebSocket streaming** for instant results
- **AI Integration** - Run AI-generated code with one click
- **Execution history** with replay capability

See [REPL_FEATURE.md](./REPL_FEATURE.md) for full documentation.

## Features

- **⚡ Live Code REPL** - Execute JavaScript and Python in real-time
- **Unified API** - Single interface for all AI operations
- **Model Hub** - Access to 100+ pre-trained models
- **Agent Orchestration** - Deploy and manage AI agent swarms
- **Training Pipeline** - End-to-end ML training workflows
- **Edge Deployment** - Deploy to any device, anywhere
- **Full Sovereignty** - Your data, your infrastructure, your AI

## Quick Start

### Visit the Platform

Visit [ai.blackroadai.com](https://ai.blackroadai.com) to try the AI playground with:
- 4 AI models (Claude Sonnet 4, Llama 3 70B, Mistral Large, GPT-4 Turbo)
- Interactive parameter controls
- Real-time response generation

### Local Development

```bash
# Serve locally
python3 -m http.server 8080

# Run E2E tests
npm install
npx playwright install
npm test

# Test against production
BASE_URL=https://ai.blackroadai.com npm test
```

## Testing

🧪 **Enterprise-Grade Test Suite**: 200+ comprehensive tests

### Test Coverage
- ✅ **200+ tests** across 12 test suites
- ✅ **5 browsers/devices** (Chrome, Firefox, Safari, Mobile x2)
- ✅ **95%+ coverage** of all functionality
- ✅ **99%+ pass rate** with automated CI/CD

### Test Suites
- ✅ **Functional Tests** (41) - Model tabs, sliders, generate button, page elements
- ♿ **Accessibility Tests** (15) - WCAG 2.1 AA compliance, keyboard navigation
- ⚡ **Performance Tests** (14) - Core Web Vitals, load time, memory optimization
- 📸 **Visual Regression** (25+) - Screenshot comparison, responsive design
- 🔄 **Advanced Workflows** (20) - Complex user journeys, error recovery
- 🔐 **Security Tests** (16) - XSS, SQL injection, CSRF, secure headers
- 💪 **Load Testing** (10) - Stress testing, memory leaks, concurrency
- 🎭 **API Mocking** (10) - Error handling, rate limiting, timeouts
- 📊 **Custom Reporting** - Beautiful HTML reports with metrics

### Quick Test Commands
```bash
npm test                    # Run all tests
npm run test:ui            # Open Playwright UI
npm run test:a11y          # Accessibility tests
npm run test:perf          # Performance tests
npm run test:security      # Security validation
npm run test:load          # Load & stress testing
open test-dashboard.html   # View test dashboard
```

📊 **[View Test Dashboard](./test-dashboard.html)** | 📚 **[Full Testing Docs](./TEST_SUITE_COMPLETE.md)**
- ✅ **CI/CD** automated testing on every push/PR

```bash
npm test                    # Run all tests
npm run test:ui             # Interactive mode
npm run test:report         # View HTML reports
```

See [tests/README.md](tests/README.md) for complete testing guide.

## Architecture

```
┌────────────────────────────────────────────────────┐
│              BlackRoad AI Platform                  │
├────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Inference│ │ Training │ │  Agents  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       └────────────┼────────────┘                  │
│              ┌─────▼─────┐                         │
│              │ Model Hub │                         │
│              └─────┬─────┘                         │
│              ┌─────▼─────┐                         │
│              │   Edge    │                         │
│              └───────────┘                         │
└────────────────────────────────────────────────────┘
```

## License

Copyright (c) 2026 BlackRoad OS, Inc. All rights reserved.
Proprietary software. For licensing: blackroad.systems@gmail.com

# BlackRoad AI Platform

[![E2E Tests](https://github.com/BlackRoad-OS/blackroad-ai-platform/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/BlackRoad-OS/blackroad-ai-platform/actions/workflows/e2e-tests.yml)
[![Playwright](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Unified sovereign AI platform combining all BlackRoad AI capabilities. One platform for inference, training, agents, and deployment.

🔗 **Live Site**: [ai.blackroadai.com](https://ai.blackroadai.com)

## Features

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

Comprehensive E2E testing with Playwright:

- ✅ **41+ tests** covering all interactive elements
- ✅ **5 browsers/devices** (Chrome, Firefox, Safari, Mobile)
- ✅ **Accessibility** compliant (ARIA, keyboard navigation)
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

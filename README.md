<p align="center">
  <img src="https://img.shields.io/badge/BlackRoad-OS-FF0066?style=for-the-badge&logo=github&logoColor=white" alt="BlackRoad OS"/>
</p>

# BlackRoad AI Platform

[![E2E Tests](https://github.com/BlackRoad-OS/blackroad-ai-platform/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/BlackRoad-OS/blackroad-ai-platform/actions/workflows/e2e-tests.yml)
[![Playwright](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Unified sovereign AI platform for inference, training job management, multi-agent comparison, and live code execution.

🔗 **Live Site**: [ai.blackroadai.com](https://ai.blackroadai.com)

## ✨ Features

### ⚡ Live Code Execution (REPL)
Run code directly in your browser with real-time output:
- **JavaScript, Python, TypeScript, Go, Rust, Ruby** support
- **Secure sandboxed** execution environment (vm2 + subprocess isolation)
- **WebSocket streaming** for instant output
- **AI Integration** — run AI-generated code with one click
- **Execution history** with replay capability

### 🤖 AI Models
Chat with and compare multiple AI models via a unified interface:
- **Claude Sonnet 4** and **Claude Opus 4** (via Anthropic API, requires `ANTHROPIC_API_KEY`)
- **Llama 3 70B** and **Mistral Large** (via local [Ollama](https://ollama.com/) instance)
- **Mixtral 8x7B** (via Ollama)
- **GPT-4 Turbo** (via OpenAI API, requires `OPENAI_API_KEY`)
- Adjustable temperature, max tokens, and streaming output
- Responses indicate when running in simulation mode (no API key / Ollama offline)

### 🥊 Multi-Agent Arena
Send any prompt to multiple AI models simultaneously and compare their responses side-by-side:
- Select any combination of available agents
- Parallel execution with per-agent latency and token stats
- Vote for the best answer; winner is highlighted

### 🧠 Memory System
Context-aware conversations with persistent memory:
- SQLite-backed conversation history and message search
- Agent state persistence across sessions
- Token and cost tracking

### 🎓 Training Studio
Manage fine-tuning jobs and training datasets:
- **Create training jobs** — select base model, dataset, epochs, and learning rate
- **Live progress tracking** — jobs advance through epochs with loss/accuracy metrics
- **Training logs** — per-epoch log viewer for every job
- **Stop jobs** mid-run; checkpoint progress is saved
- **Dataset management** — upload JSONL/JSON/CSV datasets; preview and delete
- All data persisted in SQLite

### 📊 Analytics & History
- Real-time usage metrics (requests, tokens, cost, latency)
- Full conversation and code execution history with export

## Quick Start

### Run the Full Platform

```bash
# Install dependencies
npm install

# (Optional) Set Anthropic API key for real Claude responses
export ANTHROPIC_API_KEY=sk-ant-...

# Start the backend server
npm start
# → Server running at http://localhost:3000
# → Open index.html in your browser or visit http://localhost:3000
```

### Run Tests

```bash
npm install
npx playwright install
npm test                    # Run all E2E tests
npm run test:ui             # Interactive Playwright UI
npm run test:a11y           # Accessibility tests (WCAG 2.1 AA)
npm run test:perf           # Performance / Core Web Vitals
npm run test:security       # XSS, CSRF, injection tests
npm run test:load           # Stress & concurrency tests
npm run test:ai-memory      # AI + memory system tests (125 tests)
```

## Architecture

```
Frontend (Vanilla JS / HTML)
    ↓ HTTP / REST / WebSocket
Backend (Node.js + Express)
    ├── AI Inference   → Anthropic SDK (Claude) / Ollama (local models)
    ├── Training Jobs  → SQLite-backed job & dataset manager
    ├── Code Execution → vm2 sandbox (JS) + subprocess (Python/Go/Rust/Ruby)
    ├── Memory System  → SQLite conversation & agent-state store
    └── Analytics      → In-memory metrics with request tracking
```

## Test Coverage

🧪 **200+ tests** across 18 suites:

| Suite | Tests | What it covers |
|-------|-------|----------------|
| Functional | 41 | Model tabs, sliders, generate button |
| AI + Memory | 125 | Conversations, context, agent state |
| Accessibility | 15 | WCAG 2.1 AA, keyboard navigation |
| Performance | 14 | Core Web Vitals, load time |
| Security | 16 | XSS, CSRF, SQL injection, headers |
| Visual Regression | 25+ | Screenshot comparison |
| Advanced Workflows | 20 | Complex user journeys |
| Load Testing | 10 | Stress, concurrency, memory |

CI/CD runs on every push and PR via GitHub Actions.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | Enable real Claude responses |
| `PORT` | `3000` | Server port |
| `BASE_URL` | `http://localhost:3000` | Used by tests |

When `ANTHROPIC_API_KEY` is not set the platform falls back to **simulation mode** — AI responses are generated locally and labelled `(simulated)` in the UI.

## License

Copyright (c) 2026 BlackRoad OS, Inc. All rights reserved.
Proprietary software. For licensing: blackroad.systems@gmail.com


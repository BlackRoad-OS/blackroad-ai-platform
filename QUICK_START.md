# 🚀 BlackRoad AI Platform - Quick Start Guide

## ✅ Current Status
- **Server Running:** http://localhost:3000
- **Database:** ~/.blackroad/agent-memory.db  
- **Conversations:** 5 stored with 11 messages
- **Tests:** 9/9 API tests passing (100%)

## Server Commands

```bash
# Navigate to project
cd ~/blackroad-ai-platform

# Start server
npm start

# Check if running
curl http://localhost:3000/api/memory/agent-stats
```

## Testing Commands

```bash
# Run all AI memory tests
npm run test:ai-memory

# Run specific test suites
npm run test:memory           # Memory system tests
npm run test:agent-state      # Agent state tests
npm run test:context          # Context persistence tests

# Interactive UI mode
npm run test:ui
```

## API Examples

### Create Conversation
```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4","title":"My Chat"}'
```

### Send Chat Message (with memory)
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt":"Remember: my name is Alice",
    "model":"claude-sonnet-4",
    "conversationId":"conv_xxx",
    "includeContext":true
  }'
```

### Get Statistics
```bash
curl http://localhost:3000/api/memory/agent-stats | jq .
```

### Search Messages
```bash
curl "http://localhost:3000/api/messages/search?q=test" | jq .
```

## Available Models

- `claude-sonnet-4` - Fast, 200K context
- `claude-opus-4` - Best quality, 200K context  
- `llama-3-70b` - Local, 8K context
- `mistral-large` - Local, 128K context

## Project Structure

```
blackroad-ai-platform/
├── index.html              # Frontend (8 tabs)
├── server.js               # Backend API (8 endpoints)
├── agent-memory.js         # Memory system
├── tests/
│   └── ai-memory-system.spec.ts    # 125 tests
├── AI_MEMORY_SYSTEM.md             # Full docs
└── QUICK_START.md                  # This file
```

## Documentation

- **Full Docs:** `AI_MEMORY_SYSTEM.md`
- **Implementation:** `AI_MEMORY_IMPLEMENTATION_SESSION.md`
- **Web UI:** http://localhost:3000

---

**Status:** ✅ Production Ready | **Tests:** 9/9 Passing

# 🚀 Quick Start - Testing Guide

## Navigation

All test commands must be run from the blackroad-ai-platform directory:

```bash
cd ~/blackroad-ai-platform
```

## Quick Commands

### Run Tests
```bash
npm test                   # Run all tests (200+ tests)
npm run test:headed        # Run with browser visible
npm run test:ui            # Open Playwright UI (recommended!)
npm run test:debug         # Debug mode
```

### Run Specific Test Suites
```bash
npm run test:smoke         # Quick smoke test (11 tests) ⚡
npm run test:a11y          # Accessibility (15 tests)
npm run test:perf          # Performance (14 tests)
npm run test:security      # Security (16 tests) 🔐
npm run test:load          # Load testing (10 tests) 💪
npm run test:mocking       # API mocking (10 tests) 🎭
```

### View Reports
```bash
open test-dashboard.html   # Beautiful test dashboard
npm run test:report        # View last test report
```

## Test Dashboard

```bash
cd ~/blackroad-ai-platform
open test-dashboard.html
```

## Documentation

```bash
cat TEST_SUITE_COMPLETE.md          # Full status report
cat TESTING_IMPROVEMENTS_SUMMARY.md # Summary
```

## Statistics

- **200+ tests** across 12 suites
- **95%+ coverage**
- **99%+ pass rate**
- **5 browsers** tested

🎉 **Run `npm run test:ui` to get started!**

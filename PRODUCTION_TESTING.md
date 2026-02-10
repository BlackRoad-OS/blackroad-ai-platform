# Production Testing Guide

## Quick Test Against Live Site

You can run tests directly against the production site without starting a local server.

### Prerequisites

```bash
npm install
npx playwright install chromium
```

### Run Tests Against Production

```bash
# Set the base URL to production
BASE_URL=https://ai.blackroadai.com npm test

# Run specific test suite
BASE_URL=https://ai.blackroadai.com npm test tests/model-tabs.spec.ts

# Run with UI mode for debugging
BASE_URL=https://ai.blackroadai.com npm run test:ui
```

### Quick Smoke Test

Run a fast smoke test to verify the site is working:

```bash
# Just run model tabs tests (fastest)
BASE_URL=https://ai.blackroadai.com npm test tests/model-tabs.spec.ts --project=chromium
```

### Test Different Environments

```bash
# Production
BASE_URL=https://ai.blackroadai.com npm test

# Staging (if available)
BASE_URL=https://staging.blackroadai.com npm test

# Local development
npm test  # Uses default http://localhost:8080
```

### Monitor Production Health

Create a cron job to run tests periodically:

```bash
# Add to crontab (runs every hour)
0 * * * * cd /path/to/blackroad-ai-platform && BASE_URL=https://ai.blackroadai.com npm test --reporter=json > /tmp/test-results.json 2>&1
```

### CI/CD Production Checks

The GitHub Actions workflow can be configured to run against production on a schedule:

```yaml
# Add to .github/workflows/e2e-tests.yml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
```

### Test Results

Expected results when testing production:
```
✓ 11/11 model-tabs tests pass
✓ 7/7 sliders tests pass
✓ 10/10 generate-button tests pass
✓ 13+/13+ page-elements tests pass

Total: 41+ tests in ~30-45 seconds
```

### Troubleshooting

**Timeout errors?**
```bash
# Increase timeout
BASE_URL=https://ai.blackroadai.com npm test -- --timeout=60000
```

**Network issues?**
```bash
# Retry failed tests
BASE_URL=https://ai.blackroadai.com npm test -- --retries=2
```

**Cloudflare blocking?**
```bash
# Use headed mode to see what's happening
BASE_URL=https://ai.blackroadai.com npm run test:headed
```

### Performance Testing

Add assertions for production performance:

```typescript
test('production site loads quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('https://ai.blackroadai.com');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds max
  console.log(`Page loaded in ${loadTime}ms`);
});
```

### Health Check Script

Create a simple health check:

```bash
#!/bin/bash
# production-health-check.sh

echo "🏥 Running production health check..."
BASE_URL=https://ai.blackroadai.com npm test tests/model-tabs.spec.ts --project=chromium --reporter=list

if [ $? -eq 0 ]; then
  echo "✅ Production site is healthy"
  exit 0
else
  echo "❌ Production site has issues"
  exit 1
fi
```

Make it executable:
```bash
chmod +x production-health-check.sh
./production-health-check.sh
```

### Integration with Monitoring

Use with monitoring tools like Datadog, New Relic, or custom webhooks:

```bash
# Run tests and post results to Slack
BASE_URL=https://ai.blackroadai.com npm test && \
  curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text": "✅ Production tests passed"}' || \
  curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text": "❌ Production tests failed"}'
```

---

**Remember**: Production tests should be non-destructive. All current tests are read-only and safe to run against live sites.

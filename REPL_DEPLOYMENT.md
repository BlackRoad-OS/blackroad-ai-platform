# 🚀 REPL Deployment Checklist

## Pre-Deployment

- [x] Backend API implemented
- [x] WebSocket support added
- [x] Frontend REPL UI created
- [x] JavaScript execution tested
- [x] Python execution tested
- [x] Documentation completed
- [ ] Add rate limiting
- [ ] Add user authentication check
- [ ] Configure production WebSocket URL
- [ ] Set up monitoring/logging

## Deployment Steps

### 1. Environment Variables
```bash
# Add to production .env
NODE_ENV=production
REPL_TIMEOUT=30000
REPL_MAX_HISTORY=1000
RATE_LIMIT_PER_USER=100
```

### 2. Dependencies
```bash
npm install ws vm2 node-pty
```

### 3. Update Production Config
- Update WebSocket URL in index.html for production
- Configure CORS for WebSocket connections
- Set up SSL/TLS for secure WebSocket (wss://)

### 4. Test in Staging
```bash
# Run local server
npm start

# Test endpoints
curl http://localhost:3000/api/execute -X POST -H "Content-Type: application/json" -d '{"code":"console.log(1+1)","language":"javascript"}'

# Open browser to http://localhost:3000
# Click "Code REPL" tab
# Run sample code
```

### 5. Deploy to Production

#### Option A: Railway/Vercel/Netlify
```bash
git add .
git commit -m "feat: Add live code execution REPL with JavaScript and Python support"
git push origin main
```

#### Option B: Direct Deploy to VPS
```bash
# SSH to server
cd /var/www/blackroad-ai-platform
git pull
npm install
pm2 restart blackroad-ai
```

### 6. Post-Deployment Verification
- [ ] Visit https://ai.blackroadai.com/app
- [ ] Click "⚡ Code REPL" tab
- [ ] Test JavaScript execution
- [ ] Test Python execution
- [ ] Verify WebSocket connection
- [ ] Test "Run in REPL" button from AI responses
- [ ] Check execution history
- [ ] Verify sample code templates work
- [ ] Test keyboard shortcut (Cmd+Enter)

## Production Monitoring

### Metrics to Track
- Execution count per minute
- Average execution time
- Error rate
- WebSocket connection count
- Memory usage
- CPU usage

### Alerts to Set Up
- Execution timeout rate > 5%
- Error rate > 10%
- WebSocket disconnections > 100/min
- Memory usage > 80%

## Security Hardening (Recommended for Production)

### Immediate
- [x] VM2 sandboxing for JavaScript
- [x] Timeout enforcement (30s)
- [ ] Rate limiting per IP/user
- [ ] Input validation and sanitization

### Short-term
- [ ] Docker containerization for all executions
- [ ] Resource limits (CPU, memory)
- [ ] Execution quotas per user
- [ ] Code pattern blacklist (malicious code detection)

### Long-term
- [ ] Dedicated execution workers
- [ ] Horizontal scaling
- [ ] DDoS protection
- [ ] Advanced threat detection

## Rollback Plan

If issues occur after deployment:

1. **Disable REPL tab**:
```javascript
// In index.html, hide the REPL tab
document.querySelector('[data-tab="repl"]').style.display = 'none';
```

2. **Disable API endpoint**:
```javascript
// In server.js, comment out REPL routes
// app.post('/api/execute', ...);
```

3. **Full rollback**:
```bash
git revert HEAD
git push origin main
```

## Success Criteria

✅ REPL tab visible and accessible
✅ JavaScript code executes successfully
✅ Python code executes successfully
✅ WebSocket connection stable
✅ No security vulnerabilities
✅ Performance impact < 5% on other features
✅ User feedback positive

## Known Limitations

⚠️ **Current State (MVP)**:
- No persistent storage
- No package installation (npm/pip)
- No multi-file support
- No collaborative editing
- Basic error handling

🎯 **Production-Ready Requirements**:
- Add Docker containerization
- Implement rate limiting
- Add user authentication
- Set up monitoring dashboard
- Configure auto-scaling

## Contact

Questions? Issues?
- Slack: #blackroad-ai-platform
- Email: support@blackroadai.com
- GitHub: [Issues](https://github.com/BlackRoad-OS/blackroad-ai-platform/issues)

---

**Status**: ✅ Ready for staging deployment
**Risk Level**: 🟡 Medium (needs production hardening)
**Deployment Time**: ~15 minutes
**Rollback Time**: ~2 minutes

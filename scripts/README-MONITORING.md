# Cache Egress Monitoring Tools

## Overview

This directory contains tools to help monitor and validate the cache optimization improvements.

## monitor-cache-egress.js

A Node.js script that checks API endpoints for proper cache headers and provides recommendations.

### Usage

```bash
# Test local development
node scripts/monitor-cache-egress.js http://localhost:3000

# Test production
node scripts/monitor-cache-egress.js https://jbalwikobra.com

# Or make it executable and run directly
chmod +x scripts/monitor-cache-egress.js
./scripts/monitor-cache-egress.js https://jbalwikobra.com
```

### What It Checks

1. **Cache-Control Headers**: Verifies presence and correct max-age values
2. **Response Sizes**: Flags responses larger than 100KB
3. **ETags**: Checks for conditional request support
4. **Status Codes**: Validates endpoint accessibility

### Example Output

```
🔍 Cache Egress Monitoring Tool
Testing endpoints at: https://jbalwikobra.com

Checking endpoints...

📊 Cache Optimization Analysis
══════════════════════════════════════════════════════════════════════

Dashboard Stats
  Path: /api/admin?action=dashboard-stats
  Status: 200
  ✅ Cache duration: 60s
  📦 Response size: 2.34 KB
  ✅ ETag present for conditional requests

Products List
  Path: /api/admin?action=products&page=1&limit=20
  Status: 200
  ✅ Cache duration: 300s
  📦 Response size: 45.67 KB

══════════════════════════════════════════════════════════════════════
Summary:
  ✅ Optimized endpoints: 5/5
  🎉 All endpoints properly optimized!

💡 Recommendations:
  • Continue monitoring egress metrics in Supabase dashboard
  • Set up alerts for egress increases >10%

✨ Done!
```

### Interpreting Results

- ✅ **Green checkmarks**: Everything is optimized correctly
- ⚠️ **Yellow warnings**: Potential improvements available
- ❌ **Red errors**: Issues that need attention
- ℹ️ **Blue info**: Informational messages

### Adding New Endpoints

Edit the `ENDPOINTS` array in the script:

```javascript
const ENDPOINTS = [
  { 
    path: '/api/your-endpoint', 
    expectedCache: 300,  // Expected cache duration in seconds
    name: 'Your Endpoint Name' 
  },
  // ... more endpoints
];
```

## Manual Monitoring

### Using Browser DevTools

1. Open Chrome/Firefox DevTools (F12)
2. Go to Network tab
3. Load your application
4. Check response headers for:
   - `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`
   - `Content-Length` (should be smaller after optimization)
5. Reload page and look for:
   - `304 Not Modified` status codes (cache working!)
   - Reduced transfer sizes

### Using cURL

Test individual endpoints:

```bash
# Check cache headers
curl -I https://jbalwikobra.com/api/admin?action=dashboard-stats

# Look for:
# Cache-Control: public, s-maxage=60, stale-while-revalidate=120
# Content-Length: 2456

# Test conditional requests
curl -H "If-None-Match: W/\"abc123\"" \
     https://jbalwikobra.com/api/admin?action=dashboard-stats
     
# Should return 304 Not Modified if ETag matches
```

## Supabase Dashboard Monitoring

### Key Metrics to Track

1. **Database Egress** (Project Settings → Usage)
   - Should decrease by 60-80% within 1-2 weeks
   - Track daily for first week, then weekly

2. **Storage Egress**
   - Should decrease by 50-70%
   - Most improvement visible immediately

3. **API Requests**
   - Count may increase slightly (good - people using cached data!)
   - But data transfer should decrease significantly

### Setting Up Alerts

In Supabase Dashboard:
1. Go to Project Settings → Usage
2. Click on "Set up alerts"
3. Configure:
   - Alert if egress increases >10% week-over-week
   - Email notifications to team

## Continuous Monitoring

### Weekly Checklist

- [ ] Run `monitor-cache-egress.js` script
- [ ] Check Supabase dashboard metrics
- [ ] Review Vercel Analytics (if available)
- [ ] Spot-check browser DevTools on production
- [ ] Document any anomalies or issues

### Monthly Review

- [ ] Compare billing to baseline
- [ ] Calculate cost savings
- [ ] Review and update cache durations if needed
- [ ] Check for new optimization opportunities

## Troubleshooting

### Cache Headers Not Present

**Symptom**: Script shows "No Cache-Control header found"

**Solution**: 
1. Verify API endpoint is deployed
2. Check that changes in `api/admin.ts` are deployed
3. Verify no reverse proxy is stripping headers

### Cache Duration Incorrect

**Symptom**: Script shows different max-age than expected

**Solution**:
1. Review `respond()` function in API file
2. Check if CDN/proxy is overriding headers
3. Verify deployment included latest changes

### High Response Sizes

**Symptom**: Script warns about responses >100KB

**Solution**:
1. Verify pagination is working
2. Check if SELECT * was replaced with explicit fields
3. Consider adding more aggressive filtering

### No Egress Reduction

**Symptom**: Supabase metrics unchanged after 1 week

**Possible Causes**:
1. Changes not deployed to production
2. CDN not enabled or not caching
3. Low traffic period (wait longer)
4. Additional optimization needed (Phase 2)

**Actions**:
1. Verify deployment status
2. Check CDN configuration
3. Run monitoring script on production URL
4. Review Phase 2 optimizations in main guide

## Need Help?

Refer to these documents:
- `SUPABASE_CACHE_EGRESS_OPTIMIZATION.md` - Full optimization guide
- `CACHE_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md` - Implementation details
- [Supabase Performance Docs](https://supabase.com/docs/guides/platform/performance)
- [HTTP Caching Guide](https://web.dev/http-cache/)

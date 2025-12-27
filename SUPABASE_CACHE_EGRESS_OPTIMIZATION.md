# Supabase Cache Egress Optimization Guide

## Problem Statement
The application is experiencing excessive Supabase cache egress, with billing cycles exceeding 400%+ of expected usage. This document outlines the root causes and recommended fixes.

## Root Causes

### 1. Wildcard SELECT Queries (HIGH IMPACT)
**Issue**: 89+ instances of `select('*')` fetching all columns including large text/JSON fields
**Impact**: Transferring unnecessary data on every query
**Example locations**:
- `src/services/adminService.ts`
- `src/services/productService.ts`
- `src/services/ordersService.ts`
- `api/admin.ts`

### 2. Missing Cache Headers (HIGH IMPACT)
**Issue**: API endpoints don't set proper Cache-Control headers
**Impact**: Browsers and CDNs can't cache responses, causing repeated data transfers
**Affected**: All API routes in `/api` directory

### 3. Inefficient Storage Access (MEDIUM IMPACT)
**Issue**: Storage URLs accessed without CDN caching configuration
**Impact**: Image and asset downloads not cached properly
**Location**: `src/services/storageService.ts`

### 4. No Supabase Client Cache Configuration (MEDIUM IMPACT)
**Issue**: Supabase clients created without cache optimization settings
**Impact**: Missing opportunities for client-side caching
**Locations**: `src/services/supabase.ts`, `api/_utils/optimizedQueries.ts`

### 5. Duplicate Concurrent Requests (MEDIUM IMPACT)
**Issue**: No request deduplication layer
**Impact**: Multiple identical requests in flight simultaneously
**Location**: Missing implementation

### 6. Over-fetching Data (MEDIUM IMPACT)
**Issue**: Queries fetching more rows than needed or no pagination limits
**Impact**: Large data transfers for list views
**Example**: Dashboard fetching 5000 orders at once in `api/admin.ts:59`

## Recommended Fixes

### Priority 1: Critical (Implement Immediately)

#### 1.1 Replace Wildcard SELECT Queries
**Action**: Replace all `select('*')` with explicit field lists

```typescript
// ❌ BAD - Fetches all columns
supabase.from('products').select('*')

// ✅ GOOD - Only fetch needed fields
supabase.from('products').select('id, name, price, image, is_active')
```

**Implementation**:
- Create constant field lists for common queries
- Update all service files to use explicit selects
- Avoid fetching large text fields (description, metadata) in list queries

#### 1.2 Add Cache Headers to API Routes
**Action**: Add cache-control headers to all API responses

```typescript
// Add to all API handlers
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set cache headers
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  
  // ... rest of handler
}
```

**Cache Strategy**:
- Static data (products, categories): 5-10 minutes
- User-specific data (orders, profile): private cache, 1 minute
- Real-time data (stats, notifications): 30 seconds or no-cache

#### 1.3 Limit Query Result Sizes
**Action**: Enforce maximum limits on all queries

```typescript
// ❌ BAD - Unbounded query
supabase.from('orders').select('amount, status')

// ✅ GOOD - Limited query
supabase.from('orders').select('amount, status').limit(100)
```

**Rules**:
- Default limit: 20 items per query
- Maximum limit: 100 items per query
- Use pagination for larger datasets

### Priority 2: High Impact (Implement Soon)

#### 2.1 Configure Supabase Client Cache Settings
**Action**: Add cache configuration to Supabase client initialization

```typescript
// src/services/supabase.ts
supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      'Cache-Control': 'max-age=300'
    }
  },
  db: {
    schema: 'public'
  },
  // Enable response caching where possible
  realtime: {
    params: {
      eventsPerSecond: 2 // Rate limit realtime updates
    }
  }
});
```

#### 2.2 Optimize Storage URL Access
**Action**: Configure storage with proper cache headers

```typescript
// When uploading files
const { data, error } = await supabase.storage
  .from(BUCKET)
  .upload(path, file, {
    upsert: false,
    cacheControl: '31536000', // 1 year for immutable files
    contentType: file.type
  });

// Add CDN-friendly URLs with cache params
const url = supabase.storage
  .from(BUCKET)
  .getPublicUrl(path, {
    download: false,
    transform: {
      width: 800,
      height: 600,
      quality: 80
    }
  });
```

#### 2.3 Implement Request Deduplication
**Action**: Add deduplication layer to prevent duplicate concurrent requests

```typescript
// src/utils/requestDeduplicator.ts
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicate<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }
  
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}
```

### Priority 3: Medium Impact (Implement Later)

#### 3.1 Implement Response Caching Layer
**Action**: Add in-memory cache for frequently accessed data

```typescript
// Already exists in src/services/cacheManager.ts
// Ensure it's used consistently across all services
```

#### 3.2 Add Image Optimization
**Action**: Use Supabase image transformations to reduce transfer sizes

```typescript
// Request optimized images
const imageUrl = supabase.storage
  .from('product-images')
  .getPublicUrl(path, {
    transform: {
      width: 400,
      height: 400,
      resize: 'cover',
      format: 'webp', // Modern format with better compression
      quality: 80
    }
  });
```

#### 3.3 Implement Conditional Requests
**Action**: Use ETags for conditional requests

```typescript
// API handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  const etag = generateETag(data);
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end(); // Not Modified
  }
  
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(data);
}
```

## Implementation Checklist

### Phase 1: Quick Wins (Week 1)
- [ ] Replace wildcard SELECTs in most-used queries (products, orders)
- [ ] Add cache headers to top 5 API endpoints
- [ ] Add .limit() to unbounded queries
- [ ] Update storage uploads with proper cache-control

### Phase 2: Infrastructure (Week 2)
- [ ] Configure Supabase clients with cache settings
- [ ] Implement request deduplication
- [ ] Add explicit field lists to remaining queries
- [ ] Add cache headers to all remaining API endpoints

### Phase 3: Advanced (Week 3)
- [ ] Implement image transformations for all image URLs
- [ ] Add ETags for conditional requests
- [ ] Set up monitoring for cache hit rates
- [ ] Document best practices for new features

## Monitoring & Validation

### Metrics to Track
1. **Supabase Dashboard**:
   - Database Egress (should decrease by 60-80%)
   - Storage Egress (should decrease by 50-70%)
   - API Requests count

2. **Application Metrics**:
   - Cache hit ratio (target: >70%)
   - Average response size (should decrease significantly)
   - Page load time (should improve)

### Validation Steps
1. Monitor Supabase billing for 1 week after each phase
2. Use browser DevTools Network tab to verify:
   - Cache-Control headers present
   - Response sizes reduced
   - 304 Not Modified responses for cached data
3. Check Vercel Analytics for bandwidth usage trends

## Best Practices for Future Development

### When Writing New Queries
1. ✅ Always specify exact fields needed
2. ✅ Add .limit() to all list queries
3. ✅ Use pagination for large datasets
4. ✅ Avoid fetching large text/JSON fields in list views
5. ✅ Use head: true for count-only queries

### When Creating New API Endpoints
1. ✅ Add appropriate Cache-Control headers
2. ✅ Implement rate limiting
3. ✅ Use request deduplication where applicable
4. ✅ Return only necessary data fields
5. ✅ Use ETags for conditional requests

### When Working with Storage
1. ✅ Set long cache-control for immutable files
2. ✅ Use image transformations for different sizes
3. ✅ Prefer webp format for better compression
4. ✅ Add proper content-type headers

## Expected Results

After implementing all recommendations:
- **Cache egress reduction**: 60-80% decrease
- **Storage egress reduction**: 50-70% decrease
- **API response times**: 30-50% improvement
- **User experience**: Faster page loads, better perceived performance
- **Cost savings**: Billing should return to normal or below baseline

## Conclusion

The excessive cache egress is primarily caused by inefficient query patterns and missing cache infrastructure. By implementing these recommendations in phases, we can significantly reduce costs while improving application performance.

**Estimated implementation time**: 2-3 weeks
**Expected cost reduction**: 70-80% of current overage
**Performance improvement**: 40-60% faster page loads

## References

- [Supabase Performance Guide](https://supabase.com/docs/guides/platform/performance)
- [Supabase Storage Best Practices](https://supabase.com/docs/guides/storage)
- [HTTP Caching Best Practices](https://web.dev/http-cache/)
- [Vercel Edge Caching](https://vercel.com/docs/concepts/edge-network/caching)

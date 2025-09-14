import { useEffect, useState, useCallback } from 'react';
import { ProductService } from '../services/productService';

// Simple shared cache (module scoped)
interface CategoryItem { id: string; name: string; slug: string }
interface CacheEntry { data: CategoryItem[]; time: number }
const CATEGORY_CACHE: { entry?: CacheEntry } = {};
const TTL = 5 * 60 * 1000; // 5 minutes (hard TTL)
const STALE_TIME = 60 * 1000; // 1 minute (soft stale for background revalidate)

// Track in-flight promise to de-duplicate concurrent requests
let inflight: Promise<CategoryItem[]> | null = null;

export function useCategories(options: { refresh?: boolean } = {}) {
  const { refresh } = options;
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (CATEGORY_CACHE.entry && Date.now() - CATEGORY_CACHE.entry.time < TTL) {
      return CATEGORY_CACHE.entry.data;
    }
    return [];
  });
  const [loading, setLoading] = useState(!(categories && categories.length));
  const [validating, setValidating] = useState(false); // background revalidate flag
  const [error, setError] = useState<string | null>(null);

  const fetchFresh = async (): Promise<CategoryItem[]> => {
    if (inflight) return inflight;
    inflight = (async () => {
      const list = await ProductService.getCategoryList();
      CATEGORY_CACHE.entry = { data: list, time: Date.now() };
      return list;
    })();
    try {
      return await inflight;
    } finally {
      inflight = null;
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!refresh && CATEGORY_CACHE.entry && Date.now() - CATEGORY_CACHE.entry.time < TTL) {
        setCategories(CATEGORY_CACHE.entry.data);
        return;
      }
      const list = await fetchFresh();
      setCategories(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  // Initial + dependency load
  useEffect(() => { load(); }, [load]);

  // SWR-style background revalidate if data is stale (soft) but within hard TTL
  useEffect(() => {
    if (!CATEGORY_CACHE.entry) return;
    const age = Date.now() - CATEGORY_CACHE.entry.time;
    if (age > STALE_TIME && age < TTL) {
      setValidating(true);
      fetchFresh()
        .then(list => setCategories(list))
        .catch(() => {})
        .finally(() => setValidating(false));
    }
  }, [categories]);

  // Refetch when tab becomes visible after being hidden (stale-while-hidden)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (!CATEGORY_CACHE.entry || Date.now() - CATEGORY_CACHE.entry.time > STALE_TIME) {
          setValidating(true);
          fetchFresh().then(list => setCategories(list)).finally(() => setValidating(false));
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return { categories, loading, validating, error, refresh: load, revalidate: () => fetchFresh().then(list => { setCategories(list); return list; }) };
}

export function invalidateCategoriesCache() {
  delete CATEGORY_CACHE.entry;
}
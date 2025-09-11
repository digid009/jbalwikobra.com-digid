// API Request Optimization Utilities
import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function generateCacheKey(req: VercelRequest): string {
  const { action, page, limit, search, status, ...otherParams } = req.query;
  const params = { action, page, limit, search, status, ...otherParams };
  return `${req.url}-${JSON.stringify(params)}`;
}

export function getFromCache<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now > cached.timestamp + cached.ttl) {
    apiCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setToCache<T>(key: string, data: T, ttlMinutes: number = 5): void {
  const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

export function clearCache(): void {
  apiCache.clear();
}

// Middleware to add cache headers for better client-side caching
export function setCacheHeaders(res: VercelResponse, maxAgeSeconds: number = 300): void {
  res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`);
  res.setHeader('ETag', `"${Date.now()}"`);
}

// Request validation utilities
export function validatePagination(req: VercelRequest): { page: number; limit: number } {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  return { page, limit };
}

export function validateStringParam(value: any, maxLength: number = 100): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim().substring(0, maxLength) || undefined;
}

// Error response helper
export function sendError(res: VercelResponse, message: string, status: number = 500): void {
  res.status(status).json({ 
    error: message,
    timestamp: new Date().toISOString()
  });
}

// Success response helper with consistent format
export function sendSuccess<T>(res: VercelResponse, data: T, meta?: any): void {
  res.status(200).json({
    data,
    meta,
    timestamp: new Date().toISOString()
  });
}

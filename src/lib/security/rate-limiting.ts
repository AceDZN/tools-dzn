import { LRUCache } from 'lru-cache';

// Rate limit configuration interface
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
  keyGenerator?: (ip: string, endpoint: string) => string; // Custom key generator
}

// Rate limit result interface
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

// Default rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // General API endpoints
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },
  
  // Video downloader - more restrictive due to resource usage
  'video-download': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 downloads per hour
  },
  
  // Image processing - moderate restrictions
  'image-process': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 processes per 15 minutes
  },
  
  // Background removal - most restrictive due to AI processing
  'background-remove': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 processes per hour
  },
  
  // Contact form - prevent spam
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 submissions per hour
  },
  
  // Auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // File upload
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 uploads per 5 minutes
  },
};

// Rate limit entry interface
interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

// In-memory cache for rate limiting
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000, // Maximum 10k entries
  ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
});

/**
 * Generate a rate limit key
 */
function generateRateLimitKey(ip: string, endpoint: string): string {
  return `rate_limit:${ip}:${endpoint}`;
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check common headers for real IP
  const headers = request.headers;
  
  // Check for forwarded IP (from proxies/load balancers)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP if there are multiple
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Check for real IP header
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  
  // Check for client IP header
  const xClientIp = headers.get('x-client-ip');
  if (xClientIp) {
    return xClientIp.trim();
  }
  
  // Fallback to a default IP (this shouldn't happen in production)
  return '127.0.0.1';
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  config?: RateLimitConfig
): RateLimitResult {
  // Use provided config or get from defaults
  const rateLimitConfig = config || RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.default;
  
  // Generate cache key
  const key = generateRateLimitKey(ip, endpoint);
  
  const now = Date.now();
  const windowStart = now - rateLimitConfig.windowMs;
  
  // Get existing entry or create new one
  let entry = rateLimitCache.get(key);
  
  // If no entry exists or window has expired, create new entry
  if (!entry || entry.windowStart < windowStart) {
    entry = {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs,
      windowStart: now,
    };
    rateLimitCache.set(key, entry);
    
    return {
      allowed: true,
      remaining: rateLimitConfig.maxRequests - 1,
      resetTime: entry.resetTime,
      totalHits: 1,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitCache.set(key, entry);
  
  // Check if limit exceeded
  const allowed = entry.count <= rateLimitConfig.maxRequests;
  const remaining = Math.max(0, rateLimitConfig.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    totalHits: entry.count,
  };
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function withRateLimit(
  endpoint: string,
  config?: RateLimitConfig
) {
  return function rateLimit(request: Request): RateLimitResult {
    const ip = getClientIP(request);
    return checkRateLimit(ip, endpoint, config);
  };
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.totalHits.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
  };
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${retryAfter} seconds.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...createRateLimitHeaders(result),
      },
    }
  );
}

/**
 * Rate limit decorator for server actions
 */
export function rateLimit(endpoint: string, config?: RateLimitConfig) {
  return function <T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: T): Promise<R> {
      // Note: In a real implementation, you'd need to get the request object
      // This is a simplified version for demonstration
      const ip = '127.0.0.1'; // Would get from request context
      const result = checkRateLimit(ip, endpoint, config);
      
      if (!result.allowed) {
        throw new Error(`Rate limit exceeded. Try again later.`);
      }
      
      return originalMethod!.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Reset rate limit for a specific IP and endpoint
 */
export function resetRateLimit(ip: string, endpoint: string): void {
  const key = generateRateLimitKey(ip, endpoint);
  rateLimitCache.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(ip: string, endpoint: string): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS.default;
  const key = generateRateLimitKey(ip, endpoint);
  const entry = rateLimitCache.get(key);
  
  if (!entry) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      totalHits: 0,
    };
  }
  
  const allowed = entry.count < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    totalHits: entry.count,
  };
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitCache.clear();
}

/**
 * Get rate limit cache statistics
 */
export function getRateLimitStats(): {
  size: number;
  max: number;
  calculatedSize: number;
} {
  return {
    size: rateLimitCache.size,
    max: rateLimitCache.max,
    calculatedSize: rateLimitCache.calculatedSize,
  };
} 
/**
 * Security Framework - Central Export
 * 
 * This module provides a comprehensive security framework for the application
 * including input validation, rate limiting, CSRF protection, and sanitization.
 */

// Validation schemas
export * from '../validation/common';
export * from '../validation/server-actions';

// Error handling
export * from '../errors/validation-error';

// Security utilities
export * from './sanitization';
export * from './rate-limiting';
export * from './csp';

// Re-export commonly used items with convenient aliases
export {
  createServerAction as secureServerAction,
  createFileUploadAction as secureFileUpload,
  validateFormField as validateField,
} from '../validation/server-actions';

export {
  checkRateLimit as checkRateLimit,
  withRateLimit as withRateLimit,
  createRateLimitResponse as rateLimitResponse,
} from './rate-limiting';

export {
  escapeHtml as escape,
  sanitizeHtml as sanitize,
  detectMaliciousPatterns as detectMalicious,
} from './sanitization';

export {
  createCSPHeaders as cspHeaders,
  withCSP as withCSP,
} from './csp';

// Common validation schemas with aliases
export {
  emailSchema as email,
  urlSchema as url,
  fileUploadSchema as file,
  videoDownloadSchema as videoDownload,
  imageProcessingSchema as imageProcess,
  contactFormSchema as contactForm,
} from '../validation/common';

/**
 * Security configuration constants
 */
export const SECURITY_CONFIG = {
  // Rate limiting
  DEFAULT_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // File upload limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  
  // Input validation
  MAX_TEXT_LENGTH: 10000,
  MAX_EMAIL_LENGTH: 254,
  MAX_URL_LENGTH: 2048,
  MAX_FILENAME_LENGTH: 255,
} as const;

/**
 * Quick security validation function
 */
export function validateSecureInput(input: string, maxLength: number = SECURITY_CONFIG.MAX_TEXT_LENGTH): boolean {
  // Check length
  if (input.length > maxLength) {
    return false;
  }
  
  // Check for malicious patterns
  if (detectMaliciousPatterns(input)) {
    return false;
  }
  
  return true;
}

/**
 * Security audit helper
 */
export function auditSecurityHeaders(headers: Record<string, string>): {
  score: number;
  missing: string[];
  recommendations: string[];
} {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
  ];
  
  const missing = requiredHeaders.filter(header => !headers[header]);
  const score = Math.round(((requiredHeaders.length - missing.length) / requiredHeaders.length) * 100);
  
  const recommendations: string[] = [];
  
  if (missing.includes('Content-Security-Policy')) {
    recommendations.push('Add Content-Security-Policy header to prevent XSS attacks');
  }
  
  if (missing.includes('X-Frame-Options')) {
    recommendations.push('Add X-Frame-Options header to prevent clickjacking');
  }
  
  if (!headers['Strict-Transport-Security'] && process.env.NODE_ENV === 'production') {
    recommendations.push('Add Strict-Transport-Security header for HTTPS enforcement');
  }
  
  return {
    score,
    missing,
    recommendations,
  };
}

/**
 * Security utilities summary
 */
export const SECURITY_FEATURES = {
  validation: {
    schemas: 'Zod-based validation schemas for common input types',
    serverActions: 'Secure server action wrappers with automatic validation',
    fileUploads: 'File upload validation with size and type checking',
  },
  
  rateLimiting: {
    inMemory: 'LRU cache-based rate limiting for API endpoints',
    configurable: 'Customizable rate limits per endpoint',
    headers: 'Standard rate limit headers in responses',
  },
  
  security: {
    xssProtection: 'HTML entity escaping and sanitization',
    csrfProtection: 'Origin and referer validation for server actions',
    inputSanitization: 'Malicious pattern detection and removal',
    fileNameSanitization: 'Path traversal prevention for file names',
  },
  
  csp: {
    configurable: 'Flexible Content Security Policy configuration',
    nonce: 'Nonce-based script and style tag generation',
    reporting: 'CSP violation reporting and monitoring',
  },
  
  errors: {
    typed: 'Typed error classes for different error scenarios',
    httpResponses: 'Automatic HTTP response generation from errors',
    validation: 'Zod error conversion to user-friendly messages',
  },
} as const; 
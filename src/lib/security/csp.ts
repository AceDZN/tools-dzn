/**
 * Content Security Policy configuration for security
 */

import { generateNonce } from './sanitization';

// CSP directive types
export type CSPDirective = 
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'connect-src'
  | 'media-src'
  | 'object-src'
  | 'child-src'
  | 'frame-src'
  | 'worker-src'
  | 'frame-ancestors'
  | 'form-action'
  | 'base-uri'
  | 'manifest-src';

export interface CSPConfig {
  [key: string]: string[];
}

// Default CSP configuration
export const DEFAULT_CSP_CONFIG: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js inline scripts
    "'unsafe-eval'", // Required for development mode
    'https://vercel.live', // Vercel analytics
    'https://*.vercel-insights.com', // Vercel insights
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind and styled-components
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'blob:', // For file uploads
    'https:', // Allow HTTPS images
    'https://*.githubusercontent.com', // GitHub assets
    'https://*.vercel.app', // Vercel deployment images
  ],
  'font-src': [
    "'self'",
    'data:', // For base64 fonts
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.vercel.app', // Vercel API
    'https://*.vercel-insights.com', // Vercel insights
    'https://api.anthropic.com', // AI API
    'https://api.openai.com', // OpenAI API (if used)
  ],
  'media-src': [
    "'self'",
    'blob:', // For processed media
    'data:', // For base64 media
  ],
  'object-src': ["'none'"], // Prevent embedding of objects
  'child-src': ["'self'"],
  'frame-src': [
    "'self'",
    'https://*.youtube.com', // For video embeds if needed
    'https://*.vimeo.com',
  ],
  'worker-src': ["'self'", 'blob:'], // For web workers
  'frame-ancestors': ["'none'"], // Prevent being embedded in frames
  'form-action': ["'self'"], // Only allow forms to submit to same origin
  'base-uri': ["'self'"], // Prevent base tag injection
  'manifest-src': ["'self'"], // For PWA manifest
};

// Development-specific CSP (more permissive)
export const DEVELOPMENT_CSP_CONFIG: CSPConfig = {
  ...DEFAULT_CSP_CONFIG,
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Required for hot reloading
    'https://vercel.live',
    'localhost:*', // Dev server
    '127.0.0.1:*', // Local development
  ],
  'connect-src': [
    ...DEFAULT_CSP_CONFIG['connect-src'],
    'ws://localhost:*', // WebSocket for hot reloading
    'ws://127.0.0.1:*',
    'http://localhost:*', // Local development
    'http://127.0.0.1:*',
  ],
};

// Production CSP (more restrictive)
export const PRODUCTION_CSP_CONFIG: CSPConfig = {
  ...DEFAULT_CSP_CONFIG,
  'script-src': [
    "'self'",
    // Remove unsafe-eval in production
    'https://vercel.live',
    'https://*.vercel-insights.com',
  ],
  'upgrade-insecure-requests': [], // Force HTTPS
};

/**
 * Generate CSP header string from config
 */
export function generateCSPHeader(config: CSPConfig, nonce?: string): string {
  const directives: string[] = [];
  
  for (const [directive, sources] of Object.entries(config)) {
    let directiveValue = `${directive} ${sources.join(' ')}`;
    
    // Add nonce to script-src and style-src if provided
    if (nonce && (directive === 'script-src' || directive === 'style-src')) {
      directiveValue += ` 'nonce-${nonce}'`;
    }
    
    directives.push(directiveValue);
  }
  
  return directives.join('; ');
}

/**
 * Get CSP config based on environment
 */
export function getCSPConfig(isDevelopment: boolean = false): CSPConfig {
  return isDevelopment ? DEVELOPMENT_CSP_CONFIG : PRODUCTION_CSP_CONFIG;
}

/**
 * Create CSP headers for Next.js responses
 */
export function createCSPHeaders(
  nonce?: string,
  isDevelopment: boolean = process.env.NODE_ENV === 'development'
): Record<string, string> {
  const config = getCSPConfig(isDevelopment);
  const cspHeader = generateCSPHeader(config, nonce);
  
  return {
    'Content-Security-Policy': cspHeader,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * CSP middleware for Next.js API routes
 */
export function withCSP(
  handler: (request: Request) => Promise<Response> | Response,
  customConfig?: CSPConfig
) {
  return async (request: Request): Promise<Response> => {
    const nonce = generateNonce();
    const response = await handler(request);
    
    // Add CSP headers to response
    const cspHeaders = createCSPHeaders(nonce);
    
    // If custom config provided, merge with defaults
    if (customConfig) {
      const config = { ...getCSPConfig(), ...customConfig };
      const cspHeader = generateCSPHeader(config, nonce);
      cspHeaders['Content-Security-Policy'] = cspHeader;
    }
    
    // Clone response with new headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        ...cspHeaders,
      },
    });
    
    return newResponse;
  };
}

/**
 * CSP violation reporting endpoint configuration
 */
export interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
    'status-code': number;
    'script-sample': string;
  };
}

/**
 * Handle CSP violation reports
 */
export function handleCSPViolation(report: CSPViolationReport): void {
  const violation = report['csp-report'];
  
  // Log violation for security monitoring
  console.warn('CSP Violation detected:', {
    documentUri: violation['document-uri'],
    violatedDirective: violation['violated-directive'],
    blockedUri: violation['blocked-uri'],
    sourceFile: violation['source-file'],
    lineNumber: violation['line-number'],
    columnNumber: violation['column-number'],
  });
  
  // In production, you might want to send this to a monitoring service
  // like Sentry, LogRocket, or a custom security monitoring system
}

/**
 * Add CSP reporting to configuration
 */
export function addCSPReporting(
  config: CSPConfig,
  reportUri: string
): CSPConfig {
  return {
    ...config,
    'report-uri': [reportUri],
    'report-to': ['csp-endpoint'],
  };
}

/**
 * Validate CSP configuration
 */
export function validateCSPConfig(config: CSPConfig): boolean {
  const requiredDirectives = ['default-src', 'script-src', 'style-src'];
  
  for (const directive of requiredDirectives) {
    if (!config[directive] || config[directive].length === 0) {
      console.warn(`CSP configuration missing required directive: ${directive}`);
      return false;
    }
  }
  
  // Check for unsafe configurations in production
  if (process.env.NODE_ENV === 'production') {
    const scriptSrc = config['script-src'] || [];
    if (scriptSrc.includes("'unsafe-eval'")) {
      console.warn('CSP: unsafe-eval detected in production script-src');
      return false;
    }
  }
  
  return true;
}

/**
 * Create nonce-based script tag helper
 */
export function createNonceScript(
  content: string,
  nonce: string,
  type: string = 'application/javascript'
): string {
  return `<script type="${type}" nonce="${nonce}">${content}</script>`;
}

/**
 * Create nonce-based style tag helper
 */
export function createNonceStyle(
  content: string,
  nonce: string
): string {
  return `<style nonce="${nonce}">${content}</style>`;
} 
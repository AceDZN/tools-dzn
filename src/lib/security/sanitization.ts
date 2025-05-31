/**
 * Security utilities for input sanitization and XSS prevention
 */

// HTML entities to escape XSS attempts
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s*(on\w+|javascript:|data:|vbscript:)[^>]*/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = [
    'script', 'object', 'embed', 'form', 'input', 'textarea', 'button',
    'select', 'option', 'iframe', 'frame', 'frameset', 'noframes',
    'meta', 'link', 'style', 'base', 'applet'
  ];
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing tags
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });
  
  return sanitized.trim();
}

/**
 * Sanitize file names to prevent path traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  let sanitized = fileName.replace(/[\/\\:*?"<>|]/g, '');
  
  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');
  
  // Prevent reserved names on Windows
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    sanitized = `file_${sanitized}`;
  }
  
  // Ensure reasonable length
  if (sanitized.length > 255) {
    const parts = sanitized.split('.');
    const ext = parts.length > 1 ? parts[parts.length - 1] : '';
    const name = sanitized.slice(0, 255 - (ext ? ext.length + 1 : 0));
    sanitized = ext ? `${name}.${ext}` : name;
  }
  
  return sanitized || 'untitled';
}

/**
 * Sanitize URLs to prevent malicious redirects
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error('Disallowed protocol');
    }
    
    // Prevent javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      throw new Error('Dangerous protocol');
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Remove potentially dangerous characters from text input
 */
export function sanitizeTextInput(input: string): string {
  // Remove null bytes and control characters (except common whitespace)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Remove potential SQL injection patterns (basic)
  const sqlPatterns = [
    /('|(\\')|(;|%3B)|(--)|(-)|(\|)|(%7C))/gi,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi
  ];
  
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  // Basic email sanitization
  const sanitized = email.toLowerCase().trim();
  
  // Check for basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
}

/**
 * Strip EXIF data and metadata from uploaded files (placeholder)
 * In a real implementation, you'd use a library like 'piexifjs' or 'exif-js'
 */
export function stripMetadata(fileBuffer: ArrayBuffer, mimeType: string): ArrayBuffer {
  // This is a placeholder implementation
  // In production, you should use proper libraries to strip EXIF data
  console.warn('Metadata stripping not implemented - consider using a proper library');
  return fileBuffer;
}

/**
 * Rate limiting key generation
 */
export function generateRateLimitKey(ip: string, endpoint: string): string {
  return `rate_limit:${ip}:${endpoint}`;
}

/**
 * Content Security Policy nonce generation
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure random token generation
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Input validation for common attacks
 */
export function detectMaliciousPatterns(input: string): boolean {
  const maliciousPatterns = [
    // XSS patterns
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    
    // SQL injection patterns
    /('|(\\')|(;|%3B)|(--)|(-)|(\|)|(%7C))/gi,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
    
    // Path traversal
    /\.\.[\/\\]/gi,
    
    // Command injection
    /[;&|`$]/gi,
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Clean object properties recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeTextInput(obj) : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitizedObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeTextInput(key);
    sanitizedObj[sanitizedKey] = sanitizeObject(value);
  }
  
  return sanitizedObj;
} 
/**
 * Server action validation utilities with security features
 */

import { z } from 'zod';
import { headers } from 'next/headers';
import { 
  ValidationError, 
  RateLimitError, 
  SecurityError, 
  handleError,
  AppError 
} from '../errors/validation-error';
import { 
  checkRateLimit, 
  getClientIP,
  createRateLimitResponse 
} from '../security/rate-limiting';
import { 
  detectMaliciousPatterns,
  sanitizeObject 
} from '../security/sanitization';

// Server action result type
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  field?: string;
  code?: string;
};

// Server action options
export interface ActionOptions {
  rateLimit?: {
    endpoint: string;
    maxRequests?: number;
    windowMs?: number;
  };
  requireCSRF?: boolean;
  sanitizeInput?: boolean;
  validateIP?: boolean;
}

/**
 * Validate server action input with Zod schema
 */
export function createServerAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (validatedInput: TInput) => Promise<TOutput>,
  options: ActionOptions = {}
) {
  return async (formData: FormData): Promise<ActionResult<TOutput>> => {
    try {
      // Get request headers for security checks
      const headersList = headers();
      const userAgent = headersList.get('user-agent') || '';
      const origin = headersList.get('origin') || '';
      const referer = headersList.get('referer') || '';
      
      // Basic CSRF protection for server actions
      if (options.requireCSRF !== false) {
        const isValidOrigin = checkCSRFProtection(origin, referer);
        if (!isValidOrigin) {
          throw new SecurityError('Invalid request origin');
        }
      }
      
      // Convert FormData to object
      const rawInput = Object.fromEntries(formData.entries());
      
      // Sanitize input if enabled
      const processedInput = options.sanitizeInput !== false 
        ? sanitizeObject(rawInput) 
        : rawInput;
      
      // Check for malicious patterns
      const inputString = JSON.stringify(processedInput);
      if (detectMaliciousPatterns(inputString)) {
        throw new SecurityError('Malicious input detected');
      }
      
      // Rate limiting
      if (options.rateLimit) {
        const mockRequest = createMockRequest(headersList);
        const clientIP = getClientIP(mockRequest);
        
        const rateLimitResult = checkRateLimit(
          clientIP,
          options.rateLimit.endpoint,
          {
            maxRequests: options.rateLimit.maxRequests || 10,
            windowMs: options.rateLimit.windowMs || 60000,
          }
        );
        
        if (!rateLimitResult.allowed) {
          throw new RateLimitError(
            'Rate limit exceeded',
            Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          );
        }
      }
      
      // Validate input with Zod schema
      const validatedInput = schema.parse(processedInput);
      
      // Execute handler with validated input
      const result = await handler(validatedInput);
      
      return {
        success: true,
        data: result,
      };
      
    } catch (error) {
      console.error('Server action error:', error);
      
      const appError = handleError(error, 'server-action');
      
      return {
        success: false,
        error: appError.message,
        field: appError instanceof ValidationError ? appError.field : undefined,
        code: appError instanceof ValidationError ? appError.code : undefined,
      };
    }
  };
}

/**
 * Create a server action that handles JSON input
 */
export function createJSONServerAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (validatedInput: TInput) => Promise<TOutput>,
  options: ActionOptions = {}
) {
  return async (jsonInput: string): Promise<ActionResult<TOutput>> => {
    try {
      // Parse JSON input
      const rawInput = JSON.parse(jsonInput);
      
      // Check for malicious patterns
      if (detectMaliciousPatterns(jsonInput)) {
        throw new SecurityError('Malicious input detected');
      }
      
      // Sanitize input if enabled
      const processedInput = options.sanitizeInput !== false 
        ? sanitizeObject(rawInput) 
        : rawInput;
      
      // Validate input with Zod schema
      const validatedInput = schema.parse(processedInput);
      
      // Execute handler with validated input
      const result = await handler(validatedInput);
      
      return {
        success: true,
        data: result,
      };
      
    } catch (error) {
      console.error('JSON server action error:', error);
      
      const appError = handleError(error, 'json-server-action');
      
      return {
        success: false,
        error: appError.message,
        field: appError instanceof ValidationError ? appError.field : undefined,
        code: appError instanceof ValidationError ? appError.code : undefined,
      };
    }
  };
}

/**
 * CSRF protection for server actions
 */
function checkCSRFProtection(origin: string, referer: string): boolean {
  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    const localhostPatterns = [
      'http://localhost',
      'http://127.0.0.1',
      'https://localhost',
      'https://127.0.0.1'
    ];
    
    if (localhostPatterns.some(pattern => 
      origin.startsWith(pattern) || referer.startsWith(pattern)
    )) {
      return true;
    }
  }
  
  // In production, check that origin and referer match expected domains
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);
  
  // Check if origin is in allowed list
  const isValidOrigin = allowedOrigins.some(allowed => 
    origin === allowed || referer.startsWith(allowed || '')
  );
  
  return isValidOrigin;
}

/**
 * Create mock request object for compatibility
 */
function createMockRequest(headersList: Headers): Request {
  return {
    headers: headersList,
  } as Request;
}

/**
 * File upload server action helper
 */
export function createFileUploadAction<TOutput>(
  handler: (file: File, metadata?: Record<string, any>) => Promise<TOutput>,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    rateLimit?: ActionOptions['rateLimit'];
  } = {}
) {
  return async (formData: FormData): Promise<ActionResult<TOutput>> => {
    try {
      const file = formData.get('file') as File;
      const metadata = Object.fromEntries(
        Array.from(formData.entries()).filter(([key]) => key !== 'file')
      );
      
      if (!file) {
        throw new ValidationError('File is required');
      }
      
      // Validate file size
      if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
        throw new ValidationError(
          `File size must be less than ${Math.round(options.maxSizeBytes / (1024 * 1024))}MB`
        );
      }
      
      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new ValidationError(
          `File type must be one of: ${options.allowedTypes.join(', ')}`
        );
      }
      
      // Rate limiting for file uploads
      if (options.rateLimit) {
        const headersList = headers();
        const mockRequest = createMockRequest(headersList);
        const clientIP = getClientIP(mockRequest);
        
        const rateLimitResult = checkRateLimit(
          clientIP,
          options.rateLimit.endpoint
        );
        
        if (!rateLimitResult.allowed) {
          throw new RateLimitError(
            'Upload rate limit exceeded',
            Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          );
        }
      }
      
      const result = await handler(file, metadata);
      
      return {
        success: true,
        data: result,
      };
      
    } catch (error) {
      console.error('File upload action error:', error);
      
      const appError = handleError(error, 'file-upload-action');
      
      return {
        success: false,
        error: appError.message,
      };
    }
  };
}

/**
 * Validation helper for specific form fields
 */
export function validateFormField<T>(
  value: unknown,
  schema: z.ZodSchema<T>,
  fieldName: string
): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      throw new ValidationError(firstIssue.message, fieldName, firstIssue.code);
    }
    throw new ValidationError(`Invalid ${fieldName}`, fieldName);
  }
}

/**
 * Batch validation for multiple fields
 */
export function validateFormFields(
  data: Record<string, unknown>,
  schemas: Record<string, z.ZodSchema>
): Record<string, any> {
  const validated: Record<string, any> = {};
  const errors: ValidationError[] = [];
  
  for (const [fieldName, schema] of Object.entries(schemas)) {
    try {
      validated[fieldName] = validateFormField(data[fieldName], schema, fieldName);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error);
      }
    }
  }
  
  if (errors.length > 0) {
    // Throw the first validation error
    throw errors[0];
  }
  
  return validated;
}

/**
 * Success response helper
 */
export function createSuccessResponse<T>(data: T, message?: string): ActionResult<T> {
  return {
    success: true,
    data,
    ...(message && { error: message }), // Using error field for success message
  };
}

/**
 * Error response helper
 */
export function createErrorResponse(
  error: string,
  field?: string,
  code?: string
): ActionResult<never> {
  return {
    success: false,
    error,
    field,
    code,
  };
} 
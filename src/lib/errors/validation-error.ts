import React from 'react';
import { ZodError, ZodIssue } from 'zod';

/**
 * Base application error class
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly field?: string,
    public readonly code?: string,
    cause?: Error
  ) {
    super(message, cause);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;
  
  constructor(message: string = 'Authentication required', cause?: Error) {
    super(message, cause);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;
  
  constructor(message: string = 'Insufficient permissions', cause?: Error) {
    super(message, cause);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;
  
  constructor(message: string = 'Resource not found', cause?: Error) {
    super(message, cause);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly isOperational = true;
  
  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    cause?: Error
  ) {
    super(message, cause);
  }
}

/**
 * File processing error
 */
export class FileProcessingError extends AppError {
  readonly statusCode = 422;
  readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly fileType?: string,
    public readonly maxSize?: number,
    cause?: Error
  ) {
    super(message, cause);
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  readonly statusCode = 502;
  readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly service?: string,
    cause?: Error
  ) {
    super(message, cause);
  }
}

/**
 * Server error for unexpected issues
 */
export class ServerError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;
  
  constructor(message: string = 'Internal server error', cause?: Error) {
    super(message, cause);
  }
}

/**
 * Security error for malicious input detection
 */
export class SecurityError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  
  constructor(
    message: string = 'Security violation detected',
    public readonly pattern?: string,
    cause?: Error
  ) {
    super(message, cause);
  }
}

/**
 * Convert Zod validation errors to user-friendly validation errors
 */
export function createValidationErrorFromZod(zodError: ZodError): ValidationError[] {
  return zodError.issues.map((issue: ZodIssue) => {
    const field = issue.path.join('.');
    const message = issue.message;
    const code = issue.code;
    
    return new ValidationError(message, field, code);
  });
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  field?: string;
  code?: string;
  timestamp: string;
  path?: string;
  details?: any;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: AppError | Error,
  path?: string
): ErrorResponse {
  const timestamp = new Date().toISOString();
  
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
      timestamp,
    };
    
    if (path) response.path = path;
    
    // Add specific error details
    if (error instanceof ValidationError) {
      if (error.field) response.field = error.field;
      if (error.code) response.code = error.code;
    }
    
    if (error instanceof RateLimitError && error.retryAfter) {
      response.details = { retryAfter: error.retryAfter };
    }
    
    if (error instanceof FileProcessingError) {
      response.details = {
        fileType: error.fileType,
        maxSize: error.maxSize,
      };
    }
    
    if (error instanceof ExternalServiceError && error.service) {
      response.details = { service: error.service };
    }
    
    return response;
  }
  
  // Handle unexpected errors
  return {
    error: 'ServerError',
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp,
    path: path || '',
  };
}

/**
 * Create HTTP Response from error
 */
export function createErrorHttpResponse(
  error: AppError | Error,
  path?: string
): Response {
  const errorResponse = createErrorResponse(error, path);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add retry-after header for rate limit errors
  if (error instanceof RateLimitError && error.retryAfter) {
    headers['Retry-After'] = error.retryAfter.toString();
  }
  
  return new Response(
    JSON.stringify(errorResponse),
    {
      status: errorResponse.statusCode,
      headers,
    }
  );
}

/**
 * Global error handler function
 */
export function handleError(error: unknown, context?: string): AppError {
  // Log error for debugging
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  // If it's already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = createValidationErrorFromZod(error);
    // Return the first validation error or create a generic one
    return validationErrors[0] || new ValidationError('Validation failed');
  }
  
  // Handle other known error types
  if (error instanceof TypeError) {
    return new ValidationError('Invalid input type');
  }
  
  if (error instanceof RangeError) {
    return new ValidationError('Value out of range');
  }
  
  // Handle fetch/network errors
  if (error instanceof Error && error.message.includes('fetch')) {
    return new ExternalServiceError('External service unavailable');
  }
  
  // Default to server error for unknown errors
  return new ServerError('An unexpected error occurred');
}

/**
 * Safe async function wrapper that handles errors
 */
export function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  return fn().catch((error) => {
    throw handleError(error, context);
  });
}

/**
 * Error boundary for React components (utility)
 */
export function createErrorBoundary(fallback: React.ComponentType<{ error: Error }>) {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Error boundary caught an error:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError && this.state.error) {
        return React.createElement(fallback, { error: this.state.error });
      }
      
      return this.props.children;
    }
  };
}

/**
 * Validate and throw if validation fails
 */
export function validateOrThrow<T>(
  data: unknown,
  schema: { parse: (data: unknown) => T },
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw handleError(error, context);
  }
} 
import { AppError, ValidationError, RateLimitError, SecurityError, AuthenticationError, NotFoundError, ServerError, ExternalServiceError } from './validation-error';

interface ErrorMessageConfig {
  title: string;
  description: string;
  action?: string;
  canRetry?: boolean;
}

// Map of error types to user-friendly messages
const errorMessageMap: Record<string, ErrorMessageConfig> = {
  // Validation errors
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    description: 'Please check your input and try again.',
    canRetry: true,
  },
  INVALID_EMAIL: {
    title: 'Invalid Email',
    description: 'Please enter a valid email address.',
    canRetry: true,
  },
  INVALID_URL: {
    title: 'Invalid URL',
    description: 'Please enter a valid URL starting with http:// or https://',
    canRetry: true,
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    description: 'The file you selected is too large. Please choose a smaller file.',
    canRetry: true,
  },
  UNSUPPORTED_FILE_TYPE: {
    title: 'Unsupported File Type',
    description: 'This file type is not supported. Please choose a different file.',
    canRetry: true,
  },
  
  // Rate limiting
  RATE_LIMIT_ERROR: {
    title: 'Too Many Requests',
    description: 'You\'ve made too many requests. Please wait a moment before trying again.',
    action: 'Try again in a few minutes',
    canRetry: true,
  },
  
  // Security errors
  SECURITY_ERROR: {
    title: 'Security Error',
    description: 'Your request was blocked for security reasons.',
    canRetry: false,
  },
  CSRF_ERROR: {
    title: 'Session Expired',
    description: 'Your session has expired. Please refresh the page and try again.',
    action: 'Refresh page',
    canRetry: true,
  },
  
  // Authentication
  AUTHENTICATION_ERROR: {
    title: 'Authentication Required',
    description: 'Please sign in to continue.',
    action: 'Sign in',
    canRetry: false,
  },
  UNAUTHORIZED: {
    title: 'Access Denied',
    description: 'You don\'t have permission to perform this action.',
    canRetry: false,
  },
  
  // Network errors
  NETWORK_ERROR: {
    title: 'Connection Error',
    description: 'Unable to connect to our servers. Please check your internet connection.',
    canRetry: true,
  },
  TIMEOUT: {
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    canRetry: true,
  },
  OFFLINE: {
    title: 'You\'re Offline',
    description: 'Please check your internet connection and try again.',
    canRetry: true,
  },
  
  // Server errors
  SERVER_ERROR: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later.',
    canRetry: true,
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Unavailable',
    description: 'This service is temporarily unavailable. Please try again later.',
    canRetry: true,
  },
  
  // Not found
  NOT_FOUND: {
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    canRetry: false,
  },
  
  // Generic fallback
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    canRetry: true,
  },
};

/**
 * Convert an error into a user-friendly message
 */
export function getUserFriendlyError(error: unknown): ErrorMessageConfig {
  // Handle AppError instances
  if (error instanceof AppError) {
    // Map specific error types to messages
    if (error instanceof ValidationError) {
      if (error.code && errorMessageMap[error.code]) {
        return errorMessageMap[error.code];
      }
      return errorMessageMap.VALIDATION_ERROR;
    }
    
    if (error instanceof RateLimitError) {
      return errorMessageMap.RATE_LIMIT_ERROR;
    }
    
    if (error instanceof SecurityError) {
      return errorMessageMap.SECURITY_ERROR;
    }
    
    if (error instanceof AuthenticationError) {
      return errorMessageMap.AUTHENTICATION_ERROR;
    }
    
    if (error instanceof NotFoundError) {
      return errorMessageMap.NOT_FOUND;
    }
    
    if (error instanceof ServerError) {
      return errorMessageMap.SERVER_ERROR;
    }
    
    if (error instanceof ExternalServiceError) {
      return errorMessageMap.NETWORK_ERROR;
    }
    
    // Override with specific error message if provided
    const baseConfig = errorMessageMap.UNKNOWN_ERROR;
    if (error.message) {
      return {
        title: baseConfig.title,
        description: error.message,
        action: baseConfig.action,
        canRetry: baseConfig.canRetry,
      };
    }
    
    return baseConfig;
  }
  
  // Handle native errors
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return errorMessageMap.NETWORK_ERROR;
    }
    
    // Timeout errors
    if (error.message.includes('timeout')) {
      return errorMessageMap.TIMEOUT;
    }
    
    // Parse errors
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return {
        title: 'Invalid Response',
        description: 'We received an invalid response from the server. Please try again.',
        canRetry: true,
      };
    }
  }
  
  // Handle HTTP status codes
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    
    switch (status) {
      case 400:
        return errorMessageMap.VALIDATION_ERROR;
      case 401:
        return errorMessageMap.AUTHENTICATION_ERROR;
      case 403:
        return errorMessageMap.UNAUTHORIZED;
      case 404:
        return errorMessageMap.NOT_FOUND;
      case 429:
        return errorMessageMap.RATE_LIMIT_ERROR;
      case 500:
      case 502:
      case 503:
        return errorMessageMap.SERVER_ERROR;
      case 504:
        return errorMessageMap.TIMEOUT;
      default:
        return errorMessageMap.UNKNOWN_ERROR;
    }
  }
  
  // Default fallback
  return errorMessageMap.UNKNOWN_ERROR;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): {
  message: string;
  code?: string;
  stack?: string;
  details?: any;
} {
  if (error instanceof AppError) {
    const logData: any = {
      message: error.message,
      stack: error.stack,
    };
    
    if (error instanceof ValidationError && error.code) {
      logData.code = error.code;
    }
    
    if (error instanceof RateLimitError && error.retryAfter) {
      logData.details = { retryAfter: error.retryAfter };
    }
    
    return logData;
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  
  return {
    message: String(error),
    details: error,
  };
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const userFriendlyError = getUserFriendlyError(error);
  return userFriendlyError.canRetry ?? false;
} 
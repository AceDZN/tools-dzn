import { useToastNotifications } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { AppError, ValidationError, RateLimitError, AuthenticationError } from '@/lib/errors/validation-error';

export function useErrorHandler() {
  const toast = useToastNotifications();

  const handleError = useCallback((error: unknown) => {
    console.error('Error caught:', error);

    // Handle AppError instances
    if (error instanceof AppError) {
      if (error instanceof ValidationError) {
        toast.error('Invalid Input', error.message);
        return;
      }

      if (error instanceof RateLimitError) {
        const retryMessage = error.retryAfter 
          ? `Try again in ${error.retryAfter} seconds` 
          : 'Please wait a moment before trying again';
        toast.warning('Too Many Requests', retryMessage);
        return;
      }

      if (error instanceof AuthenticationError) {
        toast.error('Authentication Required', 'Please sign in to continue');
        return;
      }

      // Generic app error
      toast.error('Error', error.message);
      return;
    }

    // Handle native errors
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        toast.error('Connection Error', 'Unable to connect. Please check your internet connection.');
        return;
      }

      // Generic error
      toast.error('Something went wrong', error.message);
      return;
    }

    // Unknown error
    toast.error('Something went wrong', 'An unexpected error occurred. Please try again.');
  }, [toast]);

  return { handleError };
}

// Hook for async operations with error handling
export function useAsyncError() {
  const { handleError } = useErrorHandler();

  const throwError = useCallback((error: unknown) => {
    handleError(error);
    throw error;
  }, [handleError]);

  return throwError;
} 
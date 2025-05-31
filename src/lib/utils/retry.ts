interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.shouldRetry(error, attempt)) {
        throw error;
      }

      // Call retry callback
      opts.onRetry(error, attempt);

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a retry function with preset options
 */
export function createRetryFunction(defaultOptions: RetryOptions) {
  return <T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> => {
    return retry(fn, { ...defaultOptions, ...options });
  };
}

/**
 * Check if an error is retryable based on common patterns
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors are usually retryable
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return true;
    }
  }

  // Check HTTP status codes
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408;
  }

  return false;
}

/**
 * Retry with specific strategies for different error types
 */
export const retryWithStrategy = createRetryFunction({
  maxAttempts: 3,
  initialDelay: 1000,
  shouldRetry: (error, attempt) => {
    // Don't retry on client errors (4xx except 429)
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as any).status;
      if (status >= 400 && status < 500 && status !== 429) {
        return false;
      }
    }

    return isRetryableError(error) && attempt < 3;
  },
  onRetry: (error, attempt) => {
    console.log(`Retry attempt ${attempt} after error:`, error);
  },
}); 
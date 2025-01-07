const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeout?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT,
    retryDelay = INITIAL_RETRY_DELAY,
    onRetry = () => {},
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeout);
      });

      const result = await Promise.race([operation(), timeoutPromise]);
      return result as T;
    } catch (error) {
      lastError = error;
      
      if (error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('capacity')) {
        onRetry(attempt, error);
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
        continue;
      }
      
      throw error;
    }
  }

  throw lastError;
}
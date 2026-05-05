const BASE_URL = 'https://api.freeapi.app/api/v1';
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface ApiError {
  message: string;
  code: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  statusCode?: number;
}

class ApiServiceError extends Error {
  code: string;
  isNetworkError: boolean;
  isTimeout: boolean;
  statusCode?: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiServiceError';
    this.code = error.code;
    this.isNetworkError = error.isNetworkError;
    this.isTimeout = error.isTimeout;
    this.statusCode = error.statusCode;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiServiceError({
        message: 'Request timeout - please check your connection',
        code: 'TIMEOUT',
        isNetworkError: false,
        isTimeout: true,
      });
    }
    throw error;
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status >= 500) {
          // Server errors - retry
          throw new ApiServiceError({
            message: `Server error (${response.status}) - retrying...`,
            code: 'SERVER_ERROR',
            isNetworkError: false,
            isTimeout: false,
            statusCode: response.status,
          });
        } else if (response.status === 429) {
          // Rate limit - retry with longer delay
          throw new ApiServiceError({
            message: 'Too many requests - please wait',
            code: 'RATE_LIMIT',
            isNetworkError: false,
            isTimeout: false,
            statusCode: response.status,
          });
        } else {
          // Client errors - don't retry
          throw new ApiServiceError({
            message: `Request failed with status ${response.status}`,
            code: 'HTTP_ERROR',
            isNetworkError: false,
            isTimeout: false,
            statusCode: response.status,
          });
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors or non-retryable errors
      if (error instanceof ApiServiceError) {
        if (error.statusCode && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // Network errors - retry
      if (error.message?.includes('Network request failed') || error.name === 'TypeError') {
        lastError = new ApiServiceError({
          message: 'Network error - please check your connection',
          code: 'NETWORK_ERROR',
          isNetworkError: true,
          isTimeout: false,
        });
      }

      // If we have retries left, wait and try again
      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
        await sleep(delay);
        continue;
      }

      // No more retries
      throw lastError;
    }
  }

  throw lastError;
}

export const apiService = {
  async getCourses(limit = 15) {
    try {
      const data = await fetchWithRetry<any>(
        `${BASE_URL}/public/randomproducts?limit=${limit}`
      );
      return data.data?.data || data.data || [];
    } catch (error) {
      console.error('getCourses error:', error);
      if (error instanceof ApiServiceError) {
        throw error;
      }
      throw new ApiServiceError({
        message: 'Failed to load courses',
        code: 'UNKNOWN_ERROR',
        isNetworkError: false,
        isTimeout: false,
      });
    }
  },

  async getInstructors() {
    try {
      const data = await fetchWithRetry<any>(
        `${BASE_URL}/public/randomusers?limit=10`
      );
      return data.data?.data || [];
    } catch (error) {
      console.error('getInstructors error:', error);
      if (error instanceof ApiServiceError) {
        throw error;
      }
      throw new ApiServiceError({
        message: 'Failed to load instructors',
        code: 'UNKNOWN_ERROR',
        isNetworkError: false,
        isTimeout: false,
      });
    }
  },
};

export { ApiServiceError };

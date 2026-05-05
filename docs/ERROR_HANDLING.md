# Error Handling Documentation

## Overview

The Learnify app implements comprehensive error handling for network requests, API failures, and WebView errors. This document describes the error handling architecture and how to use it.

## Architecture

### 1. API Error Handling (`src/lib/api.ts`)

The API service includes:

- **Timeout Handling**: 10-second timeout for all requests
- **Retry Mechanism**: Automatic retry with exponential backoff (up to 3 attempts)
- **Error Classification**: Distinguishes between network errors, timeouts, and HTTP errors
- **Custom Error Class**: `ApiServiceError` with detailed error information

#### Features:

```typescript
// Automatic retry with exponential backoff
- Initial delay: 1000ms
- Retry 1: 1000ms delay
- Retry 2: 2000ms delay
- Retry 3: 4000ms delay

// Error types:
- TIMEOUT: Request took too long
- NETWORK_ERROR: No internet connection
- RATE_LIMIT: Too many requests (429)
- SERVER_ERROR: Server issues (500+)
- HTTP_ERROR: Client errors (400-499)
```

#### Usage:

```typescript
import { apiService, ApiServiceError } from '../lib/api';

try {
  const courses = await apiService.getCourses();
} catch (error) {
  if (error instanceof ApiServiceError) {
    console.log(error.message);
    console.log(error.code);
    console.log(error.isNetworkError);
    console.log(error.isTimeout);
  }
}
```

### 2. Error Handler Utility (`src/lib/errorHandler.ts`)

Provides user-friendly error messages and handling:

#### Functions:

- **`getErrorInfo(error)`**: Converts errors to user-friendly information
- **`showErrorAlert(error, onRetry)`**: Shows native alert with retry option
- **`getErrorMessage(error)`**: Extracts user-friendly message

#### Usage:

```typescript
import { showErrorAlert, getErrorInfo } from '../lib/errorHandler';

try {
  await apiService.getCourses();
} catch (error) {
  // Show alert with retry button
  showErrorAlert(error, () => {
    // Retry logic
  });

  // Or get error info manually
  const errorInfo = getErrorInfo(error);
  console.log(errorInfo.title);
  console.log(errorInfo.message);
  console.log(errorInfo.isRetryable);
}
```

### 3. Error Display Component (`src/components/ErrorDisplay.tsx`)

Visual error display with two modes:

#### Full Screen Mode (default):

```typescript
<ErrorDisplay 
  error={error} 
  onRetry={() => loadData()} 
/>
```

Features:
- Large error icon
- Error title and message
- Retry button (if retryable)
- Centered layout

#### Compact Mode:

```typescript
<ErrorDisplay 
  error={error} 
  onRetry={() => loadData()} 
  compact={true}
/>
```

Features:
- Inline error banner
- Compact layout
- Small retry button

### 4. WebView Error Handling (`src/app/course/webview.tsx`)

Enhanced WebView error handling:

#### Features:

- **Error Detection**: Catches WebView load failures
- **Error Classification**: Identifies network, timeout, and HTTP errors
- **Retry Counter**: Tracks retry attempts
- **User-Friendly Messages**: Converts technical errors to readable messages
- **Graceful Fallback**: Shows error UI with retry option

#### Error Types Handled:

```typescript
// Network errors
- net::ERR_INTERNET_DISCONNECTED
- net::ERR_TIMED_OUT
- net::ERR_NAME_NOT_RESOLVED

// HTTP errors
- 400-499: Client errors
- 500+: Server errors
```

#### Implementation:

```typescript
const handleWebViewError = (event: WebViewErrorEvent) => {
  const { nativeEvent } = event;
  
  let errorMessage = 'Failed to load content';
  
  if (nativeEvent.description.includes('net::ERR_INTERNET_DISCONNECTED')) {
    errorMessage = 'No internet connection';
  } else if (nativeEvent.description.includes('net::ERR_TIMED_OUT')) {
    errorMessage = 'Request timed out';
  }
  
  setWebError(errorMessage);
};

<WebView
  onError={handleWebViewError}
  onHttpError={(event) => {
    if (event.nativeEvent.statusCode >= 400) {
      setWebError(`HTTP Error: ${event.nativeEvent.statusCode}`);
    }
  }}
/>
```

### 5. Offline Mode (`src/components/OfflineBanner.tsx`)

Interactive offline banner:

#### Features:

- Shows when device is offline
- Displays cached content notice
- Optional retry button
- Auto-checks connection before retry

#### Usage:

```typescript
import { OfflineBanner } from '../components/OfflineBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function MyScreen() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <>
      {!isOnline && <OfflineBanner onRetry={() => refresh()} />}
      {/* Rest of content */}
    </>
  );
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const courses = await apiService.getCourses();

// ✅ Good
try {
  const courses = await apiService.getCourses();
} catch (error) {
  showErrorAlert(error, () => loadCourses());
}
```

### 2. Show Cached Data During Errors

```typescript
// Load cached data first
const cached = await getCachedData();
if (cached) {
  setData(cached);
}

// Then try to fetch fresh data
try {
  const fresh = await apiService.getData();
  setData(fresh);
} catch (error) {
  // Keep showing cached data
  if (!cached) {
    setError(error);
  }
}
```

### 3. Provide Retry Options

```typescript
// Always provide retry for retryable errors
const errorInfo = getErrorInfo(error);
if (errorInfo.isRetryable) {
  <ErrorDisplay error={error} onRetry={() => loadData()} />
}
```

### 4. Use Appropriate Error Display

```typescript
// Full screen for critical errors
{error && !data && (
  <ErrorDisplay error={error} onRetry={retry} />
)}

// Compact for non-critical errors
{error && data && (
  <ErrorDisplay error={error} onRetry={retry} compact />
)}
```

## Error Messages

### Network Errors

| Error Code | User Message | Retryable |
|------------|-------------|-----------|
| TIMEOUT | Request timeout - please check your connection | Yes |
| NETWORK_ERROR | Unable to connect to the server | Yes |
| RATE_LIMIT | Too many requests - please wait | Yes |
| SERVER_ERROR | Server is experiencing issues | Yes |

### HTTP Errors

| Status Code | User Message | Retryable |
|-------------|-------------|-----------|
| 400-403 | Access denied or bad request | No |
| 404 | Resource not found | No |
| 429 | Too many requests | Yes |
| 500+ | Server error | Yes |

## Testing Error Handling

### 1. Test Network Errors

```typescript
// Disable network in device settings
// App should show offline banner and cached content

// Enable network and tap retry
// App should reload fresh data
```

### 2. Test Timeout

```typescript
// Use slow network (3G simulation)
// Requests should timeout after 10 seconds
// Retry should work correctly
```

### 3. Test WebView Errors

```typescript
// Load invalid URL in WebView
// Should show error UI with retry button

// Retry should reload the WebView
```

## Configuration

### Timeout Settings

```typescript
// src/lib/api.ts
const TIMEOUT_MS = 10000; // 10 seconds

// src/lib/apiClient.ts
const TIMEOUT_MS = 10_000; // 10 seconds
```

### Retry Settings

```typescript
// src/lib/api.ts
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Exponential backoff
```

## Troubleshooting

### Error Not Showing

1. Check if error is being caught
2. Verify error state is set
3. Ensure ErrorDisplay is rendered

### Retry Not Working

1. Check if onRetry callback is provided
2. Verify error is marked as retryable
3. Check network connection

### WebView Errors Not Caught

1. Verify onError handler is attached
2. Check onHttpError for HTTP errors
3. Ensure error state is updated

## Future Improvements

1. **Error Analytics**: Track error rates and types
2. **Offline Queue**: Queue failed requests for retry
3. **Smart Retry**: Adjust retry strategy based on error type
4. **Error Recovery**: Automatic recovery strategies
5. **User Feedback**: Allow users to report errors

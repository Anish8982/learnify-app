# Error Handling Quick Reference

## 🚀 Quick Start

### 1. Basic API Error Handling

```typescript
import { apiService, ApiServiceError } from '../lib/api';
import { showErrorAlert } from '../lib/errorHandler';

try {
  const data = await apiService.getCourses();
  // Use data
} catch (error) {
  showErrorAlert(error, () => {
    // Retry logic
    loadData();
  });
}
```

### 2. Display Error in UI

```typescript
import { ErrorDisplay } from '../components/ErrorDisplay';

function MyScreen() {
  const [error, setError] = useState(null);
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={loadData} />;
  }
  
  // Normal UI
}
```

### 3. Compact Error Banner

```typescript
{error && (
  <ErrorDisplay 
    error={error} 
    onRetry={loadData} 
    compact 
  />
)}
```

### 4. Offline Banner

```typescript
import { OfflineBanner } from '../components/OfflineBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function MyScreen() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <>
      {!isOnline && <OfflineBanner onRetry={refresh} />}
      {/* Content */}
    </>
  );
}
```

## 📋 Common Patterns

### Pattern 1: Load with Cache Fallback

```typescript
const [data, setData] = useState([]);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);

async function loadData() {
  setLoading(true);
  setError(null);
  
  // Show cache first
  const cached = await getCachedData();
  if (cached) {
    setData(cached);
    setLoading(false);
  }
  
  // Try to fetch fresh
  try {
    const fresh = await apiService.getData();
    setData(fresh);
    cacheData(fresh);
  } catch (err) {
    // Only show error if no cache
    if (!cached) {
      setError(err);
    }
  } finally {
    setLoading(false);
  }
}
```

### Pattern 2: Retry with Counter

```typescript
const [retryCount, setRetryCount] = useState(0);

async function loadData() {
  try {
    const data = await apiService.getData();
    setRetryCount(0); // Reset on success
  } catch (error) {
    setError(error);
  }
}

function handleRetry() {
  setRetryCount(prev => prev + 1);
  loadData();
}

// Show retry count
{error && (
  <View>
    <ErrorDisplay error={error} onRetry={handleRetry} />
    {retryCount > 0 && (
      <Text>Retry attempt: {retryCount}</Text>
    )}
  </View>
)}
```

### Pattern 3: WebView Error Handling

```typescript
import { WebView, WebViewErrorEvent } from 'react-native-webview';

const [webError, setWebError] = useState<string | null>(null);

const handleWebViewError = (event: WebViewErrorEvent) => {
  const { nativeEvent } = event;
  
  let errorMessage = 'Failed to load content';
  
  if (nativeEvent.description?.includes('net::ERR_INTERNET_DISCONNECTED')) {
    errorMessage = 'No internet connection';
  } else if (nativeEvent.description?.includes('net::ERR_TIMED_OUT')) {
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

## 🎯 Error Types

### Network Error
```typescript
const error = new ApiServiceError({
  message: 'Unable to connect',
  code: 'NETWORK_ERROR',
  isNetworkError: true,
  isTimeout: false,
});
```

### Timeout Error
```typescript
const error = new ApiServiceError({
  message: 'Request timeout',
  code: 'TIMEOUT',
  isNetworkError: false,
  isTimeout: true,
});
```

### Server Error
```typescript
const error = new ApiServiceError({
  message: 'Server error',
  code: 'SERVER_ERROR',
  isNetworkError: false,
  isTimeout: false,
  statusCode: 500,
});
```

## 🔧 Utility Functions

### Get Error Info
```typescript
import { getErrorInfo } from '../lib/errorHandler';

const errorInfo = getErrorInfo(error);
console.log(errorInfo.title);      // "Network Error"
console.log(errorInfo.message);    // "Unable to connect..."
console.log(errorInfo.isRetryable); // true
console.log(errorInfo.action);     // "Retry"
```

### Show Alert
```typescript
import { showErrorAlert } from '../lib/errorHandler';

showErrorAlert(error, () => {
  // Retry callback
  loadData();
});
```

### Get Message Only
```typescript
import { getErrorMessage } from '../lib/errorHandler';

const message = getErrorMessage(error);
// "Unable to connect to the server"
```

## 📱 Component Props

### ErrorDisplay

```typescript
interface ErrorDisplayProps {
  error: any;           // Error object
  onRetry?: () => void; // Optional retry callback
  compact?: boolean;    // Compact mode (default: false)
}
```

### OfflineBanner

```typescript
interface OfflineBannerProps {
  onRetry?: () => void; // Optional retry callback
}
```

## ⚙️ Configuration

### API Settings (src/lib/api.ts)
```typescript
const TIMEOUT_MS = 10000;        // 10 seconds
const MAX_RETRIES = 3;           // 3 retry attempts
const RETRY_DELAY_MS = 1000;     // Base delay (exponential)
```

### Retryable Status Codes
```typescript
[408, 429, 500, 502, 503, 504]
```

## 🧪 Testing

### Test Network Error
```typescript
// Turn off WiFi/mobile data
// App should show offline banner
// Cached content should still display
```

### Test Timeout
```typescript
// Use slow network (3G simulation)
// Request should timeout after 10s
// Retry should work
```

### Test Retry
```typescript
// Trigger error
// Click retry button
// Should attempt to reload
```

## 💡 Tips

1. **Always provide retry for retryable errors**
   ```typescript
   const errorInfo = getErrorInfo(error);
   if (errorInfo.isRetryable) {
     <ErrorDisplay error={error} onRetry={retry} />
   }
   ```

2. **Show cached data during errors**
   ```typescript
   // Keep showing cached data even if refresh fails
   if (cachedData.length > 0) {
     // Show compact error banner
     <ErrorDisplay error={error} onRetry={retry} compact />
   } else {
     // Show full screen error
     <ErrorDisplay error={error} onRetry={retry} />
   }
   ```

3. **Use appropriate error display mode**
   - Full screen: Critical errors, no data available
   - Compact: Non-critical errors, data still available

4. **Handle errors at the right level**
   - API level: Retry, timeout, network detection
   - Hook level: Error state management, caching
   - Component level: Error display, user interaction

## 📚 Related Files

- `src/lib/api.ts` - API service with retry
- `src/lib/apiClient.ts` - Axios client with interceptors
- `src/lib/errorHandler.ts` - Error utilities
- `src/components/ErrorDisplay.tsx` - Error UI component
- `src/components/OfflineBanner.tsx` - Offline banner
- `src/hooks/useCourses.ts` - Example hook with error handling
- `src/app/(tabs)/home.tsx` - Example screen with error handling
- `src/app/course/webview.tsx` - WebView error handling

## 🆘 Troubleshooting

**Error not showing?**
- Check if error state is set
- Verify ErrorDisplay is rendered
- Check error object structure

**Retry not working?**
- Ensure onRetry callback is provided
- Check if error is retryable
- Verify network connection

**WebView errors not caught?**
- Add onError handler
- Add onHttpError handler
- Check error state updates

**Infinite retry loop?**
- Check retry counter
- Verify error is actually retryable
- Add max retry limit

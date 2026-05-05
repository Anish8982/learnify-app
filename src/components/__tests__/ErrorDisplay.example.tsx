/**
 * ErrorDisplay Component Examples
 * 
 * This file demonstrates various error scenarios and how they are displayed.
 * Use this as a reference for implementing error handling in your screens.
 */

import React from 'react';
import { View } from 'react-native';
import { ApiServiceError } from '../../lib/api';
import { ErrorDisplay } from '../ErrorDisplay';

// Example 1: Network Error (Full Screen)
export function NetworkErrorExample() {
    const error = new ApiServiceError({
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
        isTimeout: false,
    });

    return (
        <ErrorDisplay
            error={error}
            onRetry={() => console.log('Retrying...')}
        />
    );
}

// Example 2: Timeout Error (Full Screen)
export function TimeoutErrorExample() {
    const error = new ApiServiceError({
        message: 'The request took too long. Please check your internet connection and try again.',
        code: 'TIMEOUT',
        isNetworkError: false,
        isTimeout: true,
    });

    return (
        <ErrorDisplay
            error={error}
            onRetry={() => console.log('Retrying...')}
        />
    );
}

// Example 3: Server Error (Full Screen)
export function ServerErrorExample() {
    const error = new ApiServiceError({
        message: 'The server is experiencing issues. Please try again later.',
        code: 'SERVER_ERROR',
        isNetworkError: false,
        isTimeout: false,
        statusCode: 500,
    });

    return (
        <ErrorDisplay
            error={error}
            onRetry={() => console.log('Retrying...')}
        />
    );
}

// Example 4: Rate Limit Error (Full Screen)
export function RateLimitErrorExample() {
    const error = new ApiServiceError({
        message: 'You\'ve made too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
        isNetworkError: false,
        isTimeout: false,
        statusCode: 429,
    });

    return (
        <ErrorDisplay
            error={error}
            onRetry={() => console.log('Retrying...')}
        />
    );
}

// Example 5: Not Found Error (Full Screen, No Retry)
export function NotFoundErrorExample() {
    const error = new ApiServiceError({
        message: 'The requested resource was not found.',
        code: 'HTTP_ERROR',
        isNetworkError: false,
        isTimeout: false,
        statusCode: 404,
    });

    return (
        <ErrorDisplay
            error={error}
        // No onRetry - not retryable
        />
    );
}

// Example 6: Network Error (Compact)
export function NetworkErrorCompactExample() {
    const error = new ApiServiceError({
        message: 'Unable to connect. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
        isTimeout: false,
    });

    return (
        <View style={{ padding: 16 }}>
            <ErrorDisplay
                error={error}
                onRetry={() => console.log('Retrying...')}
                compact
            />
        </View>
    );
}

// Example 7: Generic Error
export function GenericErrorExample() {
    const error = new Error('Something went wrong');

    return (
        <ErrorDisplay
            error={error}
            onRetry={() => console.log('Retrying...')}
        />
    );
}

// Example 8: Multiple Errors in List
export function ErrorListExample() {
    const errors = [
        new ApiServiceError({
            message: 'Network error',
            code: 'NETWORK_ERROR',
            isNetworkError: true,
            isTimeout: false,
        }),
        new ApiServiceError({
            message: 'Timeout error',
            code: 'TIMEOUT',
            isNetworkError: false,
            isTimeout: true,
        }),
        new ApiServiceError({
            message: 'Server error',
            code: 'SERVER_ERROR',
            isNetworkError: false,
            isTimeout: false,
            statusCode: 500,
        }),
    ];

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {errors.map((error, index) => (
                <ErrorDisplay
                    key={index}
                    error={error}
                    onRetry={() => console.log(`Retrying error ${index}...`)}
                    compact
                />
            ))}
        </View>
    );
}

/**
 * Usage in your screens:
 * 
 * 1. Import the component:
 *    import { ErrorDisplay } from '../components/ErrorDisplay';
 * 
 * 2. Use in your render:
 *    {error && <ErrorDisplay error={error} onRetry={retry} />}
 * 
 * 3. For compact mode:
 *    {error && <ErrorDisplay error={error} onRetry={retry} compact />}
 * 
 * 4. Without retry (non-retryable errors):
 *    {error && <ErrorDisplay error={error} />}
 */

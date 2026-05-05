import { Alert } from 'react-native';
import { ApiServiceError } from './api';

export interface ErrorInfo {
    title: string;
    message: string;
    action?: string;
    isRetryable: boolean;
}

export function getErrorInfo(error: any): ErrorInfo {
    // Handle ApiServiceError
    if (error instanceof ApiServiceError) {
        if (error.isTimeout) {
            return {
                title: 'Request Timeout',
                message: 'The request took too long. Please check your internet connection and try again.',
                action: 'Retry',
                isRetryable: true,
            };
        }

        if (error.isNetworkError) {
            return {
                title: 'Network Error',
                message: 'Unable to connect to the server. Please check your internet connection.',
                action: 'Retry',
                isRetryable: true,
            };
        }

        if (error.code === 'RATE_LIMIT') {
            return {
                title: 'Too Many Requests',
                message: 'You\'ve made too many requests. Please wait a moment and try again.',
                action: 'Retry',
                isRetryable: true,
            };
        }

        if (error.code === 'SERVER_ERROR') {
            return {
                title: 'Server Error',
                message: 'The server is experiencing issues. Please try again later.',
                action: 'Retry',
                isRetryable: true,
            };
        }

        if (error.statusCode === 404) {
            return {
                title: 'Not Found',
                message: 'The requested resource was not found.',
                isRetryable: false,
            };
        }

        if (error.statusCode === 401 || error.statusCode === 403) {
            return {
                title: 'Access Denied',
                message: 'You don\'t have permission to access this resource.',
                isRetryable: false,
            };
        }
    }

    // Handle generic errors
    if (error?.message?.includes('Network request failed')) {
        return {
            title: 'Network Error',
            message: 'Unable to connect. Please check your internet connection.',
            action: 'Retry',
            isRetryable: true,
        };
    }

    // Default error
    return {
        title: 'Something Went Wrong',
        message: error?.message || 'An unexpected error occurred. Please try again.',
        action: 'Retry',
        isRetryable: true,
    };
}

export function showErrorAlert(error: any, onRetry?: () => void) {
    const errorInfo = getErrorInfo(error);

    const buttons: any[] = [
        { text: 'Cancel', style: 'cancel' },
    ];

    if (errorInfo.isRetryable && onRetry) {
        buttons.push({
            text: errorInfo.action || 'Retry',
            onPress: onRetry,
        });
    }

    Alert.alert(errorInfo.title, errorInfo.message, buttons);
}

export function getErrorMessage(error: any): string {
    const errorInfo = getErrorInfo(error);
    return errorInfo.message;
}

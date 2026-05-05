import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { getErrorInfo } from '../lib/errorHandler';

interface ErrorDisplayProps {
    error: any;
    onRetry?: () => void;
    compact?: boolean;
}

export function ErrorDisplay({ error, onRetry, compact = false }: ErrorDisplayProps) {
    const c = useThemeColors();
    const errorInfo = getErrorInfo(error);

    if (compact) {
        return (
            <View
                style={{
                    backgroundColor: '#fef2f2',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                }}
            >
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={{ flex: 1, color: '#991b1b', fontSize: 13 }}>
                    {errorInfo.message}
                </Text>
                {errorInfo.isRetryable && onRetry && (
                    <TouchableOpacity
                        onPress={onRetry}
                        style={{
                            backgroundColor: '#ef4444',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                            {errorInfo.action || 'Retry'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 32,
                backgroundColor: c.bg,
            }}
        >
            <View
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: '#fef2f2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                }}
            >
                <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
            </View>

            <Text
                style={{
                    color: c.textPrimary,
                    fontSize: 20,
                    fontWeight: '700',
                    textAlign: 'center',
                    marginBottom: 8,
                }}
            >
                {errorInfo.title}
            </Text>

            <Text
                style={{
                    color: c.textMuted,
                    fontSize: 14,
                    textAlign: 'center',
                    lineHeight: 20,
                    marginBottom: 24,
                }}
            >
                {errorInfo.message}
            </Text>

            {errorInfo.isRetryable && onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    style={{
                        backgroundColor: '#6366f1',
                        paddingHorizontal: 32,
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <Ionicons name="refresh-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                        {errorInfo.action || 'Try Again'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

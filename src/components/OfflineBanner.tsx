import { Ionicons } from '@expo/vector-icons';
import React, { memo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface OfflineBannerProps {
    onRetry?: () => void;
}

// Lightweight connectivity check
async function checkConnectivity(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://www.google.com', {
            method: 'HEAD',
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return res.ok;
    } catch {
        return false;
    }
}

function OfflineBannerComponent({ onRetry }: OfflineBannerProps) {
    const [checking, setChecking] = useState(false);

    const handleRetry = async () => {
        if (!onRetry) return;

        setChecking(true);
        const isConnected = await checkConnectivity();
        setChecking(false);

        if (isConnected) {
            onRetry();
        }
    };

    return (
        <View className="flex-row items-center justify-center bg-red-500 px-4 py-2.5 gap-2">
            <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
            <Text className="text-white text-xs font-semibold flex-1">
                You are offline — showing cached content
            </Text>
            {onRetry && (
                <TouchableOpacity
                    onPress={handleRetry}
                    disabled={checking}
                    className="bg-white/20 px-3 py-1 rounded-md"
                >
                    {checking ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className="text-white text-xs font-semibold">Retry</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

export const OfflineBanner = memo(OfflineBannerComponent);

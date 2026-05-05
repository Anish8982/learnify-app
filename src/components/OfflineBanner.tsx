import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface OfflineBannerProps {
    onRetry?: () => void;
}

function OfflineBannerComponent({ onRetry }: OfflineBannerProps) {
    const handleRetry = async () => {
        const state = await NetInfo.fetch();
        if (state.isConnected && onRetry) {
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
                    className="bg-white/20 px-3 py-1 rounded-md"
                >
                    <Text className="text-white text-xs font-semibold">Retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export const OfflineBanner = memo(OfflineBannerComponent);

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Text, View } from 'react-native';

function OfflineBannerComponent() {
    return (
        <View className="flex-row items-center justify-center bg-red-500 px-4 py-2 gap-2">
            <Ionicons name="cloud-offline-outline" size={15} color="#fff" />
            <Text className="text-white text-xs font-semibold">
                You are offline — showing cached content
            </Text>
        </View>
    );
}

export const OfflineBanner = memo(OfflineBannerComponent);

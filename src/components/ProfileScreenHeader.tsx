import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';

interface Props {
    title: string;
    subtitle?: string;
}

export function ProfileScreenHeader({ title, subtitle }: Props) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const c = useThemeColors();

    return (
        <View style={{ paddingTop: insets.top + 8, backgroundColor: c.bgCard, borderBottomWidth: 1, borderBottomColor: c.borderLight, paddingHorizontal: 16, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color={c.iconColor} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: c.textPrimary }}>{title}</Text>
                    {subtitle && <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{subtitle}</Text>}
                </View>
            </View>
        </View>
    );
}

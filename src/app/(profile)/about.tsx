import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const LINKS = [
    { icon: 'document-text-outline', label: 'Terms of Service', color: '#6366f1', url: 'https://learnify.app/terms' },
    { icon: 'shield-outline', label: 'Privacy Policy', color: '#8b5cf6', url: 'https://learnify.app/privacy' },
    { icon: 'code-slash-outline', label: 'Open Source Licenses', color: '#06b6d4', url: '' },
    { icon: 'globe-outline', label: 'Visit Website', color: '#10b981', url: 'https://learnify.app' },
];
const TECH_STACK = ['React Native', 'Expo', 'Firebase', 'NativeWind', 'TypeScript'];

export default function AboutScreen() {
    const c = useThemeColors();

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="About" />
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#0f172a', '#1e1b4b']} style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Ionicons name="school" size={38} color="#818cf8" />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>Learnify</Text>
                    <Text style={{ color: '#a5b4fc', fontSize: 13, marginTop: 4 }}>Version 1.0.0 (Build 1)</Text>
                    <Text style={{ color: 'rgba(165,180,252,0.5)', fontSize: 12, marginTop: 4 }}>© 2025 Learnify. All rights reserved.</Text>
                </LinearGradient>

                <View style={{ padding: 16 }}>
                    <View style={{ backgroundColor: c.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: c.borderLight, marginBottom: 20 }}>
                        <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>Our Mission</Text>
                        <Text style={{ color: c.textSecondary, fontSize: 14, lineHeight: 22 }}>
                            Learnify is built to make quality education accessible to everyone. We partner with expert instructors to bring you courses across technology, design, business, and more — so you can upgrade your skills at your own pace, anytime, anywhere.
                        </Text>
                    </View>

                    <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Legal & Info</Text>
                    <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, marginBottom: 20 }}>
                        {LINKS.map((link, index) => (
                            <TouchableOpacity key={link.label} onPress={() => link.url && Linking.openURL(link.url)} activeOpacity={0.7}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: index < LINKS.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}
                            >
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: link.color + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Ionicons name={link.icon as any} size={18} color={link.color} />
                                </View>
                                <Text style={{ flex: 1, color: c.textPrimary, fontWeight: '500', fontSize: 14 }}>{link.label}</Text>
                                <Ionicons name="open-outline" size={15} color={c.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Built With</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {TECH_STACK.map(tech => (
                            <View key={tech} style={{ backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#e0e7ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                                <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>{tech}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity activeOpacity={0.8} style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fef3c7', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="star" size={20} color="#f59e0b" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 14 }}>Rate Learnify</Text>
                            <Text style={{ color: '#b45309', fontSize: 12, marginTop: 2 }}>Enjoying the app? Leave us a review!</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#fcd34d" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

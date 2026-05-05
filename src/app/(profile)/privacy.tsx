import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const PRIVACY_TOGGLES = [
    { id: 'public_profile', label: 'Public Profile', description: 'Allow others to see your profile', value: true },
    { id: 'show_progress', label: 'Show Progress', description: 'Display your course progress publicly', value: false },
    { id: 'show_certs', label: 'Show Certificates', description: 'Make your certificates visible', value: true },
    { id: 'analytics', label: 'Usage Analytics', description: 'Help improve Learnify with anonymous data', value: true },
];

const SECURITY_ITEMS = [
    { icon: 'key-outline', label: 'Change Password', color: '#6366f1' },
    { icon: 'shield-checkmark-outline', label: 'Two-Factor Authentication', color: '#10b981' },
    { icon: 'phone-portrait-outline', label: 'Active Sessions', color: '#f59e0b' },
];

export default function PrivacyScreen() {
    const [toggles, setToggles] = useState(PRIVACY_TOGGLES);
    const c = useThemeColors();
    const toggle = (id: string) => setToggles(prev => prev.map(t => t.id === id ? { ...t, value: !t.value } : t));

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="Privacy & Security" />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Privacy</Text>
                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, marginBottom: 20 }}>
                    {toggles.map((item, index) => (
                        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: index < toggles.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}>
                            <View style={{ flex: 1, paddingRight: 16 }}>
                                <Text style={{ color: c.textPrimary, fontWeight: '600', fontSize: 14 }}>{item.label}</Text>
                                <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>{item.description}</Text>
                            </View>
                            <Switch value={item.value} onValueChange={() => toggle(item.id)} trackColor={{ false: c.border, true: '#6366f1' }} thumbColor="#ffffff" />
                        </View>
                    ))}
                </View>

                <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Security</Text>
                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, marginBottom: 20 }}>
                    {SECURITY_ITEMS.map((item, index) => (
                        <TouchableOpacity key={item.label} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: index < SECURITY_ITEMS.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <Ionicons name={item.icon as any} size={18} color={item.color} />
                            </View>
                            <Text style={{ flex: 1, color: c.textPrimary, fontWeight: '500', fontSize: 14 }}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Danger Zone</Text>
                <TouchableOpacity onPress={() => Alert.alert('Delete Account', 'This will permanently delete your account and all data. This action cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { } }])}
                    activeOpacity={0.8} style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>Delete Account</Text>
                        <Text style={{ color: '#fca5a5', fontSize: 12, marginTop: 2 }}>Permanently remove your account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#fca5a5" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

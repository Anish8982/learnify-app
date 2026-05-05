import React, { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NotifSetting { id: string; label: string; description: string; value: boolean; }

const INITIAL: NotifSetting[] = [
    { id: 'new_course', label: 'New Courses', description: 'Get notified when new courses are added', value: true },
    { id: 'course_update', label: 'Course Updates', description: 'Updates to courses you are enrolled in', value: true },
    { id: 'reminders', label: 'Learning Reminders', description: 'Daily reminders to keep your streak', value: false },
    { id: 'promotions', label: 'Promotions & Offers', description: 'Discounts and special deals', value: false },
    { id: 'achievements', label: 'Achievements', description: 'When you earn badges or certificates', value: true },
    { id: 'messages', label: 'Instructor Messages', description: 'Messages from your instructors', value: true },
    { id: 'newsletter', label: 'Newsletter', description: 'Weekly learning tips and news', value: false },
];

export default function NotificationsScreen() {
    const [settings, setSettings] = useState<NotifSetting[]>(INITIAL);
    const c = useThemeColors();
    const toggle = (id: string) => setSettings(prev => prev.map(s => s.id === id ? { ...s, value: !s.value } : s));
    const enabledCount = settings.filter(s => s.value).length;

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="Notifications" subtitle={`${enabledCount} of ${settings.length} enabled`} />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight }}>
                    {settings.map((setting, index) => (
                        <View key={setting.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: index < settings.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}>
                            <View style={{ flex: 1, paddingRight: 16 }}>
                                <Text style={{ color: c.textPrimary, fontWeight: '600', fontSize: 14 }}>{setting.label}</Text>
                                <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>{setting.description}</Text>
                            </View>
                            <Switch value={setting.value} onValueChange={() => toggle(setting.id)} trackColor={{ false: c.border, true: '#6366f1' }} thumbColor="#ffffff" />
                        </View>
                    ))}
                </View>
                <Text style={{ color: c.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16, paddingHorizontal: 16 }}>
                    You can manage push notification permissions in your device settings.
                </Text>
            </ScrollView>
        </View>
    );
}

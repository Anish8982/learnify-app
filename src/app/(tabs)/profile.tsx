import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { bookmarkStorage } from '../../lib/bookmarkStorage';
import { drawerEvents } from '../../lib/drawerEvents';
import { enrollStorage } from '../../lib/enrollStorage';
import { useAuth } from '../../providers/AuthProvider';

const MENU_ITEMS = [
    {
        section: 'Learning', items: [
            { icon: 'play-circle-outline', label: 'My Courses', color: '#6366f1', route: '/(profile)/my-courses' },
            { icon: 'ribbon-outline', label: 'Certificates', color: '#8b5cf6', route: '/(profile)/certificates' },
            { icon: 'bar-chart-outline', label: 'Progress', color: '#06b6d4', route: '/(profile)/progress' },
        ]
    },
    {
        section: 'Account', items: [
            { icon: 'person-outline', label: 'Edit Profile', color: '#10b981', route: '/(profile)/edit-profile' },
            { icon: 'notifications-outline', label: 'Notifications', color: '#f59e0b', route: '/(profile)/notifications' },
            { icon: 'lock-closed-outline', label: 'Privacy & Security', color: '#ef4444', route: '/(profile)/privacy' },
        ]
    },
    {
        section: 'Support', items: [
            { icon: 'help-circle-outline', label: 'Help & FAQ', color: '#64748b', route: '/(profile)/help' },
            { icon: 'information-circle-outline', label: 'About', color: '#64748b', route: '/(profile)/about' },
        ]
    },
];

export default function ProfileScreen() {
    const { user, logout, localAvatar, refreshAvatar } = useAuth();
    const router = useRouter();
    const c = useThemeColors();
    const [enrolledCount, setEnrolledCount] = useState(0);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [avatarKey, setAvatarKey] = useState(0);

    // Refresh avatar when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshAvatar();
            setAvatarKey(prev => prev + 1); // Force image re-render
        }, [refreshAvatar])
    );

    useEffect(() => {
        const loadStats = async () => {
            const [enrolled, bookmarks] = await Promise.all([
                enrollStorage.getCount(),
                bookmarkStorage.getAll(),
            ]);
            setEnrolledCount(enrolled);
            setBookmarkCount(bookmarks.size);
        };
        loadStats();
    }, []);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                        // Navigation is handled automatically by (tabs)/_layout.tsx
                        // which redirects to /(auth)/login when user becomes null
                    } catch (error) {
                        Alert.alert('Error', 'Failed to log out. Please try again.');
                    }
                },
            },
        ]);
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    return (
        <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#0f172a', '#1e1b4b']} style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 }}>
                <TouchableOpacity onPress={() => drawerEvents.open()} style={{ alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="menu" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(165,180,252,0.3)', overflow: 'hidden' }}>
                        {localAvatar ? (
                            <Image
                                key={avatarKey}
                                source={{ uri: localAvatar }}
                                style={{ width: 96, height: 96 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>{initials}</Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(profile)/edit-profile' as any)} style={{ marginTop: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' }}>{user?.name || 'Learner'}</Text>
                <Text style={{ color: '#a5b4fc', fontSize: 13, textAlign: 'center', marginTop: 4 }}>{user?.email}</Text>
                <View style={{ flexDirection: 'row', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    {[
                        { value: enrolledCount, label: 'Enrolled', route: '/(profile)/my-courses' },
                        { value: bookmarkCount, label: 'Saved', route: '/(profile)/certificates' },
                        { value: 2, label: 'Certs', route: '/(profile)/certificates' },
                    ].map((stat, i, arr) => (
                        <TouchableOpacity key={stat.label} onPress={() => router.push(stat.route as any)} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.08)' }}>
                            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{stat.value}</Text>
                            <Text style={{ color: '#a5b4fc', fontSize: 11, marginTop: 2 }}>{stat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
                {MENU_ITEMS.map((section) => (
                    <View key={section.section} style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>{section.section}</Text>
                        <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight }}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity key={item.label} onPress={() => router.push(item.route as any)} activeOpacity={0.7}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: index < section.items.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}
                                >
                                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color + '18', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text style={{ flex: 1, color: c.textPrimary, fontWeight: '500' }}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
                <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', borderRadius: 16, paddingVertical: 16, marginTop: 8, gap: 8 }}
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text style={{ color: '#ef4444', fontWeight: '600' }}>Log Out</Text>
                </TouchableOpacity>
                <Text style={{ textAlign: 'center', color: c.textMuted, fontSize: 11, marginTop: 24 }}>Learnify v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

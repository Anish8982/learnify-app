import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

interface Props {
    onClose: () => void;
}

const QUICK_LINKS = [
    { icon: 'play-circle-outline', label: 'My Courses', color: '#6366f1' },
    { icon: 'ribbon-outline', label: 'Certificates', color: '#8b5cf6' },
    { icon: 'bar-chart-outline', label: 'Progress', color: '#06b6d4' },
    { icon: 'notifications-outline', label: 'Notifications', color: '#f59e0b' },
    { icon: 'help-circle-outline', label: 'Help & FAQ', color: '#10b981' },
    { icon: 'star-outline', label: 'Rate the App', color: '#f59e0b' },
];

export function CustomDrawer({ onClose }: Props) {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { localAvatar } = useAuth();

    const bg = isDark ? '#0f172a' : '#ffffff';
    const cardBg = isDark ? '#1e293b' : '#f8fafc';
    const border = isDark ? '#1e293b' : '#f1f5f9';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const itemBg = isDark ? '#0f172a' : '#ffffff';
    const itemBorder = isDark ? '#1e293b' : '#f1f5f9';

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleLogout = () => {
        onClose();
        setTimeout(() => {
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]);
        }, 300);
    };

    return (
        <View style={{ flex: 1, backgroundColor: bg }}>
            {/* Gradient header */}
            <LinearGradient
                colors={['#0f172a', '#1e1b4b']}
                style={{ paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 20 }}
            >
                {/* Close button */}
                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        alignSelf: 'flex-end',
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                    }}
                >
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Avatar + user info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: '#6366f1',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: 'rgba(165,180,252,0.4)',
                            overflow: 'hidden',
                        }}
                    >
                        {localAvatar ? (
                            <Image source={{ uri: localAvatar }} style={{ width: 56, height: 56 }} resizeMode="cover" />
                        ) : (
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{initials}</Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }} numberOfLines={1}>
                            {user?.name || 'Learner'}
                        </Text>
                        <Text style={{ color: '#a5b4fc', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                            {user?.email}
                        </Text>
                    </View>
                </View>

                {/* Mini stats */}
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 18,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                    }}
                >
                    {[
                        { value: user?.enrolledCourses ?? 0, label: 'Enrolled' },
                        { value: `${user?.progress ?? 0}%`, label: 'Progress' },
                        { value: 0, label: 'Certs' },
                    ].map((stat, i, arr) => (
                        <View
                            key={stat.label}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 12,
                                borderRightWidth: i < arr.length - 1 ? 1 : 0,
                                borderRightColor: 'rgba(255,255,255,0.08)',
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                                {stat.value}
                            </Text>
                            <Text style={{ color: '#a5b4fc', fontSize: 11, marginTop: 2 }}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, backgroundColor: bg }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Dark Mode Toggle — hero item */}
                <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            marginBottom: 8,
                            marginLeft: 4,
                        }}
                    >
                        Appearance
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: border,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                        }}
                    >
                        <View
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}
                        >
                            <Ionicons
                                name={isDark ? 'moon' : 'sunny-outline'}
                                size={20}
                                color="#6366f1"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: textPrimary, fontWeight: '600', fontSize: 15 }}>
                                Dark Mode
                            </Text>
                            <Text style={{ color: textSecondary, fontSize: 12, marginTop: 1 }}>
                                {isDark ? 'Currently on' : 'Currently off'}
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                            thumbColor="#ffffff"
                        />
                    </View>
                </View>

                {/* Quick Links */}
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            marginBottom: 8,
                            marginLeft: 4,
                        }}
                    >
                        Quick Access
                    </Text>
                    <View
                        style={{
                            backgroundColor: itemBg,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: itemBorder,
                            overflow: 'hidden',
                        }}
                    >
                        {QUICK_LINKS.map((item, index) => (
                            <TouchableOpacity
                                key={item.label}
                                onPress={onClose}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                    borderBottomWidth: index < QUICK_LINKS.length - 1 ? 1 : 0,
                                    borderBottomColor: itemBorder,
                                }}
                            >
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: item.color + '18',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}
                                >
                                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                                </View>
                                <Text style={{ flex: 1, color: textPrimary, fontWeight: '500', fontSize: 14 }}>
                                    {item.label}
                                </Text>
                                <Ionicons name="chevron-forward" size={15} color={textSecondary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout */}
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(239,68,68,0.08)',
                            borderWidth: 1,
                            borderColor: 'rgba(239,68,68,0.15)',
                            borderRadius: 16,
                            paddingVertical: 14,
                            gap: 8,
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 15 }}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <Text
                    style={{
                        textAlign: 'center',
                        color: textSecondary,
                        fontSize: 11,
                        marginTop: 24,
                    }}
                >
                    Learnify v1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuth } from '../../providers/AuthProvider';

const WEEKLY_DATA = [
    { day: 'Mon', minutes: 45 }, { day: 'Tue', minutes: 80 }, { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 110 }, { day: 'Fri', minutes: 60 }, { day: 'Sat', minutes: 90 }, { day: 'Sun', minutes: 20 },
];
const COURSE_PROGRESS = [
    { title: 'React Native Developer', progress: 68, color: '#6366f1' },
    { title: 'Node.js Complete Guide', progress: 34, color: '#06b6d4' },
    { title: 'UI/UX Design Masterclass', progress: 100, color: '#10b981' },
    { title: 'Python for Data Science', progress: 100, color: '#f59e0b' },
];
const STATS = [
    { icon: 'time-outline', label: 'Hours Learned', value: '47h', color: '#6366f1' },
    { icon: 'flame-outline', label: 'Day Streak', value: '12', color: '#f59e0b' },
    { icon: 'checkmark-circle-outline', label: 'Lessons Done', value: '138', color: '#10b981' },
    { icon: 'trophy-outline', label: 'Achievements', value: '8', color: '#8b5cf6' },
];
const maxMinutes = Math.max(...WEEKLY_DATA.map(d => d.minutes));

export default function ProgressScreen() {
    const { user } = useAuth();
    const c = useThemeColors();

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="My Progress" subtitle="Track your learning journey" />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={{ borderRadius: 24, padding: 20, marginBottom: 20 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>Overall Progress</Text>
                    <Text style={{ color: '#fff', fontSize: 40, fontWeight: '700' }}>{user?.progress ?? 65}%</Text>
                    <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
                        <View style={{ height: '100%', backgroundColor: '#fff', borderRadius: 4, width: `${user?.progress ?? 65}%` }} />
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>{user?.enrolledCourses ?? 4} courses enrolled · 2 completed</Text>
                </LinearGradient>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                    {STATS.map(stat => (
                        <View key={stat.label} style={{ backgroundColor: c.bgCard, borderRadius: 16, padding: 16, width: '47%', borderWidth: 1, borderColor: c.borderLight, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: stat.color + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                            </View>
                            <Text style={{ color: c.textPrimary, fontSize: 24, fontWeight: '700' }}>{stat.value}</Text>
                            <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: c.borderLight }}>
                    <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 16 }}>This Week</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 }}>
                        {WEEKLY_DATA.map(d => {
                            const barHeight = (d.minutes / maxMinutes) * 80;
                            const isToday = d.day === 'Thu';
                            return (
                                <View key={d.day} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
                                    <View style={{ height: barHeight, width: 24, borderRadius: 6, backgroundColor: isToday ? '#6366f1' : c.bgSecondary }} />
                                    <Text style={{ fontSize: 11, color: isToday ? '#6366f1' : c.textMuted, fontWeight: isToday ? '700' : '400' }}>{d.day}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 12, textAlign: 'center' }}>Total this week: {WEEKLY_DATA.reduce((a, b) => a + b.minutes, 0)} minutes</Text>
                </View>

                <View style={{ backgroundColor: c.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: c.borderLight }}>
                    <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 16 }}>Course Breakdown</Text>
                    {COURSE_PROGRESS.map((course, i) => (
                        <View key={i} style={{ marginBottom: i < COURSE_PROGRESS.length - 1 ? 16 : 0 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '500', flex: 1, paddingRight: 8 }} numberOfLines={1}>{course.title}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: course.color }}>{course.progress}%</Text>
                            </View>
                            <View style={{ height: 8, backgroundColor: c.bgSecondary, borderRadius: 4, overflow: 'hidden' }}>
                                <View style={{ height: '100%', borderRadius: 4, backgroundColor: course.color, width: `${course.progress}%` }} />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

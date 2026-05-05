import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';

const TABS = ['All', 'In Progress', 'Completed'];
const MOCK_COURSES = [
    { id: 1, title: 'The Complete React Native Developer', instructor: 'Andrew Mead', thumbnail: 'https://picsum.photos/seed/rn1/400/300', progress: 68, status: 'In Progress', duration: '32h' },
    { id: 2, title: 'UI/UX Design Masterclass', instructor: 'Sara Johnson', thumbnail: 'https://picsum.photos/seed/ux2/400/300', progress: 100, status: 'Completed', duration: '18h' },
    { id: 3, title: 'Node.js — The Complete Guide', instructor: 'Maximilian S.', thumbnail: 'https://picsum.photos/seed/node3/400/300', progress: 34, status: 'In Progress', duration: '40h' },
    { id: 4, title: 'Python for Data Science', instructor: 'Jose Portilla', thumbnail: 'https://picsum.photos/seed/py4/400/300', progress: 100, status: 'Completed', duration: '25h' },
];

export default function MyCoursesScreen() {
    const [activeTab, setActiveTab] = useState('All');
    const c = useThemeColors();
    const filtered = MOCK_COURSES.filter(course => activeTab === 'All' || course.status === activeTab);

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="My Courses" subtitle={`${MOCK_COURSES.length} enrolled courses`} />
            {/* Tabs */}
            <View style={{ flexDirection: 'row', backgroundColor: c.bgCard, paddingHorizontal: 16, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: c.borderLight }}>
                {TABS.map(tab => (
                    <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={{ marginRight: 24, paddingBottom: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: activeTab === tab ? '#6366f1' : c.textMuted }}>{tab}</Text>
                        {activeTab === tab && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: '#6366f1', borderRadius: 2 }} />}
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filtered}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                        <Ionicons name="book-outline" size={40} color={c.textMuted} />
                        <Text style={{ color: c.textMuted, marginTop: 12 }}>No courses here yet</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={{ backgroundColor: c.bgCard, borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
                        <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: 144 }} resizeMode="cover" />
                        <View style={{ padding: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15, flex: 1, paddingRight: 8 }} numberOfLines={2}>{item.title}</Text>
                                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: item.status === 'Completed' ? '#f0fdf4' : '#eef2ff' }}>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: item.status === 'Completed' ? '#16a34a' : '#6366f1' }}>{item.status === 'Completed' ? '✓ Done' : 'In Progress'}</Text>
                                </View>
                            </View>
                            <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 4 }}>{item.instructor}</Text>
                            <View style={{ marginTop: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text style={{ fontSize: 12, color: c.textMuted }}>{item.progress}% complete</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons name="time-outline" size={12} color={c.textMuted} />
                                        <Text style={{ fontSize: 12, color: c.textMuted }}>{item.duration}</Text>
                                    </View>
                                </View>
                                <View style={{ height: 6, backgroundColor: c.bgSecondary, borderRadius: 3, overflow: 'hidden' }}>
                                    <View style={{ height: '100%', borderRadius: 3, backgroundColor: item.progress === 100 ? '#22c55e' : '#6366f1', width: `${item.progress}%` }} />
                                </View>
                            </View>
                            <TouchableOpacity style={{ marginTop: 12, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: item.progress === 100 ? '#f0fdf4' : '#eef2ff' }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: item.progress === 100 ? '#16a34a' : '#6366f1' }}>{item.progress === 100 ? 'Review Course' : 'Continue Learning'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

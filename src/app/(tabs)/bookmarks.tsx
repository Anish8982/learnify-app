import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { drawerEvents } from '../../lib/drawerEvents';
import { useBookmarks } from '../../providers/BookmarkProvider';
import { Course } from '../../types';

const FALLBACK_URI = 'https://picsum.photos/seed/bookmark/400/300';

function cleanUri(uri: string | undefined): string {
    if (!uri) return FALLBACK_URI;
    // Handle JSON-array-wrapped URLs from the API e.g. '["https://..."]'
    if (uri.startsWith('[')) {
        try {
            const parsed = JSON.parse(uri);
            if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        } catch { /* ignore */ }
    }
    if (!uri.startsWith('http')) return FALLBACK_URI;
    return uri;
}

function CourseImage({ uri, courseId }: { uri: string | undefined; courseId: string | number }) {
    const [errored, setErrored] = useState(false);
    const src = errored ? FALLBACK_URI : cleanUri(uri);
    // Use courseId as key to force re-render when course changes
    return (
        <Image
            key={`${courseId}-${src}`}
            source={{ uri: src }}
            style={{ width: '100%', height: 176 }}
            resizeMode="cover"
            onError={() => setErrored(true)}
        />
    );
}

export default function BookmarksScreen() {
    const c = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Single source of truth — same context home uses
    const { bookmarkedCourses, toggle } = useBookmarks();

    const handlePress = useCallback((course: Course) => {
        router.push({
            pathname: '/course/[id]',
            params: { id: String(course.id), courseData: JSON.stringify(course) },
        } as any);
    }, [router]);

    const handleRemove = useCallback((course: Course) => {
        toggle(course); // removes from shared context + storage
    }, [toggle]);

    // ─── Empty state ─────────────────────────────────────────────────────────────

    if (bookmarkedCourses.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: c.bg }}>
                <View style={{
                    backgroundColor: c.bgCard,
                    paddingHorizontal: 24,
                    paddingTop: insets.top + 16,
                    paddingBottom: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: c.borderLight,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: c.textPrimary }}>Bookmarks</Text>
                        <TouchableOpacity
                            onPress={() => drawerEvents.open()}
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Ionicons name="menu" size={22} color={c.iconColor} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                    <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <Ionicons name="bookmark-outline" size={44} color="#6366f1" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: c.textPrimary, textAlign: 'center' }}>
                        No bookmarks yet
                    </Text>
                    <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                        Tap the bookmark icon on any course to save it here.
                    </Text>
                </View>
            </View>
        );
    }

    // ─── List ─────────────────────────────────────────────────────────────────────

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            {/* Header */}
            <View style={{
                backgroundColor: c.bgCard,
                paddingHorizontal: 24,
                paddingTop: insets.top + 16,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: c.borderLight,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: c.textPrimary }}>Bookmarks</Text>
                        <Text style={{ color: c.textMuted, marginTop: 4, fontSize: 13 }}>
                            {bookmarkedCourses.length} saved {bookmarkedCourses.length === 1 ? 'course' : 'courses'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => drawerEvents.open()}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Ionicons name="menu" size={22} color={c.iconColor} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={bookmarkedCourses}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handlePress(item)}
                        activeOpacity={0.92}
                        style={{
                            backgroundColor: c.bgCard,
                            borderRadius: 20,
                            marginBottom: 16,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: c.borderLight,
                            shadowColor: '#000',
                            shadowOpacity: 0.04,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        {/* Thumbnail */}
                        <View>
                            <CourseImage uri={item.thumbnail} courseId={item.id} />
                            {/* Level badge */}
                            {item.level && (
                                <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{item.level}</Text>
                                </View>
                            )}
                            {/* Remove bookmark button */}
                            <TouchableOpacity
                                onPress={() => handleRemove(item)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Ionicons name="bookmark" size={18} color="#818cf8" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={{ padding: 16 }}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: c.textPrimary }} numberOfLines={2}>
                                {item.title}
                            </Text>

                            {/* Instructor row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                {item.instructorAvatar ? (
                                    <Image source={{ uri: item.instructorAvatar }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                                ) : (
                                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons name="person" size={11} color="#6366f1" />
                                    </View>
                                )}
                                <Text style={{ color: c.textMuted, fontSize: 13, flex: 1 }} numberOfLines={1}>
                                    {item.instructor}
                                </Text>
                                {item.rating != null && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                        <Ionicons name="star" size={12} color="#f59e0b" />
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: c.textSecondary }}>
                                            {item.rating.toFixed(1)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Price + action */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                                <Text style={{ color: '#6366f1', fontWeight: '800', fontSize: 16 }}>
                                    {item.price ? `₹${item.price}` : 'Free'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handlePress(item)}
                                    style={{ backgroundColor: '#eef2ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
                                >
                                    <Text style={{ color: '#6366f1', fontWeight: '600', fontSize: 13 }}>View Course</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { Course, CourseLevel } from '../types';

interface Props {
    course: Course;
    onPress: (course: Course) => void;
    onBookmark: (id: string | number) => void;
}

const LEVEL_COLORS: Record<CourseLevel, { bg: string; text: string }> = {
    Beginner: { bg: '#dcfce7', text: '#16a34a' },
    Intermediate: { bg: '#fef9c3', text: '#ca8a04' },
    Advanced: { bg: '#fee2e2', text: '#dc2626' },
};

const FALLBACK_BASE = 'https://picsum.photos/seed';

function CourseCardComponent({ course, onPress, onBookmark }: Props) {
    const c = useThemeColors();
    const [imgError, setImgError] = useState(false);

    const handlePress = useCallback(() => onPress(course), [course, onPress]);
    const handleBookmark = useCallback(() => onBookmark(course.id), [course.id, onBookmark]);

    const level = course.level ?? 'Beginner';
    const levelStyle = LEVEL_COLORS[level];
    const fallback = `${FALLBACK_BASE}/${course.id}/400/300`;
    const imageUri = imgError ? fallback : (course.thumbnail || fallback);

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.92}
            style={{
                backgroundColor: c.bgCard,
                borderRadius: 20,
                marginBottom: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
            }}
        >
            {/* Thumbnail */}
            <View>
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: 176 }}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                />

                {/* Price badge */}
                <View style={{ position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                        {course.price ? `₹${course.price}` : 'Free'}
                    </Text>
                </View>

                {/* Level badge */}
                <View style={{ position: 'absolute', bottom: 12, right: 52, backgroundColor: levelStyle.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: levelStyle.text, fontSize: 11, fontWeight: '700' }}>{level}</Text>
                </View>

                {/* Bookmark */}
                <TouchableOpacity
                    onPress={handleBookmark}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons
                        name={course.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={course.isBookmarked ? '#818cf8' : '#fff'}
                    />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={{ padding: 16 }}>
                <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15, lineHeight: 22 }} numberOfLines={2}>
                    {course.title}
                </Text>

                {/* Instructor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                    {course.instructorAvatar ? (
                        <Image source={{ uri: course.instructorAvatar }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                    ) : (
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="person" size={11} color="#6366f1" />
                        </View>
                    )}
                    <Text style={{ color: c.textMuted, fontSize: 13, flex: 1 }} numberOfLines={1}>
                        {course.instructor}
                    </Text>
                    {course.rating != null && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Ionicons name="star" size={12} color="#f59e0b" />
                            <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: '600' }}>
                                {course.rating.toFixed(1)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 8, lineHeight: 20 }} numberOfLines={2}>
                    {course.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export const CourseCard = memo(CourseCardComponent);

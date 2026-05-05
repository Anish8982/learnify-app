import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { bookmarkStorage } from '../../lib/bookmarkStorage';
import { courseService } from '../../lib/courseService';
import { enrollStorage } from '../../lib/enrollStorage';
import { Course, CourseLevel } from '../../types';

// ─── Static content ──────────────────────────────────────────────────────────

const WHAT_YOU_LEARN = [
    'Build real-world projects from scratch',
    'Understand core concepts deeply',
    'Industry best practices and patterns',
    'Deploy and ship production-ready apps',
    'Debug and optimize performance',
    'Work with modern tools and libraries',
];

const CURRICULUM = [
    { section: 'Getting Started', lessons: 4, duration: '45 min' },
    { section: 'Core Concepts', lessons: 8, duration: '2h 10min' },
    { section: 'Advanced Topics', lessons: 6, duration: '1h 45min' },
    { section: 'Real-World Project', lessons: 10, duration: '3h 20min' },
    { section: 'Deployment & Beyond', lessons: 3, duration: '50 min' },
];

const LEVEL_COLORS: Record<CourseLevel, { bg: string; text: string }> = {
    Beginner: { bg: '#dcfce7', text: '#16a34a' },
    Intermediate: { bg: '#fef9c3', text: '#ca8a04' },
    Advanced: { bg: '#fee2e2', text: '#dc2626' },
};

const FALLBACK_IMAGE = 'https://picsum.photos/seed/course/800/400';

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CourseDetailScreen() {
    const { id, courseData } = useLocalSearchParams<{ id: string; courseData?: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const c = useThemeColors();

    const [course, setCourse] = useState<Course | null>(() => {
        // Spec: no additional API call — use passed navigation data
        if (courseData) {
            try { return JSON.parse(courseData) as Course; } catch { /* fall through */ }
        }
        return null;
    });
    const [loading, setLoading] = useState(!course);
    const [imgError, setImgError] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    const enrollScale = useRef(new Animated.Value(1)).current;
    const bookmarkScale = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [200, 280],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Load from cache only if not passed via params
    useEffect(() => {
        const init = async () => {
            // Load bookmark + enroll state
            if (course) {
                const [bm, en] = await Promise.all([
                    bookmarkStorage.isBookmarked(course.id),
                    enrollStorage.isEnrolled(course.id),
                ]);
                setIsBookmarked(bm);
                setEnrolled(en);
                setLoading(false);
                return;
            }

            // Fallback: load from cache
            setLoading(true);
            try {
                const cached = await courseService.getCachedCourses();
                const found = cached?.find(c => String(c.id) === String(id));
                if (found) {
                    setCourse(found);
                    const [bm, en] = await Promise.all([
                        bookmarkStorage.isBookmarked(found.id),
                        enrollStorage.isEnrolled(found.id),
                    ]);
                    setIsBookmarked(bm);
                    setEnrolled(en);
                } else {
                    // Last resort: fresh fetch
                    const fresh = await courseService.fetchCourses();
                    const freshFound = fresh.find(c => String(c.id) === String(id));
                    if (freshFound) {
                        setCourse(freshFound);
                        const [bm, en] = await Promise.all([
                            bookmarkStorage.isBookmarked(freshFound.id),
                            enrollStorage.isEnrolled(freshFound.id),
                        ]);
                        setIsBookmarked(bm);
                        setEnrolled(en);
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const handleBookmark = useCallback(async () => {
        if (!course) return;
        const next = await bookmarkStorage.toggle(course.id);
        setIsBookmarked(next);
        Animated.sequence([
            Animated.spring(bookmarkScale, { toValue: 1.35, useNativeDriver: true, damping: 5 }),
            Animated.spring(bookmarkScale, { toValue: 1, useNativeDriver: true, damping: 8 }),
        ]).start();
    }, [course]);

    const handleEnroll = useCallback(async () => {
        if (enrolled || enrolling || !course) return;
        setEnrolling(true);

        Animated.sequence([
            Animated.timing(enrollScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.spring(enrollScale, { toValue: 1, damping: 8, useNativeDriver: true }),
        ]).start();

        await Promise.all([
            new Promise(r => setTimeout(r, 1000)),
            enrollStorage.enroll(course.id),
            courseService.saveLastOpened(course, 0),
        ]);

        setEnrolling(false);
        setEnrolled(true);
    }, [course, enrolled, enrolling]);

    // ─── Loading state ──────────────────────────────────────────────────────────

    if (loading || !course) {
        return (
            <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Ionicons name="book-outline" size={30} color="#6366f1" />
                </View>
                <Text style={{ color: c.textMuted, fontSize: 14 }}>Loading course...</Text>
            </View>
        );
    }

    const stars = Math.round(course.rating ?? 4);
    const level = course.level ?? 'Beginner';
    const levelStyle = LEVEL_COLORS[level];
    const imageUri = imgError ? FALLBACK_IMAGE : (course.thumbnail || FALLBACK_IMAGE);

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>

            {/* Floating header — fades in on scroll */}
            <Animated.View style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
                backgroundColor: c.bgCard,
                paddingTop: insets.top,
                paddingHorizontal: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.borderLight,
                opacity: headerOpacity,
                shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="arrow-back" size={20} color={c.iconColor} />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, color: c.textPrimary, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                        {course.title}
                    </Text>
                    <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                        <TouchableOpacity onPress={handleBookmark} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={20} color={isBookmarked ? '#6366f1' : c.iconColor} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Animated.View>

            {/* Scrollable content */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
            >
                {/* Hero image */}
                <View>
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: 260 }}
                        resizeMode="cover"
                        onError={() => setImgError(true)}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.72)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130 }}
                    />

                    {/* Overlay controls */}
                    <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </TouchableOpacity>
                        <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                            <TouchableOpacity onPress={handleBookmark} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={isBookmarked ? '#818cf8' : '#fff'} />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Bottom badges */}
                    <View style={{ position: 'absolute', bottom: 14, left: 16, flexDirection: 'row', gap: 8 }}>
                        <View style={{ backgroundColor: '#6366f1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 }}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                                {course.price ? `₹${course.price}` : 'Free'}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: levelStyle.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                            <Text style={{ color: levelStyle.text, fontWeight: '700', fontSize: 13 }}>{level}</Text>
                        </View>
                    </View>
                </View>

                {/* Body */}
                <View style={{ padding: 20 }}>

                    {/* Title */}
                    <Text style={{ color: c.textPrimary, fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 14 }}>
                        {course.title}
                    </Text>

                    {/* Instructor */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        {course.instructorAvatar ? (
                            <Image source={{ uri: course.instructorAvatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                        ) : (
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="person" size={22} color="#6366f1" />
                            </View>
                        )}
                        <View>
                            <Text style={{ color: c.textMuted, fontSize: 12 }}>Instructor</Text>
                            <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15 }}>{course.instructor}</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={{ flexDirection: 'row', backgroundColor: c.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.borderLight, marginBottom: 24 }}>
                        {/* Rating */}
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Ionicons key={i} name={i < stars ? 'star' : 'star-outline'} size={13} color="#f59e0b" />
                                ))}
                            </View>
                            <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15 }}>
                                {course.rating?.toFixed(1) ?? '4.5'}
                            </Text>
                            <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>Rating</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: c.borderLight }} />
                        {/* Students */}
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Ionicons name="people-outline" size={20} color="#6366f1" style={{ marginBottom: 4 }} />
                            <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15 }}>2.4k</Text>
                            <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>Students</Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: c.borderLight }} />
                        {/* Duration */}
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Ionicons name="time-outline" size={20} color="#6366f1" style={{ marginBottom: 4 }} />
                            <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15 }}>8h 50m</Text>
                            <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>Duration</Text>
                        </View>
                    </View>

                    {/* About */}
                    <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 17, marginBottom: 10 }}>
                        About this course
                    </Text>
                    <Text style={{ color: c.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
                        {course.description}
                        {'\n\n'}
                        This comprehensive course takes you from {level.toLowerCase()} to production-ready. You'll work on hands-on projects, learn industry best practices, and gain the confidence to tackle any challenge in {course.category ?? 'this field'}.
                    </Text>

                    {/* What you'll learn */}
                    <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 17, marginBottom: 12 }}>
                        What you'll learn
                    </Text>
                    <View style={{ backgroundColor: c.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.borderLight, marginBottom: 24 }}>
                        {WHAT_YOU_LEARN.map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: i < WHAT_YOU_LEARN.length - 1 ? 12 : 0 }}>
                                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                                    <Ionicons name="checkmark" size={13} color="#6366f1" />
                                </View>
                                <Text style={{ flex: 1, color: c.textSecondary, fontSize: 14, lineHeight: 20 }}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Curriculum */}
                    <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 17, marginBottom: 12 }}>
                        Course Curriculum
                    </Text>
                    <View style={{ backgroundColor: c.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, marginBottom: 24 }}>
                        {CURRICULUM.map((section, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: i < CURRICULUM.length - 1 ? 1 : 0, borderBottomColor: c.borderLight }}>
                                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Text style={{ color: '#6366f1', fontWeight: '700', fontSize: 13 }}>{i + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: c.textPrimary, fontWeight: '600', fontSize: 14 }}>{section.section}</Text>
                                    <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>
                                        {section.lessons} lessons · {section.duration}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                            </View>
                        ))}
                    </View>

                    {/* Tags */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {[level, 'Certificate', 'Lifetime Access', 'Mobile Friendly', course.category ?? 'General'].map(tag => (
                            <View key={tag} style={{ backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                                <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Preview in WebView */}
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/course/webview',
                            params: { courseData: JSON.stringify(course) },
                        } as any)}
                        activeOpacity={0.85}
                        style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingVertical: 14 }}
                    >
                        <Ionicons name="globe-outline" size={18} color="#6366f1" />
                        <Text style={{ color: '#6366f1', fontWeight: '700', fontSize: 14 }}>Preview Course in Browser</Text>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>

            {/* Sticky enroll bar */}
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: c.bgCard,
                borderTopWidth: 1, borderTopColor: c.borderLight,
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: insets.bottom + 12,
                flexDirection: 'row', alignItems: 'center', gap: 12,
                shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
            }}>
                {/* Bookmark toggle */}
                <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                    <TouchableOpacity
                        onPress={handleBookmark}
                        style={{
                            width: 52, height: 52, borderRadius: 14,
                            backgroundColor: isBookmarked ? '#eef2ff' : c.bgSecondary,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: isBookmarked ? '#6366f1' : c.border,
                        }}
                    >
                        <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={22}
                            color={isBookmarked ? '#6366f1' : c.textMuted}
                        />
                    </TouchableOpacity>
                </Animated.View>

                {/* Enroll button */}
                <Animated.View style={{ flex: 1, transform: [{ scale: enrollScale }] }}>
                    <TouchableOpacity
                        onPress={handleEnroll}
                        disabled={enrolling || enrolled}
                        activeOpacity={0.88}
                        style={{ borderRadius: 16, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={
                                enrolled ? ['#10b981', '#059669'] :
                                    enrolling ? ['#4338ca', '#4338ca'] :
                                        ['#6366f1', '#4f46e5']
                            }
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                        >
                            {enrolling ? (
                                <>
                                    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', borderTopColor: '#fff' }} />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Enrolling...</Text>
                                </>
                            ) : enrolled ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Enrolled!</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="rocket-outline" size={20} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                                        Enroll Now · {course.price ? `₹${course.price}` : 'Free'}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

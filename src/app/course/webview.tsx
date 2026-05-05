import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useThemeColors } from '../../hooks/useThemeColors';
import { bookmarkStorage } from '../../lib/bookmarkStorage';
import { buildCourseHtml } from '../../lib/courseWebTemplate';
import { enrollStorage } from '../../lib/enrollStorage';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { Course } from '../../types';

interface WebViewMessage {
    action: 'enroll' | 'bookmark';
    courseId: string;
}

export default function CourseWebViewScreen() {
    const { courseData } = useLocalSearchParams<{ courseData: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const c = useThemeColors();
    const { isDark } = useTheme();
    const { user } = useAuth();

    const webViewRef = useRef<WebView>(null);
    const [webLoading, setWebLoading] = useState(true);
    const [webError, setWebError] = useState(false);

    const course: Course | null = (() => {
        try { return courseData ? JSON.parse(courseData) : null; } catch { return null; }
    })();

    if (!course) {
        return (
            <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.textMuted }}>Course data unavailable.</Text>
            </View>
        );
    }

    // ── Native → WebView: inject live state after page loads ──────────────────
    const buildInjection = async (): Promise<string> => {
        const [isEnrolled, isBookmarked] = await Promise.all([
            enrollStorage.isEnrolled(course.id),
            bookmarkStorage.isBookmarked(course.id),
        ]);
        const payload = JSON.stringify({
            isEnrolled,
            isBookmarked,
            userName: user?.name ?? '',
        });
        return `
      (function() {
        if (typeof window.receiveCourseData === 'function') {
          window.receiveCourseData(${payload});
        }
        true; // required for Android
      })();
    `;
    };

    // ── WebView → Native: handle messages from the HTML page ─────────────────
    const handleMessage = async (event: WebViewMessageEvent) => {
        try {
            const msg: WebViewMessage = JSON.parse(event.nativeEvent.data);

            if (msg.action === 'enroll') {
                await enrollStorage.enroll(course.id);
                await buildInjection().then(js => webViewRef.current?.injectJavaScript(js));
                Alert.alert('Enrolled! 🎉', `You are now enrolled in "${course.title}".`);
            }

            if (msg.action === 'bookmark') {
                await bookmarkStorage.toggle(course.id);
                await buildInjection().then(js => webViewRef.current?.injectJavaScript(js));
            }
        } catch {
            // Malformed message — ignore
        }
    };

    const html = buildCourseHtml(course, isDark);

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            {/* Header */}
            <View style={{
                backgroundColor: c.bgCard,
                paddingTop: insets.top + 8,
                paddingBottom: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: c.borderLight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
            }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="arrow-back" size={20} color={c.iconColor} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                        {course.title}
                    </Text>
                    <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 1 }}>
                        Course Preview
                    </Text>
                </View>
                {/* Reload button */}
                <TouchableOpacity
                    onPress={() => webViewRef.current?.reload()}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="refresh-outline" size={18} color={c.iconColor} />
                </TouchableOpacity>
            </View>

            {/* WebView */}
            <View style={{ flex: 1 }}>
                {webError ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                        <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 16, marginTop: 12 }}>
                            Failed to load content
                        </Text>
                        <TouchableOpacity
                            onPress={() => { setWebError(false); webViewRef.current?.reload(); }}
                            style={{ marginTop: 16, backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <WebView
                        ref={webViewRef}
                        // Load the locally generated HTML — no network request needed
                        source={{ html, baseUrl: '' }}
                        style={{ flex: 1, backgroundColor: c.bg }}
                        // Inject live state (enrolled/bookmarked/username) once page finishes loading
                        onLoadEnd={async () => {
                            setWebLoading(false);
                            const js = await buildInjection();
                            webViewRef.current?.injectJavaScript(js);
                        }}
                        onError={() => setWebError(true)}
                        onMessage={handleMessage}
                        // Pass app metadata to the WebView via custom HTTP headers
                        // (visible in the WebView's navigator.userAgent context)
                        applicationNameForUserAgent="Learnify/1.0.0 ReactNative"
                        // Security: restrict navigation to prevent the page from
                        // redirecting to external URLs
                        onShouldStartLoadWithRequest={request => {
                            // Allow the initial blank/data load, block external navigation
                            return request.url === 'about:blank' || request.url.startsWith('data:');
                        }}
                        javaScriptEnabled
                        domStorageEnabled
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Loading overlay */}
                {webLoading && !webError && (
                    <View style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: c.bg,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={{ color: c.textMuted, marginTop: 12, fontSize: 14 }}>
                            Loading course content...
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

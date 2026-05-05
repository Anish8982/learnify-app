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
    const [webError, setWebError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const course: Course | null = (() => {
        try { return courseData ? JSON.parse(courseData) : null; } catch { return null; }
    })();

    if (!course) {
        return (
            <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 16, marginTop: 12 }}>
                    Course data unavailable
                </Text>
                <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 4 }}>
                    Unable to load course information
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginTop: 20, backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }}
                >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
                </TouchableOpacity>
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

    const handleWebViewError = (event: WebViewErrorEvent) => {
        const { nativeEvent } = event;
        console.error('WebView error:', nativeEvent);

        let errorMessage = 'Failed to load content';

        if (nativeEvent.description) {
            if (nativeEvent.description.includes('net::ERR_INTERNET_DISCONNECTED')) {
                errorMessage = 'No internet connection';
            } else if (nativeEvent.description.includes('net::ERR_TIMED_OUT')) {
                errorMessage = 'Request timed out';
            } else if (nativeEvent.description.includes('net::ERR_NAME_NOT_RESOLVED')) {
                errorMessage = 'Unable to resolve server';
            } else {
                errorMessage = nativeEvent.description;
            }
        }

        setWebError(errorMessage);
        setWebLoading(false);
    };

    const handleRetry = () => {
        setWebError(null);
        setWebLoading(true);
        setRetryCount(prev => prev + 1);
        webViewRef.current?.reload();
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
                    onPress={handleRetry}
                    style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="refresh-outline" size={18} color={c.iconColor} />
                </TouchableOpacity>
            </View>

            {/* WebView */}
            <View style={{ flex: 1 }}>
                {webError ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                        <View style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: '#fef2f2',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                            <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                        </View>
                        <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 18, textAlign: 'center' }}>
                            Failed to Load Content
                        </Text>
                        <Text style={{ color: c.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                            {webError}
                        </Text>
                        {retryCount > 0 && (
                            <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>
                                Retry attempt: {retryCount}
                            </Text>
                        )}
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={{
                                    backgroundColor: c.bgCard,
                                    paddingHorizontal: 20,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: c.borderLight,
                                }}
                            >
                                <Text style={{ color: c.textPrimary, fontWeight: '600' }}>Go Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleRetry}
                                style={{
                                    backgroundColor: '#6366f1',
                                    paddingHorizontal: 20,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Ionicons name="refresh-outline" size={16} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <WebView
                        key={retryCount} // Force remount on retry
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
                        onLoadStart={() => setWebLoading(true)}
                        onError={handleWebViewError}
                        onHttpError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('HTTP error:', nativeEvent.statusCode);
                            if (nativeEvent.statusCode >= 400) {
                                setWebError(`HTTP Error: ${nativeEvent.statusCode}`);
                            }
                        }}
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
                        // Enable better error handling
                        startInLoadingState
                        renderError={(errorName) => (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: c.textMuted }}>Error: {errorName}</Text>
                            </View>
                        )}
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

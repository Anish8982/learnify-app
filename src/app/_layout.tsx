import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';
import { SplashScreen } from '../components/SplashScreen';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { BookmarkProvider } from '../providers/BookmarkProvider';
import { DrawerProvider } from '../providers/DrawerProvider';
import { ThemeProvider, useTheme } from '../providers/ThemeProvider';
import { initializeNotifications } from '../services/notifications';

function AppShell() {
  const { isDark } = useTheme();
  const { isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize notification system on app startup
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Wait for auth to initialize before marking as ready
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure providers are fully ready
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show splash until both Firebase resolves AND the animation finishes
  const showSplash = isLoading || !splashDone;

  // Don't render navigation until everything is ready
  if (!isReady) {
    return (
      <View style={{ flex: 1 }}>
        <SplashScreen onDone={() => setSplashDone(true)} />
      </View>
    );
  }

  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(profile)" options={{ headerShown: false }} />
          <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="course/webview" options={{ headerShown: false }} />
        </Stack>

        {/* Splash sits on top until ready */}
        {showSplash && (
          <SplashScreen
            onDone={() => setSplashDone(true)}
          />
        )}
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </DrawerProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <BookmarkProvider>
            <AppShell />
          </BookmarkProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

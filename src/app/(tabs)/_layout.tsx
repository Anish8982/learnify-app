import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuth } from '../../providers/AuthProvider';

export default function TabsLayout() {
  const c = useThemeColors();
  const router = useRouter();

  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
  }

  // Redirect to login when user logs out
  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.replace('/(auth)/login');
    }
  }, [auth.isLoading, auth.user]);

  if (auth.isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
  }

  if (!auth.user) {
    // Return blank while useEffect redirect fires
    return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopWidth: 1,
          borderTopColor: c.tabBarBorder,
          height: Platform.OS === 'ios' ? 80 : 62,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 32 }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={23} color={color} />
              {focused && (
                <View style={{ position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#6366f1' }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 32 }}>
              <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={23} color={color} />
              {focused && (
                <View style={{ position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#6366f1' }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 32 }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={23} color={color} />
              {focused && (
                <View style={{ position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#6366f1' }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

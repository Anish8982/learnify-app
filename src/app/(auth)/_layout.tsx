import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

export default function AuthLayout() {
  const router = useRouter();
  let auth;

  try {
    auth = useAuth();
  } catch (error) {
    return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
  }

  // Redirect to home when user logs in
  useEffect(() => {
    if (!auth.isLoading && auth.user && !auth.isRegistering) {
      router.replace('/(tabs)/home');
    }
  }, [auth.isLoading, auth.user, auth.isRegistering]);

  if (auth.isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
  }

  // If logged in, return blank while useEffect redirect fires
  if (auth.user && !auth.isRegistering) {
    return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

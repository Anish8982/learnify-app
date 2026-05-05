import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';

const FEATURES = [
  { icon: 'play-circle-outline', label: '500+ Courses' },
  { icon: 'ribbon-outline', label: 'Certificates' },
  { icon: 'people-outline', label: 'Expert Mentors' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b', '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View className="items-center pt-16 pb-8 px-6">
            <View className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 items-center justify-center mb-5">
              <Ionicons name="school" size={40} color="#818cf8" />
            </View>
            <Text className="text-white text-4xl font-bold tracking-tight">Learnify</Text>
            <Text className="text-indigo-300 text-base mt-1 mb-6">
              Upgrade your skills, anytime 🚀
            </Text>
            <View className="flex-row gap-3">
              {FEATURES.map((f) => (
                <View
                  key={f.label}
                  className="flex-row items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
                >
                  <Ionicons name={f.icon as any} size={13} color="#a5b4fc" />
                  <Text className="text-indigo-200 text-xs font-medium">{f.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Form Card */}
          <View className="mx-4 bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
            <Text className="text-white text-2xl font-bold mb-1">Welcome back 👋</Text>
            <Text className="text-slate-400 text-sm mb-6">
              Sign in to continue your learning journey
            </Text>

            {/* Error Banner */}
            {!!error && (
              <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 gap-2">
                <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                <Text className="text-red-400 text-sm flex-1">{error}</Text>
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Email
              </Text>
              <View
                className={`flex-row items-center bg-white/5 rounded-xl border px-4 ${emailFocused ? 'border-indigo-500' : 'border-white/10'
                  }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={emailFocused ? '#818cf8' : '#64748b'}
                />
                <TextInput
                  className="flex-1 text-white py-4 px-3 text-base"
                  placeholder="you@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-2">
              <Text className="text-slate-400 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Password
              </Text>
              <View
                className={`flex-row items-center bg-white/5 rounded-xl border px-4 ${passwordFocused ? 'border-indigo-500' : 'border-white/10'
                  }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={passwordFocused ? '#818cf8' : '#64748b'}
                />
                <TextInput
                  className="flex-1 text-white py-4 px-3 text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="self-end mb-6"
              onPress={() => Alert.alert('Coming Soon', 'Password reset will be available soon.')}
            >
              <Text className="text-indigo-400 text-sm font-medium">Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={loading ? ['#4338ca', '#4338ca'] : ['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 rounded-xl items-center justify-center flex-row gap-2"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text className="text-white text-base font-bold">Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="mx-4 text-slate-500 text-xs uppercase tracking-widest">or</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'Google Sign-In will be available soon.')}
              className="flex-row items-center justify-center bg-white/5 border border-white/10 py-4 rounded-xl gap-3"
              activeOpacity={0.8}
            >
              <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                <Text className="text-xs font-black text-blue-600">G</Text>
              </View>
              <Text className="text-white font-semibold text-base">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="pb-10 items-center"
          >
            <Text className="text-slate-400 text-sm">
              New to Learnify?{' '}
              <Text className="text-indigo-400 font-bold">Create an account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

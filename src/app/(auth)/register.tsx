import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SuccessOverlay } from '../../components/SuccessOverlay';
import { useAuth } from '../../providers/AuthProvider';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    const { register, clearRegistering } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            setShowSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
                    {/* Header */}
                    <View className="items-center pt-16 pb-8 px-6">
                        <View className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 items-center justify-center mb-5">
                            <Ionicons name="person-add" size={38} color="#818cf8" />
                        </View>
                        <Text className="text-white text-4xl font-bold tracking-tight">
                            Learnify
                        </Text>
                        <Text className="text-indigo-300 text-base mt-1">
                            Start learning for free today 🎓
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View className="mx-4 bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                        <Text className="text-white text-2xl font-bold mb-1">Create account</Text>
                        <Text className="text-slate-400 text-sm mb-6">
                            Join thousands of learners worldwide
                        </Text>

                        {/* Error Banner */}
                        {error ? (
                            <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 gap-2">
                                <Ionicons name="alert-circle-outline" size={16} color="#f87171" />
                                <Text className="text-red-400 text-sm flex-1">{error}</Text>
                            </View>
                        ) : null}

                        {/* Name */}
                        <View className="mb-4">
                            <Text className="text-slate-400 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                                Full Name
                            </Text>
                            <View
                                className={`flex-row items-center bg-white/5 rounded-xl border px-4 ${nameFocused ? 'border-indigo-500' : 'border-white/10'
                                    }`}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    color={nameFocused ? '#818cf8' : '#64748b'}
                                />
                                <TextInput
                                    className="flex-1 text-white py-4 px-3 text-base"
                                    placeholder="John Doe"
                                    placeholderTextColor="#475569"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    onFocus={() => setNameFocused(true)}
                                    onBlur={() => setNameFocused(false)}
                                />
                            </View>
                        </View>

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
                        <View className="mb-4">
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
                                    placeholder="Min. 6 characters"
                                    placeholderTextColor="#475569"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={18}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View className="mb-6">
                            <Text className="text-slate-400 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                                Confirm Password
                            </Text>
                            <View
                                className={`flex-row items-center bg-white/5 rounded-xl border px-4 ${confirmFocused ? 'border-indigo-500' : 'border-white/10'
                                    }`}
                            >
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={18}
                                    color={confirmFocused ? '#818cf8' : '#64748b'}
                                />
                                <TextInput
                                    className="flex-1 text-white py-4 px-3 text-base"
                                    placeholder="Re-enter password"
                                    placeholderTextColor="#475569"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                    onFocus={() => setConfirmFocused(true)}
                                    onBlur={() => setConfirmFocused(false)}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                                    <Ionicons
                                        name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                        size={18}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
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
                                        <Text className="text-white text-base font-bold">Create Account</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Terms note */}
                        <Text className="text-slate-500 text-xs text-center mt-4">
                            By registering, you agree to our{' '}
                            <Text className="text-indigo-400">Terms of Service</Text> and{' '}
                            <Text className="text-indigo-400">Privacy Policy</Text>
                        </Text>
                    </View>

                    {/* Login Link */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="pb-10 items-center"
                    >
                        <Text className="text-slate-400 text-sm">
                            Already have an account?{' '}
                            <Text className="text-indigo-400 font-bold">Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success overlay — renders on top of everything */}
            {showSuccess && (
                <SuccessOverlay
                    name={name}
                    onDone={() => {
                        clearRegistering();
                        router.replace('/(tabs)/home');
                    }}
                />
            )}
        </LinearGradient>
    );
}

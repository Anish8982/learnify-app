import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Text, View } from 'react-native';

interface Props {
    name: string;
    onDone: () => void;
}

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 20;

// Deterministic pseudo-random from seed so it's stable across renders
function seededRandom(seed: number) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: seededRandom(i * 3) * width,
    delay: seededRandom(i * 7) * 400,
    size: 6 + seededRandom(i * 11) * 8,
    color: ['#818cf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'][i % 6],
    rotate: seededRandom(i * 13) * 360,
}));

function Particle({ x, delay, size, color, rotate }: (typeof PARTICLES)[0]) {
    const translateY = useRef(new Animated.Value(-20)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const spin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: height * 0.6,
                    duration: 1800,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                    Animated.delay(1200),
                    Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                ]),
                Animated.timing(spin, {
                    toValue: 1,
                    duration: 1800,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const spinDeg = spin.interpolate({ inputRange: [0, 1], outputRange: [`${rotate}deg`, `${rotate + 360}deg`] });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 80,
                left: x,
                width: size,
                height: size,
                borderRadius: size / 4,
                backgroundColor: color,
                opacity,
                transform: [{ translateY }, { rotate: spinDeg }],
            }}
        />
    );
}

export function SuccessOverlay({ name, onDone }: Props) {
    // Backdrop fade in
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    // Card scale + fade
    const cardScale = useRef(new Animated.Value(0.6)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    // Circle scale pulse
    const circleScale = useRef(new Animated.Value(0)).current;
    // Checkmark scale
    const checkScale = useRef(new Animated.Value(0)).current;
    // Text slide up
    const textTranslate = useRef(new Animated.Value(20)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    // Ring pulse
    const ringScale = useRef(new Animated.Value(1)).current;
    const ringOpacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        // Step 1: fade in backdrop + scale card
        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 1, duration: 300, useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
                toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
                toValue: 1, duration: 250, useNativeDriver: true,
            }),
        ]).start(() => {
            // Step 2: pop in the circle
            Animated.spring(circleScale, {
                toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true,
            }).start(() => {
                // Step 3: pop in checkmark
                Animated.spring(checkScale, {
                    toValue: 1, damping: 8, stiffness: 220, useNativeDriver: true,
                }).start();

                // Step 4: slide up text
                Animated.parallel([
                    Animated.timing(textTranslate, {
                        toValue: 0, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true,
                    }),
                    Animated.timing(textOpacity, {
                        toValue: 1, duration: 400, useNativeDriver: true,
                    }),
                ]).start();

                // Step 5: ring pulse loop
                Animated.loop(
                    Animated.parallel([
                        Animated.timing(ringScale, {
                            toValue: 1.6, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true,
                        }),
                        Animated.timing(ringOpacity, {
                            toValue: 0, duration: 900, useNativeDriver: true,
                        }),
                    ]),
                ).start();
            });
        });

        // Auto-navigate after 2.4s
        const timer = setTimeout(onDone, 2400);
        return () => clearTimeout(timer);
    }, []);

    const firstName = name.split(' ')[0];

    return (
        <Animated.View
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: backdropOpacity,
            }}
        >
            {/* Blurred dark backdrop */}
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(2,6,23,0.85)' }} />

            {/* Confetti particles */}
            {PARTICLES.map((p) => (
                <Particle key={p.id} {...p} />
            ))}

            {/* Card */}
            <Animated.View
                style={{
                    transform: [{ scale: cardScale }],
                    opacity: cardOpacity,
                    width: width * 0.82,
                    alignItems: 'center',
                }}
            >
                <LinearGradient
                    colors={['#1e1b4b', '#0f172a']}
                    style={{
                        width: '100%',
                        borderRadius: 32,
                        padding: 36,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(129,140,248,0.2)',
                    }}
                >
                    {/* Pulsing ring behind circle */}
                    <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: 100,
                                height: 100,
                                borderRadius: 50,
                                borderWidth: 2,
                                borderColor: '#6366f1',
                                transform: [{ scale: ringScale }],
                                opacity: ringOpacity,
                            }}
                        />
                        {/* Green circle */}
                        <Animated.View
                            style={{
                                width: 88,
                                height: 88,
                                borderRadius: 44,
                                backgroundColor: '#059669',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: [{ scale: circleScale }],
                                shadowColor: '#10b981',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6,
                                shadowRadius: 20,
                                elevation: 12,
                            }}
                        >
                            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                                <Ionicons name="checkmark" size={46} color="#fff" />
                            </Animated.View>
                        </Animated.View>
                    </View>

                    {/* Text */}
                    <Animated.View
                        style={{
                            alignItems: 'center',
                            transform: [{ translateY: textTranslate }],
                            opacity: textOpacity,
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 }}>
                            You're in, {firstName}! 🎉
                        </Text>
                        <Text style={{ color: '#a5b4fc', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
                            Your account has been created{'\n'}successfully. Let's start learning!
                        </Text>

                        {/* Divider */}
                        <View style={{ width: 48, height: 3, backgroundColor: '#6366f1', borderRadius: 2, marginTop: 20 }} />
                    </Animated.View>
                </LinearGradient>
            </Animated.View>
        </Animated.View>
    );
}

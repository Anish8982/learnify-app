import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

// Orbiting course icons around the center logo
const ORBIT_ICONS: { icon: string; angle: number; radius: number; size: number; color: string; delay: number }[] = [
    { icon: 'code-slash', angle: 0, radius: 88, size: 18, color: '#818cf8', delay: 0 },
    { icon: 'brush', angle: 60, radius: 88, size: 16, color: '#34d399', delay: 80 },
    { icon: 'bar-chart', angle: 120, radius: 88, size: 16, color: '#fbbf24', delay: 160 },
    { icon: 'musical-notes', angle: 180, radius: 88, size: 18, color: '#f472b6', delay: 240 },
    { icon: 'flask', angle: 240, radius: 88, size: 16, color: '#60a5fa', delay: 320 },
    { icon: 'camera', angle: 300, radius: 88, size: 16, color: '#a78bfa', delay: 400 },
];

// Floating background dots
const DOTS = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: (i * 73 + 40) % (width - 20),
    y: (i * 137 + 60) % 700,
    size: 2 + (i % 3),
    opacity: 0.08 + (i % 4) * 0.04,
}));

function OrbitIcon({
    icon, angle, radius, size, color, delay, masterRotation,
}: (typeof ORBIT_ICONS)[0] & { masterRotation: Animated.Value }) {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(600 + delay),
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    // Counter-rotate so icons stay upright as the orbit spins
    const counterRotate = masterRotation.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '-360deg'],
    });

    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: x - 20,
                marginTop: y - 20,
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: color + '18',
                borderWidth: 1,
                borderColor: color + '40',
                alignItems: 'center',
                justifyContent: 'center',
                opacity,
                transform: [{ scale }, { rotate: counterRotate }],
            }}
        >
            <Ionicons name={icon as any} size={size} color={color} />
        </Animated.View>
    );
}

interface Props {
    onDone?: () => void;
}

export function SplashScreen({ onDone }: Props) {
    // Master values
    const backdropOpacity = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const ringScale1 = useRef(new Animated.Value(0.4)).current;
    const ringOpacity1 = useRef(new Animated.Value(0)).current;
    const ringScale2 = useRef(new Animated.Value(0.4)).current;
    const ringOpacity2 = useRef(new Animated.Value(0)).current;
    const orbitRotation = useRef(new Animated.Value(0)).current;
    const titleTranslate = useRef(new Animated.Value(16)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const dotsOpacity = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;
    const exitOpacity = useRef(new Animated.Value(1)).current;
    const exitScale = useRef(new Animated.Value(1)).current;

    // Interpolate rotation value to degrees string
    const orbitDeg = orbitRotation.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        // 1. Fade in background dots
        Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

        // 2. Pop in logo
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, damping: 9, stiffness: 180, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start();

        // 3. Pulse rings
        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.loop(
                    Animated.sequence([
                        Animated.parallel([
                            Animated.timing(ringScale1, { toValue: 1.5, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                            Animated.timing(ringOpacity1, { toValue: 0, duration: 1000, useNativeDriver: true }),
                        ]),
                        Animated.parallel([
                            Animated.timing(ringScale1, { toValue: 0.4, duration: 0, useNativeDriver: true }),
                            Animated.timing(ringOpacity1, { toValue: 0.5, duration: 0, useNativeDriver: true }),
                        ]),
                    ]),
                ),
                Animated.sequence([
                    Animated.delay(500),
                    Animated.loop(
                        Animated.sequence([
                            Animated.parallel([
                                Animated.timing(ringScale2, { toValue: 1.5, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
                                Animated.timing(ringOpacity2, { toValue: 0, duration: 1000, useNativeDriver: true }),
                            ]),
                            Animated.parallel([
                                Animated.timing(ringScale2, { toValue: 0.4, duration: 0, useNativeDriver: true }),
                                Animated.timing(ringOpacity2, { toValue: 0.5, duration: 0, useNativeDriver: true }),
                            ]),
                        ]),
                    ),
                ]),
            ]),
        ]).start();

        // 4. Spin orbit continuously
        Animated.sequence([
            Animated.delay(600),
            Animated.loop(
                Animated.timing(orbitRotation, {
                    toValue: 360,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ),
        ]).start();

        // 5. Slide in title
        Animated.sequence([
            Animated.delay(700),
            Animated.parallel([
                Animated.spring(titleTranslate, { toValue: 0, damping: 14, stiffness: 160, useNativeDriver: true }),
                Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();

        // 6. Fade in tagline
        Animated.sequence([
            Animated.delay(950),
            Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        // 7. Progress bar fills over 1.8s
        Animated.sequence([
            Animated.delay(800),
            Animated.timing(progressWidth, {
                toValue: 1,
                duration: 1800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false, // width can't use native driver
            }),
        ]).start();

        // 8. Exit — scale down + fade out, then call onDone
        Animated.sequence([
            Animated.delay(2800),
            Animated.parallel([
                Animated.timing(exitOpacity, { toValue: 0, duration: 400, easing: Easing.in(Easing.ease), useNativeDriver: true }),
                Animated.timing(exitScale, { toValue: 1.08, duration: 400, useNativeDriver: true }),
            ]),
        ]).start(() => onDone?.());
    }, []);

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFillObject,
                { zIndex: 9999, opacity: exitOpacity, transform: [{ scale: exitScale }] },
            ]}
        >
            <LinearGradient
                colors={['#020617', '#0f172a', '#1e1b4b', '#0f172a']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Background dots */}
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: dotsOpacity }]}>
                {DOTS.map((d) => (
                    <View
                        key={d.id}
                        style={{
                            position: 'absolute',
                            left: d.x,
                            top: d.y,
                            width: d.size,
                            height: d.size,
                            borderRadius: d.size / 2,
                            backgroundColor: '#818cf8',
                            opacity: d.opacity,
                        }}
                    />
                ))}
            </Animated.View>

            {/* Center content */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                {/* Orbit container */}
                <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>

                    {/* Spinning orbit ring (dashed visual) */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: 196,
                            height: 196,
                            borderRadius: 98,
                            borderWidth: 1,
                            borderColor: 'rgba(129,140,248,0.15)',
                            borderStyle: 'dashed',
                            transform: [{ rotate: orbitDeg }],
                        }}
                    />

                    {/* Pulse rings */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            borderWidth: 1.5,
                            borderColor: '#6366f1',
                            transform: [{ scale: ringScale1 }],
                            opacity: ringOpacity1,
                        }}
                    />
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            borderWidth: 1.5,
                            borderColor: '#818cf8',
                            transform: [{ scale: ringScale2 }],
                            opacity: ringOpacity2,
                        }}
                    />

                    {/* Orbiting icons — rotate the container, counter-rotate each icon */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            transform: [{ rotate: orbitDeg }],
                        }}
                    >
                        {ORBIT_ICONS.map((item) => (
                            <OrbitIcon
                                key={item.icon}
                                {...item}
                                masterRotation={orbitRotation}
                            />
                        ))}
                    </Animated.View>

                    {/* Center logo */}
                    <Animated.View
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 26,
                            backgroundColor: 'rgba(99,102,241,0.15)',
                            borderWidth: 1.5,
                            borderColor: 'rgba(129,140,248,0.4)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                            shadowColor: '#6366f1',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 24,
                            elevation: 12,
                        }}
                    >
                        <Ionicons name="school" size={42} color="#818cf8" />
                    </Animated.View>
                </View>

                {/* Title */}
                <Animated.Text
                    style={{
                        color: '#fff',
                        fontSize: 36,
                        fontWeight: '800',
                        letterSpacing: -0.5,
                        marginTop: 28,
                        opacity: titleOpacity,
                        transform: [{ translateY: titleTranslate }],
                    }}
                >
                    Learnify
                </Animated.Text>

                {/* Tagline */}
                <Animated.Text
                    style={{
                        color: '#a5b4fc',
                        fontSize: 14,
                        marginTop: 8,
                        opacity: taglineOpacity,
                        letterSpacing: 0.3,
                    }}
                >
                    Upgrade your skills, anytime 🚀
                </Animated.Text>

                {/* Progress bar */}
                <View
                    style={{
                        width: 160,
                        height: 3,
                        backgroundColor: 'rgba(129,140,248,0.15)',
                        borderRadius: 2,
                        marginTop: 48,
                        overflow: 'hidden',
                    }}
                >
                    <Animated.View
                        style={{
                            height: '100%',
                            borderRadius: 2,
                            backgroundColor: '#6366f1',
                            width: progressWidth.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        }}
                    />
                </View>
            </View>

            {/* Bottom version */}
            <Text
                style={{
                    color: 'rgba(148,163,184,0.4)',
                    fontSize: 11,
                    textAlign: 'center',
                    paddingBottom: 36,
                }}
            >
                v1.0.0
            </Text>
        </Animated.View>
    );
}

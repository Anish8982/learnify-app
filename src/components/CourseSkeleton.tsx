import React, { memo, useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

function CourseSkeletonItem({ opacity, skeletonColor, cardColor }: { opacity: Animated.Value; skeletonColor: string; cardColor: string }) {
    return (
        <Animated.View style={{ opacity, backgroundColor: cardColor, borderRadius: 20, marginBottom: 16, overflow: 'hidden' }}>
            <View style={{ height: 176, backgroundColor: skeletonColor }} />
            <View style={{ padding: 16, gap: 8 }}>
                <View style={{ height: 16, width: '80%', backgroundColor: skeletonColor, borderRadius: 8 }} />
                <View style={{ height: 12, width: '50%', backgroundColor: skeletonColor, borderRadius: 8 }} />
                <View style={{ height: 12, width: '90%', backgroundColor: skeletonColor, borderRadius: 8 }} />
                <View style={{ height: 12, width: '70%', backgroundColor: skeletonColor, borderRadius: 8 }} />
            </View>
        </Animated.View>
    );
}

function CourseSkeletonComponent() {
    const c = useThemeColors();
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <>
            {Array.from({ length: 4 }).map((_, i) => (
                <CourseSkeletonItem key={i} opacity={opacity} skeletonColor={c.skeleton} cardColor={c.bgCard} />
            ))}
        </>
    );
}

export const CourseSkeleton = memo(CourseSkeletonComponent);

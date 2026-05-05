import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { LastOpenedCourse } from '../types';

interface Props {
    course: LastOpenedCourse;
    onPress: () => void;
}

function ContinueLearningComponent({ course, onPress }: Props) {
    const c = useThemeColors();
    const progressPercent = Math.min(100, Math.max(0, course.progress));

    return (
        <View style={{ marginHorizontal: 4, marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Continue Learning
            </Text>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                className="bg-indigo-600 rounded-2xl overflow-hidden flex-row"
                style={{
                    shadowColor: '#6366f1',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 6,
                }}
            >
                <Image
                    source={{ uri: course.thumbnail }}
                    className="w-24 h-24"
                    resizeMode="cover"
                />
                <View className="flex-1 p-3 justify-between">
                    <View>
                        <Text className="text-white font-bold text-sm leading-snug" numberOfLines={2}>
                            {course.title}
                        </Text>
                        <Text className="text-indigo-200 text-xs mt-0.5" numberOfLines={1}>
                            {course.instructor}
                        </Text>
                    </View>
                    <View>
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-indigo-200 text-xs">{progressPercent}% complete</Text>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="play-circle" size={14} color="#c7d2fe" />
                                <Text className="text-indigo-200 text-xs">Resume</Text>
                            </View>
                        </View>
                        <View className="h-1.5 bg-indigo-400/40 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export const ContinueLearning = memo(ContinueLearningComponent);

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContinueLearning } from '../../components/ContinueLearning';
import { CourseCard } from '../../components/CourseCard';
import { CourseSkeleton } from '../../components/CourseSkeleton';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SearchBar } from '../../components/SearchBar';
import { useCourses } from '../../hooks/useCourses';
import { useDebounce } from '../../hooks/useDebounce';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useThemeColors } from '../../hooks/useThemeColors';
import { drawerEvents } from '../../lib/drawerEvents';
import { useAuth } from '../../providers/AuthProvider';
import { Course } from '../../types';

const LEVEL_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

export default function HomeScreen() {
  const { user, localAvatar } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetworkStatus();
  const c = useThemeColors();

  const { courses, loading, refreshing, error, lastOpened, refresh, toggleBookmark, retry } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState<typeof LEVEL_FILTERS[number]>('All');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredCourses = useMemo(() => {
    let result = courses;

    // Level filter
    if (activeLevel !== 'All') {
      result = result.filter(c => c.level === activeLevel);
    }

    // Search filter
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
      );
    }

    return result;
  }, [debouncedQuery, activeLevel, courses]);

  // Navigate to detail — pass serialized course as param to avoid extra API call
  const handleCoursePress = useCallback((course: Course) => {
    router.push({
      pathname: '/course/[id]',
      params: {
        id: String(course.id),
        courseData: JSON.stringify(course),
      },
    } as any);
  }, [router]);

  const handleLastOpenedPress = useCallback(() => {
    if (lastOpened) router.push(`/course/${lastOpened.id}` as any);
  }, [lastOpened, router]);

  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  const renderItem = useCallback(({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={handleCoursePress} onBookmark={toggleBookmark} />
  ), [handleCoursePress, toggleBookmark]);

  const firstName = user?.name?.split(' ')[0] ?? 'Learner';

  const ListHeader = useMemo(() => (
    <>
      {lastOpened && (
        <ContinueLearning course={lastOpened} onPress={handleLastOpenedPress} />
      )}
      <View style={{ paddingHorizontal: 4, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: c.textPrimary }}>
          {debouncedQuery
            ? `Results for "${debouncedQuery}"`
            : activeLevel !== 'All'
              ? `${activeLevel} Courses`
              : 'All Courses'}
        </Text>
        <Text style={{ fontSize: 13, color: c.textMuted }}>{filteredCourses.length} courses</Text>
      </View>
    </>
  ), [lastOpened, handleLastOpenedPress, debouncedQuery, activeLevel, filteredCourses.length, c]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {!isOnline && <OfflineBanner />}

      {/* Header */}
      <View style={{
        backgroundColor: c.bgCard,
        paddingHorizontal: 16,
        paddingTop: insets.top + 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: c.borderLight,
      }}>
        {/* Greeting row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/(profile)/edit-profile' as any)} activeOpacity={0.85}>
              <View style={{
                width: 46, height: 46, borderRadius: 23,
                backgroundColor: '#6366f1',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: localAvatar ? '#6366f1' : c.border,
                overflow: 'hidden',
              }}>
                {localAvatar ? (
                  <Image source={{ uri: localAvatar }} style={{ width: 46, height: 46 }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: c.textPrimary }}>
                Hi, {firstName} 👋
              </Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>
                What do you want to learn today?
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => drawerEvents.open()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.iconBg, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="menu" size={22} color={c.iconColor} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Level filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {LEVEL_FILTERS.map(level => {
            const active = activeLevel === level;
            return (
              <TouchableOpacity
                key={level}
                onPress={() => setActiveLevel(level)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: active ? '#6366f1' : c.bgSecondary,
                  borderWidth: 1,
                  borderColor: active ? '#6366f1' : c.border,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : c.textSecondary }}>
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Error full screen */}
      {error && courses.length === 0 && !loading && (
        <ErrorDisplay error={{ message: error }} onRetry={retry} />
      )}

      {/* Skeleton */}
      {loading && courses.length === 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CourseSkeleton />
        </View>
      )}

      {/* Course list */}
      {(!loading || courses.length > 0) && !error && (
        <FlatList
          data={filteredCourses}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 80,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#6366f1"
              colors={['#6366f1']}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                <Ionicons name="search-outline" size={40} color={c.textMuted} />
                <Text style={{ color: c.textMuted, marginTop: 12, fontSize: 14 }}>
                  {debouncedQuery
                    ? `No courses match "${debouncedQuery}"`
                    : `No ${activeLevel} courses found`}
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={10}
          initialNumToRender={6}
          updateCellsBatchingPeriod={50}
        />
      )}

      {/* Inline error toast when cached data is shown */}
      {error && courses.length > 0 && (
        <View style={{
          position: 'absolute', bottom: 96, left: 16, right: 16,
          backgroundColor: '#1e293b', borderRadius: 16,
          paddingHorizontal: 16, paddingVertical: 12,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <Ionicons name="warning-outline" size={18} color="#fbbf24" />
          <Text style={{ color: '#fff', fontSize: 13, flex: 1 }}>Showing cached data</Text>
          <TouchableOpacity onPress={retry}>
            <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

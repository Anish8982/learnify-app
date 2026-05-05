import { useCallback, useEffect, useRef, useState } from 'react';
import { courseService } from '../lib/courseService';
import { useBookmarks } from '../providers/BookmarkProvider';
import { Course, LastOpenedCourse } from '../types';

interface UseCoursesState {
    courses: Course[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    lastOpened: LastOpenedCourse | null;
}

interface UseCoursesReturn extends UseCoursesState {
    refresh: () => Promise<void>;
    toggleBookmark: (id: string | number) => void;
    retry: () => void;
}

export function useCourses(): UseCoursesReturn {
    const { bookmarkedIds, toggle, isBookmarked } = useBookmarks();

    const [rawCourses, setRawCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastOpened, setLastOpened] = useState<LastOpenedCourse | null>(null);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const loadCourses = useCallback(async (isRefresh = false) => {
        if (!isMounted.current) return;

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        // Show cache immediately on first load
        if (!isRefresh) {
            const cached = await courseService.getCachedCourses();
            if (cached?.length && isMounted.current) {
                setRawCourses(cached);
                setLoading(false);
            }
        }

        try {
            const [fresh, opened] = await Promise.all([
                courseService.fetchCourses(),
                courseService.getLastOpened(),
            ]);

            if (!isMounted.current) return;

            courseService.cacheCourses(fresh);
            setRawCourses(fresh);
            setLastOpened(opened);
            setLoading(false);
            setRefreshing(false);
        } catch {
            if (!isMounted.current) return;
            setLoading(false);
            setRefreshing(false);
            if (rawCourses.length === 0) {
                setError('Failed to load courses. Please check your connection.');
            }
        }
    }, []);

    useEffect(() => { loadCourses(false); }, [loadCourses]);

    // Merge bookmark state from shared context into course list
    const courses: Course[] = rawCourses.map(c => ({
        ...c,
        isBookmarked: isBookmarked(c.id),
    }));

    const refresh = useCallback(() => loadCourses(true), [loadCourses]);
    const retry = useCallback(() => loadCourses(false), [loadCourses]);

    // Toggle via shared context — updates both home and bookmarks instantly
    const toggleBookmark = useCallback((id: string | number) => {
        const course = rawCourses.find(c => c.id === id);
        if (course) toggle(course);
    }, [rawCourses, toggle]);

    return { courses, loading, refreshing, error, lastOpened, refresh, toggleBookmark, retry };
}

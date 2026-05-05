import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { bookmarkStorage } from '../lib/bookmarkStorage';
import { courseService } from '../lib/courseService';
import { triggerBookmarkNotification } from '../services/notifications';
import { Course } from '../types';

interface BookmarkContextType {
    bookmarkedIds: Set<string | number>;
    bookmarkedCourses: Course[];
    isBookmarked: (id: string | number) => boolean;
    toggle: (course: Course) => void;
}

const BookmarkContext = createContext<BookmarkContextType>({
    bookmarkedIds: new Set(),
    bookmarkedCourses: [],
    isBookmarked: () => false,
    toggle: () => { },
});

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string | number>>(new Set());
    const [allCourses, setAllCourses] = useState<Course[]>([]);

    // Load persisted bookmarks + course cache on mount
    useEffect(() => {
        const init = async () => {
            const [ids, cached] = await Promise.all([
                bookmarkStorage.getAll(),
                courseService.getCachedCourses(),
            ]);
            setBookmarkedIds(new Set(ids));
            if (cached?.length) setAllCourses(cached);
        };
        init();
    }, []);

    // Keep allCourses in sync when cache is updated (after home fetches)
    useEffect(() => {
        const interval = setInterval(async () => {
            const cached = await courseService.getCachedCourses();
            if (cached?.length) {
                setAllCourses(prev => {
                    // Merge cached courses with existing bookmarked courses
                    // Preserve bookmarked courses that might not be in cache
                    const cachedMap = new Map(cached.map(c => [c.id, c]));
                    const merged = prev.map(c => cachedMap.get(c.id) || c);

                    // Add any new cached courses not in prev
                    cached.forEach(c => {
                        if (!prev.some(p => p.id === c.id)) {
                            merged.push(c);
                        }
                    });

                    return merged;
                });
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const toggle = useCallback((course: Course) => {
        setBookmarkedIds(prev => {
            const next = new Set(prev);
            const isAdding = !next.has(course.id);

            if (isAdding) {
                next.add(course.id);
                // Ensure this course is in allCourses so bookmarks tab can show it
                setAllCourses(courses => {
                    const exists = courses.some(c => c.id === course.id);
                    if (exists) {
                        // Update existing course with latest data (including thumbnail)
                        return courses.map(c => c.id === course.id ? course : c);
                    }
                    return [...courses, course];
                });

                // Trigger notification if we just hit the threshold
                triggerBookmarkNotification(next.size);
            } else {
                next.delete(course.id);
            }

            // Persist asynchronously
            bookmarkStorage.toggle(course.id);
            return next;
        });
    }, []);

    const isBookmarked = useCallback(
        (id: string | number) => bookmarkedIds.has(id),
        [bookmarkedIds],
    );

    const bookmarkedCourses = allCourses
        .filter(c => bookmarkedIds.has(c.id))
        .map(c => ({ ...c, isBookmarked: true }));

    return (
        <BookmarkContext.Provider
            value={{ bookmarkedIds, bookmarkedCourses, isBookmarked, toggle }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export const useBookmarks = () => useContext(BookmarkContext);

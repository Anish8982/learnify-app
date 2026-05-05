import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, CourseLevel, RawProduct, RawUser } from '../types';
import { apiClient } from './apiClient';

const COURSES_CACHE_KEY = '@learnify_courses_cache';
const LAST_OPENED_KEY = '@learnify_last_opened';
const PLACEHOLDER = 'https://picsum.photos/seed';

// ─── Helpers ────────────────────────────────────────────────────────────────

function deriveLevel(price: number): CourseLevel {
    if (price > 1000) return 'Advanced';
    if (price > 500) return 'Intermediate';
    return 'Beginner';
}

function cleanImageUrl(url: string): string {
    // Some product images come wrapped in JSON arrays as strings
    try {
        if (url.startsWith('[')) {
            const parsed = JSON.parse(url);
            return Array.isArray(parsed) ? parsed[0] : url;
        }
    } catch {
        // ignore
    }
    return url;
}

function resolveThumbnail(product: RawProduct): string {
    // Priority: thumbnail field → images[0] → placeholder
    if (product.thumbnail && product.thumbnail.startsWith('http')) {
        return cleanImageUrl(product.thumbnail);
    }
    if (product.images?.length) {
        const first = cleanImageUrl(product.images[0]);
        if (first.startsWith('http')) return first;
    }
    return `${PLACEHOLDER}/${product.id}/400/300`;
}

// ─── API fetchers ────────────────────────────────────────────────────────────

async function fetchProducts(limit = 20): Promise<RawProduct[]> {
    const { data } = await apiClient.get(`/public/randomproducts?limit=${limit}`);
    return data?.data?.data ?? data?.data ?? [];
}

async function fetchInstructors(limit = 20): Promise<RawUser[]> {
    const { data } = await apiClient.get(`/public/randomusers?limit=${limit}`);
    return data?.data?.data ?? data?.data ?? [];
}

// ─── Merge ───────────────────────────────────────────────────────────────────

function mergeCoursesWithInstructors(
    products: RawProduct[],
    users: RawUser[],
): Course[] {
    if (!users.length || !products.length) return [];

    return products.map((product, index) => {
        const user = users[index % users.length];
        const priceINR = Math.round(product.price * 83);

        return {
            id: product.id,
            // Spec: title → "Complete Guide to {product.title}"
            title: `Complete Guide to ${product.title}`,
            description: product.description,
            thumbnail: resolveThumbnail(product),
            instructor: `${user.name.first} ${user.name.last}`,
            instructorAvatar: user.picture?.medium,
            price: priceINR,
            originalPrice: product.price,
            // Spec: level derived from price (price > 1000 INR = Advanced, else Beginner)
            level: deriveLevel(priceINR),
            category: product.category ?? 'General',
            rating: product.rating
                ? parseFloat(product.rating.toFixed(1))
                : parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            isBookmarked: false,
        };
    });
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const courseService = {
    async fetchCourses(): Promise<Course[]> {
        const [products, users] = await Promise.all([
            fetchProducts(20),
            fetchInstructors(20),
        ]);
        return mergeCoursesWithInstructors(products, users);
    },

    async getCachedCourses(): Promise<Course[] | null> {
        try {
            const raw = await AsyncStorage.getItem(COURSES_CACHE_KEY);
            return raw ? (JSON.parse(raw) as Course[]) : null;
        } catch {
            return null;
        }
    },

    async cacheCourses(courses: Course[]): Promise<void> {
        try {
            await AsyncStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(courses));
        } catch {
            // Non-fatal
        }
    },

    async getLastOpened() {
        try {
            const raw = await AsyncStorage.getItem(LAST_OPENED_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    async saveLastOpened(course: Course, progress: number): Promise<void> {
        try {
            await AsyncStorage.setItem(
                LAST_OPENED_KEY,
                JSON.stringify({
                    id: course.id,
                    title: course.title,
                    thumbnail: course.thumbnail,
                    instructor: course.instructor,
                    progress,
                }),
            );
        } catch {
            // Non-fatal
        }
    },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@learnify_bookmarks';

export const bookmarkStorage = {
    async getAll(): Promise<Set<string | number>> {
        try {
            const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
            const arr: (string | number)[] = raw ? JSON.parse(raw) : [];
            return new Set(arr);
        } catch {
            return new Set();
        }
    },

    async toggle(id: string | number): Promise<boolean> {
        const bookmarks = await this.getAll();
        const isNowBookmarked = !bookmarks.has(id);
        if (isNowBookmarked) {
            bookmarks.add(id);
        } else {
            bookmarks.delete(id);
        }
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...bookmarks]));
        return isNowBookmarked;
    },

    async isBookmarked(id: string | number): Promise<boolean> {
        const bookmarks = await this.getAll();
        return bookmarks.has(id);
    },

    async saveAll(ids: (string | number)[]): Promise<void> {
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
    },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const ENROLLED_KEY = '@learnify_enrolled';

export const enrollStorage = {
    async getAll(): Promise<Set<string | number>> {
        try {
            const raw = await AsyncStorage.getItem(ENROLLED_KEY);
            const arr: (string | number)[] = raw ? JSON.parse(raw) : [];
            return new Set(arr);
        } catch {
            return new Set();
        }
    },

    async enroll(id: string | number): Promise<void> {
        const enrolled = await this.getAll();
        enrolled.add(id);
        await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify([...enrolled]));
    },

    async isEnrolled(id: string | number): Promise<boolean> {
        const enrolled = await this.getAll();
        return enrolled.has(id);
    },

    async getCount(): Promise<number> {
        const enrolled = await this.getAll();
        return enrolled.size;
    },
};

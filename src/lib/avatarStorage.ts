import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = '@learnify_avatar_uri';

export const avatarStorage = {
    async save(uri: string): Promise<void> {
        await AsyncStorage.setItem(AVATAR_KEY, uri);
    },

    async get(): Promise<string | null> {
        return AsyncStorage.getItem(AVATAR_KEY);
    },

    async remove(): Promise<void> {
        await AsyncStorage.removeItem(AVATAR_KEY);
    },
};

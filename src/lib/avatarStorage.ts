import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const AVATAR_KEY = '@learnify_avatar_uri';
const AVATAR_FILENAME = 'profile_avatar.jpg';

export const avatarStorage = {
    /**
     * Save avatar image to permanent storage
     * Copies the image from temp location to app's document directory
     */
    async save(uri: string): Promise<string> {
        try {
            // Create permanent file path
            const permanentUri = `${FileSystem.documentDirectory}${AVATAR_FILENAME}`;

            // Copy image to permanent location
            await FileSystem.copyAsync({
                from: uri,
                to: permanentUri,
            });

            // Save the permanent URI to AsyncStorage
            await AsyncStorage.setItem(AVATAR_KEY, permanentUri);

            return permanentUri;
        } catch (error) {
            console.error('Failed to save avatar:', error);
            // Fallback: save original URI
            await AsyncStorage.setItem(AVATAR_KEY, uri);
            return uri;
        }
    },

    /**
     * Get saved avatar URI from storage
     */
    async get(): Promise<string | null> {
        try {
            const uri = await AsyncStorage.getItem(AVATAR_KEY);

            if (!uri) return null;

            // Check if file still exists
            const fileInfo = await FileSystem.getInfoAsync(uri);

            if (fileInfo.exists) {
                return uri;
            } else {
                // File was deleted, clean up storage
                await this.remove();
                return null;
            }
        } catch (error) {
            console.error('Failed to get avatar:', error);
            return null;
        }
    },

    /**
     * Remove avatar from storage
     */
    async remove(): Promise<void> {
        try {
            const uri = await AsyncStorage.getItem(AVATAR_KEY);

            if (uri) {
                // Try to delete the file
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (fileInfo.exists) {
                    await FileSystem.deleteAsync(uri, { idempotent: true });
                }
            }

            // Remove from AsyncStorage
            await AsyncStorage.removeItem(AVATAR_KEY);
        } catch (error) {
            console.error('Failed to remove avatar:', error);
            // Still remove from AsyncStorage even if file deletion fails
            await AsyncStorage.removeItem(AVATAR_KEY);
        }
    },
};

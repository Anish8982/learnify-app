import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const LAST_OPEN_KEY = '@learnify_last_open';
const BOOKMARK_NOTIF_KEY = '@learnify_bookmark_notif_sent';
const INACTIVITY_NOTIF_ID = '@learnify_inactivity_notif_id';

// ─── Configuration ───────────────────────────────────────────────────────────

const BOOKMARK_THRESHOLD = 5;
const INACTIVITY_HOURS = 24;

// ─── Configure Foreground Notification Behavior ──────────────────────────────

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ─── 1. Permission Handling ──────────────────────────────────────────────────

/**
 * Requests notification permissions for LOCAL notifications only.
 * - iOS: Shows permission dialog
 * - Android: Auto-granted for local notifications
 * 
 * @returns Promise<boolean> - true if permission is granted
 */
export async function requestPermission(): Promise<boolean> {
    try {
        const settings = await Notifications.getPermissionsAsync();

        let status = settings.status;

        if (status !== 'granted') {
            const req = await Notifications.requestPermissionsAsync();
            status = req.status;
        }

        return status === 'granted';
    } catch (error) {
        console.error('Permission error:', error);
        return false;
    }
}

// ─── 2. Bookmark Milestone Notification ──────────────────────────────────────

/**
 * Triggers an instant LOCAL notification when user bookmarks exactly 5 courses.
 * Resets when count drops below 5, so it fires again next time user reaches 5.
 *
 * @param currentCount - Current number of bookmarked courses
 */
export async function triggerBookmarkNotification(
    currentCount: number,
): Promise<void> {
    try {
        // If count dropped below threshold, reset the flag so it can fire again
        if (currentCount < BOOKMARK_THRESHOLD) {
            await AsyncStorage.removeItem(BOOKMARK_NOTIF_KEY);
            return;
        }

        // Only trigger when exactly at threshold
        if (currentCount !== BOOKMARK_THRESHOLD) {
            return;
        }

        // Check if notification was already sent for this "cycle"
        const alreadySent = await AsyncStorage.getItem(BOOKMARK_NOTIF_KEY);
        if (alreadySent === 'true') {
            return;
        }

        // Request permission
        const granted = await requestPermission();
        if (!granted) {
            return;
        }

        // Schedule immediate LOCAL notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Nice! 🎉',
                body: `You bookmarked ${BOOKMARK_THRESHOLD} courses. Time to start learning!`,
            },
            trigger: null, // null = fire immediately
        });

        // Mark as sent to prevent duplicates within this cycle
        await AsyncStorage.setItem(BOOKMARK_NOTIF_KEY, 'true');
    } catch (error) {
        console.error('Error triggering bookmark notification:', error);
    }
}

// ─── 3. 24-Hour Inactivity Reminder ──────────────────────────────────────────

/**
 * Schedules a LOCAL notification to fire 24 hours from now.
 * Uses scheduleNotificationAsync with TIME_INTERVAL trigger.
 * 
 * Called on every app start to implement a rolling reminder.
 */
export async function scheduleInactivityReminder(): Promise<void> {
    try {
        // Request permission
        const granted = await requestPermission();
        if (!granted) {
            return;
        }

        // Save current timestamp as last open time
        await AsyncStorage.setItem(LAST_OPEN_KEY, Date.now().toString());

        // Cancel any previously scheduled notification
        const previousNotifId = await AsyncStorage.getItem(INACTIVITY_NOTIF_ID);
        if (previousNotifId) {
            await Notifications.cancelScheduledNotificationAsync(previousNotifId).catch(() => { });
        }

        // Schedule new LOCAL notification 24 hours from now
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'We miss you 👀',
                body: 'Come back and continue your learning!',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: INACTIVITY_HOURS * 60 * 60, // 24 hours in seconds
            },
        });

        // Store notification ID for future cancellation
        await AsyncStorage.setItem(INACTIVITY_NOTIF_ID, notificationId);
    } catch (error) {
        console.error('Error scheduling inactivity reminder:', error);
    }
}

// ─── 4. Android Notification Channel Setup ───────────────────────────────────

/**
 * Creates the default notification channel for Android 8.0+ (API 26+).
 * Required for LOCAL notifications to work on modern Android devices.
 */
export async function setupAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') {
        return;
    }

    try {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Learnify Notifications',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6366f1',
        });
    } catch (error) {
        console.error('Error setting up Android notification channel:', error);
    }
}

// ─── 5. Initialize Notification System ───────────────────────────────────────

/**
 * Initializes the LOCAL notification system.
 * Call this once on app startup.
 * 
 * Only uses:
 * - requestPermissionsAsync()
 * - scheduleNotificationAsync()
 * 
 * NO push notification code!
 */
export async function initializeNotifications(): Promise<void> {
    try {
        // Setup Android channel first (no-op on iOS)
        await setupAndroidChannel();

        // Request permissions and schedule reminder
        const granted = await requestPermission();
        if (granted) {
            await scheduleInactivityReminder();
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}

// ─── 6. Reset Bookmark Notification (for testing) ────────────────────────────

/**
 * Resets the bookmark notification flag for testing.
 */
export async function resetBookmarkNotification(): Promise<void> {
    try {
        await AsyncStorage.removeItem(BOOKMARK_NOTIF_KEY);
    } catch (error) {
        console.error('Error resetting bookmark notification:', error);
    }
}

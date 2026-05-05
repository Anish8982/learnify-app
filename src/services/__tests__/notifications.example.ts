/**
 * Notification System Usage Examples
 * 
 * This file demonstrates how to use the notification service.
 * These are examples only - the actual integration is already done in:
 * - src/app/_layout.tsx (app startup)
 * - src/providers/BookmarkProvider.tsx (bookmark toggle)
 */

import {
    initializeNotifications,
    requestPermission,
    resetBookmarkNotification,
    scheduleInactivityReminder,
    setupAndroidChannel,
    triggerBookmarkNotification,
} from '../notifications';

// ─── Example 1: Initialize on App Startup ────────────────────────────────────

/**
 * Call this once when your app starts.
 * Already implemented in src/app/_layout.tsx
 */
async function exampleAppStartup() {
    // This single call handles everything:
    // - Android channel setup
    // - Permission request
    // - 24-hour inactivity reminder scheduling
    await initializeNotifications();
}

// ─── Example 2: Manual Permission Request ────────────────────────────────────

/**
 * Request permission manually (optional - initializeNotifications does this)
 */
async function exampleRequestPermission() {
    const granted = await requestPermission();

    if (granted) {
        console.log('✅ Notification permission granted');
    } else {
        console.log('❌ Notification permission denied');
    }
}

// ─── Example 3: Trigger Bookmark Notification ────────────────────────────────

/**
 * Call this when user bookmarks a course.
 * Already implemented in src/providers/BookmarkProvider.tsx
 */
async function exampleBookmarkToggle(bookmarkedCount: number) {
    // This will only trigger notification when count === 5
    // and only once (uses persistent flag)
    await triggerBookmarkNotification(bookmarkedCount);
}

// ─── Example 4: Schedule Inactivity Reminder ──────────────────────────────────

/**
 * Schedule a 24-hour reminder (optional - initializeNotifications does this)
 */
async function exampleScheduleReminder() {
    // This will:
    // 1. Save current timestamp
    // 2. Cancel any previous reminder
    // 3. Schedule new reminder 24 hours from now
    await scheduleInactivityReminder();
}

// ─── Example 5: Setup Android Channel ─────────────────────────────────────────

/**
 * Setup Android notification channel (optional - initializeNotifications does this)
 */
async function exampleSetupAndroid() {
    // No-op on iOS, creates channel on Android
    await setupAndroidChannel();
}

// ─── Example 6: Reset Bookmark Notification (Testing Only) ────────────────────

/**
 * Reset the bookmark notification flag for testing.
 * NOT for production use - only for debugging.
 */
async function exampleResetForTesting() {
    await resetBookmarkNotification();
    console.log('✅ Bookmark notification flag reset - you can trigger it again');
}

// ─── Example 7: Complete Integration Example ──────────────────────────────────

/**
 * Complete example showing how everything works together
 */
async function exampleCompleteFlow() {
    // 1. App starts
    console.log('📱 App starting...');
    await initializeNotifications();
    console.log('✅ Notifications initialized');

    // 2. User bookmarks courses
    console.log('📚 User bookmarking courses...');
    await triggerBookmarkNotification(1); // No notification
    await triggerBookmarkNotification(2); // No notification
    await triggerBookmarkNotification(3); // No notification
    await triggerBookmarkNotification(4); // No notification
    await triggerBookmarkNotification(5); // 🎉 Notification fires!
    console.log('✅ Bookmark milestone reached');

    // 3. User closes app
    console.log('👋 User closes app');

    // 4. 24 hours later...
    console.log('⏰ 24 hours pass...');
    console.log('📬 Inactivity reminder notification fires!');

    // 5. User opens app again
    console.log('📱 User opens app again');
    await initializeNotifications(); // Reschedules reminder
    console.log('✅ New 24-hour reminder scheduled');
}

// ─── Example 8: Error Handling ────────────────────────────────────────────────

/**
 * All notification functions handle errors gracefully
 */
async function exampleErrorHandling() {
    try {
        // Even if this fails, it won't crash your app
        await triggerBookmarkNotification(5);
    } catch (error) {
        // Errors are caught internally, but you can add extra handling
        console.error('Notification error:', error);
    }

    // App continues normally
    console.log('✅ App continues even if notifications fail');
}

// ─── Example 9: Check Permission Status ───────────────────────────────────────

/**
 * Check current permission status
 */
async function exampleCheckPermission() {
    const granted = await requestPermission();

    if (granted) {
        console.log('✅ Notifications enabled');
        // Proceed with notification features
    } else {
        console.log('ℹ️ Notifications disabled');
        // App works fine without notifications
        // Optionally show a message to user
    }
}

// ─── Example 10: Testing Workflow ─────────────────────────────────────────────

/**
 * Testing workflow for bookmark notification
 */
async function exampleTestingWorkflow() {
    console.log('🧪 Testing bookmark notification...');

    // Step 1: Reset the flag
    await resetBookmarkNotification();
    console.log('1️⃣ Flag reset');

    // Step 2: Trigger with count = 5
    await triggerBookmarkNotification(5);
    console.log('2️⃣ Notification triggered');

    // Step 3: Try again (should not fire)
    await triggerBookmarkNotification(5);
    console.log('3️⃣ Second attempt blocked (as expected)');

    console.log('✅ Test complete');
}

// ─── Export Examples ──────────────────────────────────────────────────────────

export const examples = {
    exampleAppStartup,
    exampleRequestPermission,
    exampleBookmarkToggle,
    exampleScheduleReminder,
    exampleSetupAndroid,
    exampleResetForTesting,
    exampleCompleteFlow,
    exampleErrorHandling,
    exampleCheckPermission,
    exampleTestingWorkflow,
};

// ─── Usage Notes ──────────────────────────────────────────────────────────────

/**
 * IMPORTANT NOTES:
 * 
 * 1. You don't need to call these functions manually - they're already integrated:
 *    - initializeNotifications() is called in src/app/_layout.tsx
 *    - triggerBookmarkNotification() is called in src/providers/BookmarkProvider.tsx
 * 
 * 2. All functions are async and return Promises
 * 
 * 3. All functions handle errors gracefully - they won't crash your app
 * 
 * 4. Notifications are optional - app works fine even if permissions are denied
 * 
 * 5. For testing, you can temporarily reduce INACTIVITY_HOURS in notifications.ts
 * 
 * 6. On iOS Simulator, you can reset permissions via:
 *    Device → Erase All Content and Settings
 * 
 * 7. On Android Emulator, you can toggle permissions via:
 *    Settings → Apps → Learnify → Notifications
 */

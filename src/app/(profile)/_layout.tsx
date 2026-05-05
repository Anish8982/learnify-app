import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="my-courses" />
            <Stack.Screen name="certificates" />
            <Stack.Screen name="progress" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="help" />
            <Stack.Screen name="about" />
        </Stack>
    );
}

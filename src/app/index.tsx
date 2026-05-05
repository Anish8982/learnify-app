import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../providers/AuthProvider';

export default function Index() {
    let auth;

    try {
        auth = useAuth();
    } catch {
        // Providers not ready yet — render blank while layout initializes
        return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
    }

    if (auth.isLoading) {
        return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
    }

    if (auth.user) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/login" />;
}

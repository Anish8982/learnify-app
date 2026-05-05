import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ProfileScreenHeader } from '../../components/ProfileScreenHeader';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAuth } from '../../providers/AuthProvider';

async function requestPermission(type: 'camera' | 'library'): Promise<boolean> {
    if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
}

async function pickFromLibrary(): Promise<string | null> {
    const granted = await requestPermission('library');
    if (!granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library in Settings.');
        return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
}

async function pickFromCamera(): Promise<string | null> {
    const granted = await requestPermission('camera');
    if (!granted) {
        Alert.alert('Permission Required', 'Please allow camera access in Settings.');
        return null;
    }
    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
}

export default function EditProfileScreen() {
    const { user, localAvatar, updateAvatar } = useAuth();
    const router = useRouter();
    const c = useThemeColors();

    const [name, setName] = useState(user?.name ?? '');
    const [email] = useState(user?.email ?? '');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [saving, setSaving] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(localAvatar);
    const [avatarKey, setAvatarKey] = useState(0);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const initials = name
        ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handlePickImage = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo'], cancelButtonIndex: 0, destructiveButtonIndex: 3 },
                async (index) => {
                    if (index === 1) await handleSource('camera');
                    if (index === 2) await handleSource('library');
                    if (index === 3) handleRemoveAvatar();
                },
            );
        } else {
            Alert.alert('Profile Photo', 'Choose an option', [
                { text: 'Take Photo', onPress: () => handleSource('camera') },
                { text: 'Choose from Library', onPress: () => handleSource('library') },
                { text: 'Remove Photo', style: 'destructive', onPress: handleRemoveAvatar },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    const handleSource = async (source: 'camera' | 'library') => {
        setAvatarLoading(true);
        try {
            const uri = source === 'camera' ? await pickFromCamera() : await pickFromLibrary();
            if (uri) {
                // Update avatar in storage
                const permanentUri = await updateAvatar(uri);
                // Update local state
                setAvatarUri(permanentUri);
                setAvatarKey(k => k + 1);

                Alert.alert('Success', 'Profile photo updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update avatar:', error);
            Alert.alert('Error', 'Failed to update profile photo. Please try again.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setAvatarUri(null);
            setAvatarKey(k => k + 1);
            await updateAvatar('');
            Alert.alert('Success', 'Profile photo removed successfully!');
        } catch (error) {
            console.error('Failed to remove avatar:', error);
            Alert.alert('Error', 'Failed to remove profile photo. Please try again.');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Name cannot be empty.');
            return;
        }
        setSaving(true);
        // Simulate API save — wire to Firebase updateProfile in production
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        Alert.alert('Saved', 'Your profile has been updated.', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    const fields = [
        { label: 'Full Name', value: name, onChange: setName, icon: 'person-outline', placeholder: 'Your full name', editable: true },
        { label: 'Email', value: email, onChange: () => { }, icon: 'mail-outline', placeholder: 'Email address', editable: false, hint: 'Email cannot be changed here' },
        { label: 'Bio', value: bio, onChange: setBio, icon: 'document-text-outline', placeholder: 'Tell us about yourself...', editable: true, multiline: true },
        { label: 'Website', value: website, onChange: setWebsite, icon: 'globe-outline', placeholder: 'https://yourwebsite.com', editable: true },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: c.bg }}>
            <ProfileScreenHeader title="Edit Profile" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar picker */}
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85} style={{ position: 'relative' }}>
                            {/* Avatar circle */}
                            <View style={{
                                width: 104, height: 104, borderRadius: 52,
                                backgroundColor: '#6366f1',
                                alignItems: 'center', justifyContent: 'center',
                                borderWidth: 3, borderColor: c.border,
                                overflow: 'hidden',
                            }}>
                                {avatarLoading ? (
                                    <ActivityIndicator color="#fff" size="large" />
                                ) : avatarUri ? (
                                    <Image key={avatarKey} source={{ uri: avatarUri }} style={{ width: 104, height: 104 }} resizeMode="cover" />
                                ) : (
                                    <Text style={{ color: '#fff', fontSize: 34, fontWeight: '700' }}>{initials}</Text>
                                )}
                            </View>

                            {/* Camera badge */}
                            <View style={{
                                position: 'absolute', bottom: 2, right: 2,
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: '#6366f1',
                                borderWidth: 2, borderColor: c.bgCard,
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Ionicons name="camera" size={15} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 10 }}>
                            Tap to change photo
                        </Text>

                        {/* Quick action chips */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                            <TouchableOpacity
                                onPress={() => handleSource('library')}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
                            >
                                <Ionicons name="images-outline" size={14} color="#6366f1" />
                                <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSource('camera')}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
                            >
                                <Ionicons name="camera-outline" size={14} color="#6366f1" />
                                <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '600' }}>Camera</Text>
                            </TouchableOpacity>
                            {avatarUri ? (
                                <TouchableOpacity
                                    onPress={handleRemoveAvatar}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}
                                >
                                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                                    <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Remove</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                    {/* Form fields */}
                    {fields.map((field) => (
                        <View key={field.label} style={{ marginBottom: 16 }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginLeft: 4 }}>
                                {field.label}
                            </Text>
                            <View style={{
                                flexDirection: 'row', alignItems: 'flex-start',
                                backgroundColor: c.bgCard, borderRadius: 16,
                                borderWidth: 1, borderColor: field.editable ? c.border : c.borderLight,
                                paddingHorizontal: 16, opacity: field.editable ? 1 : 0.55,
                            }}>
                                <Ionicons name={field.icon as any} size={18} color={c.textMuted} style={{ marginTop: 16 }} />
                                <TextInput
                                    style={{
                                        flex: 1, color: c.textPrimary,
                                        paddingVertical: 16, paddingHorizontal: 12, fontSize: 15,
                                        ...(field.multiline ? { minHeight: 80, textAlignVertical: 'top' } : {}),
                                    }}
                                    placeholder={field.placeholder}
                                    placeholderTextColor={c.textMuted}
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    editable={field.editable}
                                    multiline={field.multiline}
                                    numberOfLines={field.multiline ? 3 : 1}
                                />
                            </View>
                            {field.hint && (
                                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 4, marginLeft: 4 }}>{field.hint}</Text>
                            )}
                        </View>
                    ))}

                    {/* Save */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: '#6366f1', borderRadius: 16,
                            paddingVertical: 16, alignItems: 'center',
                            marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 8,
                        }}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

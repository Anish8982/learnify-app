import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

function SearchBarComponent({ value, onChangeText, placeholder = 'Search courses or instructors...' }: Props) {
    const c = useThemeColors();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgInput, borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: c.border }}>
            <Ionicons name="search-outline" size={18} color={c.textMuted} />
            <TextInput
                style={{ flex: 1, color: c.textPrimary, fontSize: 14, paddingHorizontal: 12 }}
                placeholder={placeholder}
                placeholderTextColor={c.textMuted}
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color={c.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );
}

export const SearchBar = memo(SearchBarComponent);

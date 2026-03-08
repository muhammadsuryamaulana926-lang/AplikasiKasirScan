import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';
import { BorderRadius, FontSize, Spacing } from '../../theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder = 'Cari...', style }) => {
    const { colors } = useApp();

    return (
        <View style={[styles.container, { backgroundColor: colors.surfaceVariant || '#F3F4F6', borderColor: colors.border || '#E5E7EB' }, style]}>
            <Search size={18} color={colors.textTertiary || '#9CA3AF'} />
            <TextInput
                style={[styles.input, { color: colors.text || '#1F2937' }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary || '#9CA3AF'}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')}>
                    <X size={18} color={colors.textTertiary || '#9CA3AF'} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSize.md,
        paddingVertical: 2, // Fix vertical alignment on Android
    },
});

export default SearchBar;

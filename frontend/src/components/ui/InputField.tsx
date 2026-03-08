import React from 'react';
import { View, Text, TextInput, StyleSheet, StyleProp, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { useApp } from '../../store/AppContext';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../theme';

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: KeyboardTypeOptions;
    multiline?: boolean;
    error?: string;
    editable?: boolean;
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    error,
    editable = true,
    style,
    backgroundColor,
}) => {
    const { colors } = useApp();

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: backgroundColor || colors.surfaceVariant,
                        color: colors.text,
                        borderColor: error ? colors.danger : colors.border,
                    },
                    multiline && styles.multiline,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textTertiary || '#9CA3AF'}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                editable={editable}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
            {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: Spacing.lg },
    label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: Spacing.xs },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4, // Slightly taller
        fontSize: FontSize.md,
    },
    multiline: { minHeight: 100 },
    error: { fontSize: FontSize.xs, marginTop: Spacing.xs },
});

export default InputField;

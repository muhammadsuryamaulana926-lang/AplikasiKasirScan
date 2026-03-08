import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useApp } from '../../store/AppContext';
import { BorderRadius, FontSize, FontWeight } from '../../theme';

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean; // Added rounded prop
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    rounded = false,
    icon,
    loading,
    disabled,
    style,
    textStyle
}) => {
    const { colors } = useApp();

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return { bg: colors.primary, text: '#FFFFFF', border: colors.primary };
            case 'secondary': // Success green in new theme
                return { bg: colors.secondary, text: '#FFFFFF', border: colors.secondary };
            case 'accent': // Blue
                return { bg: colors.accent, text: '#FFFFFF', border: colors.accent };
            case 'danger':
                return { bg: colors.danger, text: '#FFFFFF', border: colors.danger };
            case 'outline':
                return { bg: 'transparent', text: colors.primary, border: colors.primary };
            case 'ghost':
                return { bg: 'transparent', text: colors.textSecondary, border: 'transparent' };
            default:
                return { bg: colors.primary, text: '#FFFFFF', border: colors.primary };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 5, paddingHorizontal: 12, fontSize: FontSize.xs };
            case 'lg': return { paddingVertical: 12, paddingHorizontal: 24, fontSize: FontSize.lg };
            default: return { paddingVertical: 9, paddingHorizontal: 16, fontSize: FontSize.md };
        }
    };

    const v = getVariantStyles();
    const s = getSizeStyles();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[
                styles.button,
                {
                    backgroundColor: v.bg,
                    borderColor: v.border,
                    paddingVertical: s.paddingVertical,
                    paddingHorizontal: s.paddingHorizontal,
                    borderRadius: rounded ? 999 : BorderRadius.md, // Logic for rounded
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={[
                        styles.text,
                        {
                            color: v.text,
                            fontSize: s.fontSize,
                            marginLeft: icon ? 8 : 0
                        },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.0, // Dipertipis
    },
    text: {
        fontWeight: FontWeight.semibold,
    },
});

export default Button;

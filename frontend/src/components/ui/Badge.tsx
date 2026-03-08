import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../../store/AppContext';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../theme';

interface BadgeProps {
    text: string | number;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
    size?: 'sm' | 'md';
    style?: any;
}

const Badge: React.FC<BadgeProps> = ({ text, variant = 'primary', size = 'sm', style }) => {
    const { colors } = useApp();

    const getColors = () => {
        switch (variant) {
            case 'primary': return { bg: colors.infoLight, text: colors.primary };
            case 'success': return { bg: colors.successLight, text: colors.secondary };
            case 'warning': return { bg: colors.warningLight, text: '#92400E' };
            case 'danger': return { bg: colors.dangerLight, text: colors.danger };
            case 'info': return { bg: colors.infoLight, text: colors.info };
            case 'neutral': return { bg: colors.surfaceVariant, text: colors.textSecondary };
            default: return { bg: colors.infoLight, text: colors.primary };
        }
    };

    const c = getColors();
    const isSmall = size === 'sm';

    return (
        <View style={[styles.badge, { backgroundColor: c.bg, paddingHorizontal: isSmall ? 8 : 12, paddingVertical: isSmall ? 2 : 4 }, style]}>
            <Text style={[styles.text, { color: c.text, fontSize: isSmall ? FontSize.xs : FontSize.sm }]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: { borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
    text: { fontWeight: FontWeight.semibold },
});

export default Badge;

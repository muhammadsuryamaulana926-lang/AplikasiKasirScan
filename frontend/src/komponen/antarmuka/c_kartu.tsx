import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { gunakanApp } from '../../penyimpanan/pusat_data_aplikasi';
import { BorderRadius, Shadow, Spacing, FontSize, FontWeight } from '../../tema';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    style?: any;
    headerRight?: React.ReactNode;
    noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, style, headerRight, noPadding }) => {
    const { warna: colors } = gunakanApp();

    return (
        <View style={[styles.card, Shadow.sm, { backgroundColor: colors.surface }, style]}>
            {(title || headerRight) && (
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
                        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
                    </View>
                    {headerRight}
                </View>
            )}
            <View style={noPadding ? null : styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        borderWidth: 0,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    headerLeft: { flex: 1 },
    title: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    subtitle: {
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    content: {
        padding: Spacing.lg,
    },
});

export default Card;

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useApp } from '../../store/AppContext';
import { FontSize, FontWeight, Spacing } from '../../theme';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => {
    const { colors } = useApp();
    return (
        <View style={styles.container}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{subtitle}</Text>}
            {action && <View style={styles.action}>{action}</View>}
        </View>
    );
};

const LoadingSkeleton: React.FC<{ count?: number, variant?: 'list' | 'grid' }> = ({ count = 3, variant = 'list' }) => {
    const { colors } = useApp();

    if (variant === 'grid') {
        return (
            <View style={styles.skeletonGrid}>
                {Array.from({ length: count }).map((_, i) => (
                    <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surfaceVariant }]}>
                        <View style={[styles.skeletonImg, { backgroundColor: colors.border }]} />
                        <View style={styles.skeletonCardInfo}>
                            <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '90%' }]} />
                            <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '60%', marginTop: 8 }]} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={styles.skeletonContainer}>
            {Array.from({ length: count }).map((_, i) => (
                <View key={i} style={[styles.skeletonRow, { backgroundColor: colors.surfaceVariant }]}>
                    <View style={[styles.skeletonCircle, { backgroundColor: colors.border }]} />
                    <View style={styles.skeletonLines}>
                        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '70%' }]} />
                        <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '40%' }]} />
                    </View>
                </View>
            ))}
        </View>
    );
};

const LoadingScreen: React.FC = () => {
    const { colors } = useApp();
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat data...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, marginTop: Spacing.xxl },
    icon: { marginBottom: Spacing.lg },
    title: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, textAlign: 'center' },
    subtitle: { fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.sm },
    action: { marginTop: Spacing.xl },
    skeletonContainer: { padding: Spacing.lg, gap: Spacing.md },
    skeletonRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: 10, gap: Spacing.md },
    skeletonCircle: { width: 44, height: 44, borderRadius: 22 },
    skeletonLines: { flex: 1, gap: Spacing.sm },
    skeletonLine: { height: 12, borderRadius: 6 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: Spacing.md, fontSize: FontSize.md },
    skeletonGrid: {
        padding: Spacing.lg,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: Spacing.md
    },
    skeletonCard: {
        width: (Dimensions.get('window').width - (Spacing.lg * 2) - Spacing.md) / 2,
        height: 200,
        borderRadius: 12,
        overflow: 'hidden'
    },
    skeletonImg: {
        height: 120,
        width: '100%'
    },
    skeletonCardInfo: {
        padding: Spacing.sm,
        gap: 4
    },
});

export { EmptyState, LoadingSkeleton, LoadingScreen };

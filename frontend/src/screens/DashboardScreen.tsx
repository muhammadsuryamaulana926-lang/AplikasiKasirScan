import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { useApp } from '../store/AppContext';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    AlertTriangle,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    Package,
    MessageCircle
} from 'lucide-react-native';
import { Spacing, FontSize, FontWeight, formatRupiah, BorderRadius, Shadow } from '../theme';
import { LoadingScreen, EmptyState } from '../components/shared/States';
import AnimatedView from '../components/shared/AnimatedView';

const { width } = Dimensions.get('window');

// --- Components ---

const MetricCard = ({ title, value, icon, color, trend, index = 0 }: any) => {
    const { colors } = useApp();
    return (
        <AnimatedView delay={index * 100}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderRadius: BorderRadius.xl }, Shadow.sm]}>
                <View style={[styles.metricHeader]}>
                    <View style={[styles.metricIconBox, { backgroundColor: '#FFF' }]}>
                        {React.cloneElement(icon, { size: 20, color: color })}
                    </View>
                    {trend && (
                        <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? colors.success + '15' : colors.danger + '15' }]}>
                            {trend >= 0 ? <ArrowUpRight size={14} color={colors.success} /> : <ArrowDownRight size={14} color={colors.danger} />}
                            <Text style={[styles.trendText, { color: trend >= 0 ? colors.success : colors.danger }]}>{Math.abs(trend)}%</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
            </View>
        </AnimatedView>
    );
};

const QuickAction = ({ label, icon, color, onPress, index = 0 }: any) => {
    const { colors } = useApp();
    return (
        <AnimatedView delay={400 + (index * 100)}>
            <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
                <View style={[styles.actionIcon, { backgroundColor: '#FFF' }]}>
                    {React.cloneElement(icon, { size: 24, color: color })}
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
            </TouchableOpacity>
        </AnimatedView>
    );
};

const SectionHeader = ({ title, action }: any) => {
    const { colors } = useApp();
    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            {action && <TouchableOpacity onPress={action.onPress}><Text style={{ color: colors.primary, fontWeight: FontWeight.semibold }}>{action.label}</Text></TouchableOpacity>}
        </View>
    );
};

const TransactionItem = ({ item, index = 0 }: any) => {
    const { colors } = useApp();
    const isIncome = item.type === 'income'; // Assuming type exists or derive from context

    return (
        <AnimatedView delay={600 + (index * 100)}>
            <View style={[styles.transactionItem, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }, Shadow.sm]}>
                <View style={[styles.transactionIcon, { backgroundColor: '#FFF' }]}>
                    <ShoppingBag size={20} color={colors.primary} />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]}>{item.customer || 'Pelanggan Umum'}</Text>
                    <Text style={[styles.transactionSubtitle, { color: colors.textTertiary }]}>
                        {item?.items?.length || 0} items • {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: colors.text }]}>+{formatRupiah(item.total)}</Text>
            </View>
        </AnimatedView>
    );
};


// --- Main Screen ---

const DashboardScreen: React.FC = ({ navigation }: any) => {
    const { colors, fetchDashboard, dashboardData } = useApp(); // Removed loading usage to handle pull-refresh better
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    }, [fetchDashboard]);

    // Refresh data whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDashboard();
        }, [fetchDashboard])
    );

    // Live stats from backend
    const stats = {
        revenue: dashboardData?.summary?.[0]?.revenue || 0,
        transactions: dashboardData?.summary?.[0]?.transactions || 0,
        products: dashboardData?.totalProducts || 0, // Should be added to backend view or keep mock if not critical
        lowStock: dashboardData?.lowStockCount || 0,
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting Area handled by Header now */}

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    <MetricCard
                        title="Pendapatan"
                        value={formatRupiah(stats.revenue)}
                        icon={<Wallet />}
                        color={colors.primary}
                        trend={12} // Mock trend
                        index={0}
                    />
                    <MetricCard
                        title="Transaksi"
                        value={stats.transactions.toString()}
                        icon={<ShoppingBag />}
                        color={colors.accent}
                        trend={-5} // Mock trend
                        index={1}
                    />
                    <MetricCard
                        title="Total Produk"
                        value={stats.products.toString()}
                        icon={<Package />}
                        color={colors.secondary}
                        index={2}
                    />
                    <MetricCard
                        title="Stok Menipis"
                        value={stats.lowStock.toString()}
                        icon={<AlertTriangle />}
                        color={colors.danger}
                        index={3}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <SectionHeader title="Aksi Cepat" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
                        <QuickAction
                            label="Pembeli Baru"
                            icon={<Plus />}
                            color={colors.primary}
                            onPress={() => navigation.navigate('POS')}
                            index={0}
                        />
                        <QuickAction
                            label="Tambah Stok"
                            icon={<Package />}
                            color={colors.secondary}
                            onPress={() => navigation.navigate('Inventory')}
                            index={1}
                        />
                        <QuickAction
                            label="Catat Hutang"
                            icon={<CreditCard />}
                            color={colors.warning}
                            onPress={() => navigation.navigate('Debts', { tab: 'debts' })}
                            index={2}
                        />
                        <QuickAction
                            label="Penghutang"
                            icon={<Users />}
                            color={colors.info}
                            onPress={() => navigation.navigate('Debts', { tab: 'customers' })}
                            index={3}
                        />
                    </ScrollView>
                </View>

                {/* Recent Transactions */}
                <View style={[styles.section, { marginBottom: 100 }]}>
                    <SectionHeader title="Transaksi Terakhir" action={{ label: "Lihat Semua", onPress: () => navigation.navigate('Transactions') }} />
                    <View style={styles.transactionsList}>
                        {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                            dashboardData.recentTransactions.map((item: any, index: number) => (
                                <TransactionItem
                                    key={item.id}
                                    index={index}
                                    item={{
                                        customer: item.customerName,
                                        total: item.total,
                                        items: item.items || [],
                                        createdAt: item.createdAt
                                    }}
                                />
                            ))
                        ) : (
                            <EmptyState
                                title="Belum ada transaksi"
                                subtitle="Transaksi yang Anda lakukan hari ini akan muncul di sini."
                                icon={<ShoppingBag size={48} color={colors.textTertiary} opacity={0.5} />}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
        paddingTop: Spacing.sm,
    },

    // Metrics
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    metricCard: {
        width: (width - (Spacing.md * 2) - Spacing.sm) / 2, // 2 column grid
        padding: Spacing.md,
        gap: Spacing.xs,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    metricIconBox: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        gap: 2,
    },
    trendText: {
        fontSize: 9,
        fontWeight: FontWeight.bold,
    },
    metricValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
    },
    metricTitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },

    // Sections
    section: {
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },

    // Quick Actions
    actionsScroll: {
        gap: Spacing.md,
        paddingHorizontal: Spacing.xs, // alignment fix
    },
    actionBtn: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.lg, // Jhotpot style rounded square
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: FontWeight.medium,
    },

    // Recent Transactions
    transactionsList: {
        gap: Spacing.sm,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        gap: Spacing.sm,
    },
    transactionIcon: {
        width: 38,
        height: 38,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    transactionSubtitle: {
        fontSize: 10,
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
});

export default DashboardScreen;

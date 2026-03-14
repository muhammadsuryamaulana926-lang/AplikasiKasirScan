import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store/AppContext';
import {
    Bell,
    Settings,
    Trash2,
    CheckCheck,
    AlertCircle,
    Package,
    CreditCard,
    Info,
    ChevronRight,
    Search,
    ChevronLeft as BackIcon
} from 'lucide-react-native';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import AnimatedView from '../components/shared/AnimatedView';
import { EmptyState, LoadingSkeleton } from '../components/shared/States';
import api from '../services/api';

const { width } = Dimensions.get('window');

const NotificationItem = ({ item, index, onRead, colors }: any) => {
    const getIcon = () => {
        switch (item.type) {
            case 'low_stock':
                return <Package size={20} color={colors.danger} />;
            case 'debt_reminder':
                return <CreditCard size={20} color={colors.warning} />;
            case 'info':
                return <Info size={20} color={colors.info} />;
            default:
                return <Bell size={20} color={colors.primary} />;
        }
    };

    const getIconBg = () => {
        switch (item.type) {
            case 'low_stock':
                return colors.danger + '10';
            case 'debt_reminder':
                return colors.warning + '10';
            case 'info':
                return colors.info + '10';
            default:
                return colors.primary + '10';
        }
    };

    return (
        <AnimatedView delay={index * 50}>
            <TouchableOpacity
                style={[
                    styles.notifCard,
                    { 
                        backgroundColor: item.isRead ? colors.surface : colors.surface,
                        borderColor: item.isRead ? colors.border : colors.primary + '20',
                        borderLeftColor: item.isRead ? colors.border : colors.primary,
                        borderLeftWidth: 4,
                    }
                ]}
                onPress={() => onRead(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
                    {getIcon()}
                </View>

                <View style={styles.contentBox}>
                    <View style={styles.notifHeader}>
                        <Text style={[styles.notifTitle, { color: colors.text, fontWeight: item.isRead ? FontWeight.semibold : FontWeight.bold }]}>
                            {item.title}
                        </Text>
                        {!item.isRead && <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text 
                        style={[styles.notifMessage, { color: colors.textSecondary }]}
                        numberOfLines={2}
                    >
                        {item.message}
                    </Text>
                    <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </Text>
                </View>
                
                <ChevronRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>
        </AnimatedView>
    );
};

const NotificationsScreen: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { colors, notifications, fetchDashboard, unreadNotifications } = useApp();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    }, [fetchDashboard]);

    const handleRead = async (id: string) => {
        try {
            await api.put(`/reports/notifications/${id}/read`);
            fetchDashboard();
        } catch (err) {
            console.log('Failed to read notif:', err);
        }
    };

    const handleReadAll = async () => {
        try {
            await api.put('/reports/notifications/read-all');
            fetchDashboard();
        } catch (err) {
            console.log('Failed to read all notif:', err);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/reports/notifications/clear');
            fetchDashboard();
        } catch (err) {
            console.log('Failed to clear notif:', err);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[
                styles.header, 
                { 
                    backgroundColor: colors.surface, 
                    paddingTop: Math.max(insets.top + 10, 40),
                    borderBottomLeftRadius: BorderRadius.xl,
                    borderBottomRightRadius: BorderRadius.xl,
                    ...Shadow.sm,
                    zIndex: 10,
                }
            ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                    >
                        <BackIcon size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifikasi</Text>
                        {unreadNotifications > 0 && (
                            <Text style={[styles.headerSubtitle, { color: colors.primary }]}>
                                {unreadNotifications} pesan belum dibaca
                            </Text>
                        )}
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity 
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                        onPress={handleReadAll}
                        disabled={unreadNotifications === 0}
                    >
                        <CheckCheck size={20} color={unreadNotifications === 0 ? colors.textTertiary : colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.headerBtn, { backgroundColor: colors.surface }]}
                        onPress={handleClearAll}
                    >
                        <Trash2 size={20} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <NotificationItem 
                        item={item} 
                        index={index} 
                        onRead={handleRead} 
                        colors={colors} 
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AnimatedView delay={300}>
                            <EmptyState
                                title="Hening Sekali..."
                                subtitle="Belum ada notifikasi untuk Anda saat ini."
                                icon={<Bell size={64} color={colors.textTertiary} opacity={0.2} />}
                            />
                        </AnimatedView>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.lg,
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    headerSubtitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    headerBtn: {
        width: 42,
        height: 42,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        ...Shadow.sm,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentBox: {
        flex: 1,
        marginLeft: Spacing.md,
        marginRight: Spacing.xs,
    },
    notifHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: FontSize.sm,
        flex: 1,
    },
    unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    notifMessage: {
        fontSize: FontSize.xs,
        lineHeight: 18,
        marginBottom: 6,
    },
    notifTime: {
        fontSize: 10,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    }
});

export default NotificationsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { User, Phone, MapPin, Star, DollarSign, ChevronRight, Plus, X, MessageCircle } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import api from '../services/api';
import SearchBar from '../components/shared/SearchBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { Spacing, FontSize, FontWeight, formatRupiah, BorderRadius, Shadow } from '../theme';
import { LoadingSkeleton, EmptyState } from '../components/shared/States';
import AnimatedView from '../components/shared/AnimatedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Customer } from '../types';

const { width } = Dimensions.get('window');

const CustomerAvatar = ({ name, size = 50, color }: { name: string, size?: number, color: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: color + '40'
        }}>
            <Text style={{ fontSize: size * 0.4, fontWeight: 'bold', color: color }}>{initials}</Text>
        </View>
    );
};

const CustomersScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useApp();
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);
    const FLOAT_BOTTOM = TAB_BAR_HEIGHT + 16;
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/customers', { params: { search: searchQuery } });
            setCustomers(res.data.data || []);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCustomers();
    };

    const renderItem = useCallback(({ item, index }: { item: Customer, index: number }) => (
        <AnimatedView delay={(index % 10) * 80} style={{ marginBottom: Spacing.md }}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg, marginBottom: 0 }, Shadow.sm]}
                onPress={() => setSelectedCustomer(item)}
                activeOpacity={0.8}
            >
                <View style={styles.cardLeft}>
                    <CustomerAvatar name={item.name} color={colors.primary} />
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                        <View style={styles.phoneRow}>
                            <Phone size={12} color={colors.textSecondary} />
                            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.phone}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <View style={[
                        styles.pointsBadge, 
                        { 
                            backgroundColor: colors.surface, 
                            borderWidth: 0,
                            paddingHorizontal: 0
                        }
                    ]}>
                        <DollarSign size={14} color={Number(item.totalDebt) > 0 ? colors.danger : colors.success} />
                        <Text style={[styles.pointsText, { color: Number(item.totalDebt) > 0 ? colors.danger : colors.success, fontSize: FontSize.sm }]}>
                            {Number(item.totalDebt) > 0 ? formatRupiah(item.totalDebt) : 'Lunas'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </AnimatedView>
    ), [colors]);

    const InfoRow = ({ icon, label, value }: any) => (
        <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                {React.cloneElement(icon, { size: 18, color: colors.textSecondary })}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{value || '-'}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceVariant }]}>
                        <X size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Data Pelanggan</Text>
                    <View style={{ width: 40 }} />
                </View>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Cari nama atau nomor telepon..."
                />
            </View>

            {loading && !refreshing ? (
                <LoadingSkeleton count={6} />
            ) : customers.length === 0 ? (
                <EmptyState title="Belum ada pelanggan" subtitle="Pelanggan baru akan muncul di sini." />
            ) : (
                <FlatList
                    data={customers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: FLOAT_BOTTOM + 60 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary, bottom: FLOAT_BOTTOM }, Shadow.lg]}
                onPress={() => { /* Navigate to Add Customer Form */ }}
            >
                <Plus size={28} color="#FFF" />
            </TouchableOpacity>

            {/* Customer Detail Modal */}
            <Modal visible={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Detail Pelanggan" size="md">
                {selectedCustomer && (
                    <View>
                        <View style={styles.modalHeaderProfile}>
                            <CustomerAvatar name={selectedCustomer.name} size={80} color={colors.primary} />
                            <Text style={[styles.modalName, { color: colors.text }]}>{selectedCustomer.name}</Text>
                            <Text style={[styles.modalJoin, { color: colors.textSecondary }]}>Bergabung sejak {new Date(selectedCustomer.joinDate).getFullYear()}</Text>

                            <View style={[styles.modalActions, { marginTop: Spacing.md }]}>
                                <Button
                                    title="Hubungi"
                                    size="sm"
                                    icon={<MessageCircle size={16} color="#FFF" />}
                                    rounded
                                    style={{ flex: 1 }}
                                />
                                <View style={{ width: Spacing.md }} />
                                <Button
                                    title="Transaksi"
                                    size="sm"
                                    variant="outline"
                                    rounded
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>

                        <View style={[styles.modalInfoCard, { backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.lg }]}>
                            <InfoRow icon={<Phone />} label="Nomor Telepon" value={selectedCustomer.phone} />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <InfoRow icon={<MapPin />} label="Alamat" value={selectedCustomer.address} />
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <InfoRow icon={<DollarSign />} label="Total Belanja" value={formatRupiah(selectedCustomer.totalSpent)} />
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },

    listContent: { padding: Spacing.lg },

    card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, marginBottom: Spacing.md },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 4 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardSubtitle: { fontSize: FontSize.sm },

    cardRight: {},
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8 },
    pointsText: { fontSize: 9, fontWeight: FontWeight.bold },

    fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

    // Modal Styles
    modalHeaderProfile: { alignItems: 'center', marginBottom: Spacing.lg },
    modalName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: Spacing.md },
    modalJoin: { fontSize: FontSize.xs, marginTop: 4 },
    modalActions: { flexDirection: 'row', width: '100%' },
    modalInfoCard: { padding: Spacing.lg, gap: Spacing.md },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    infoIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    infoLabel: { fontSize: 10, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    divider: { height: 1, width: '100%' },
});

export default CustomersScreen;

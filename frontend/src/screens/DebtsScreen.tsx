import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Animated, Dimensions, Linking } from 'react-native';
import { MessageSquare, User, Phone, MapPin, Star, DollarSign, Plus, MessageCircle } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import api from '../services/api';
import SearchBar from '../components/shared/SearchBar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import InputField from '../components/ui/InputField';
import { Spacing, FontSize, FontWeight, formatRupiah, formatDate, BorderRadius, Shadow } from '../theme';
import { LoadingSkeleton, EmptyState } from '../components/shared/States';
import AnimatedView from '../components/shared/AnimatedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Debt, Customer } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── TAB SWITCHER ───────────────────────────────────────────────
const TabSwitcher = ({ activeTab, onTabChange, colors }: any) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const tabWidth = (SCREEN_WIDTH - Spacing.lg * 2 - 8) / 2;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: activeTab === 'debts' ? 0 : 1,
            useNativeDriver: true,
            tension: 300,
            friction: 30,
        }).start();
    }, [activeTab]);

    return (
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceVariant }]}>
            <Animated.View
                style={[
                    styles.tabIndicator,
                    {
                        backgroundColor: colors.primary,
                        width: tabWidth,
                        transform: [{
                            translateX: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, tabWidth],
                            })
                        }],
                    },
                ]}
            />
            <TouchableOpacity
                style={[styles.tabBtn, { width: tabWidth }]}
                onPress={() => onTabChange('debts')}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.tabText,
                    { color: activeTab === 'debts' ? '#FFF' : colors.textSecondary }
                ]}>
                    Catatan Hutang
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabBtn, { width: tabWidth }]}
                onPress={() => onTabChange('customers')}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.tabText,
                    { color: activeTab === 'customers' ? '#FFF' : colors.textSecondary }
                ]}>
                    Data Penghutang
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── SKELETONS ──────────────────────────────────────────────────
const DebtSkeleton = () => {
    const { colors } = useApp();
    return (
        <View style={{ padding: Spacing.lg }}>
            {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.debtCard, { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1, borderRadius: 12, marginBottom: Spacing.md, overflow: 'hidden' }]}>
                    <View style={styles.debtHeader}>
                        <View style={{ gap: 6 }}>
                            <View style={{ height: 14, width: 140, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
                            <View style={{ height: 10, width: 100, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
                        </View>
                        <View style={{ height: 22, width: 80, backgroundColor: colors.surfaceVariant, borderRadius: 12 }} />
                    </View>
                    <View style={styles.debtDetails}>
                        <View style={styles.detailCol}>
                            <View style={{ height: 8, width: 60, backgroundColor: colors.surfaceVariant, borderRadius: 4, marginBottom: 4 }} />
                            <View style={{ height: 14, width: 85, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
                        </View>
                        <View style={styles.detailCol}>
                            <View style={{ height: 8, width: 40, backgroundColor: colors.surfaceVariant, borderRadius: 4, marginBottom: 4 }} />
                            <View style={{ height: 14, width: 70, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
                        </View>
                        <View style={styles.detailCol}>
                            <View style={{ height: 8, width: 70, backgroundColor: colors.surfaceVariant, borderRadius: 4, marginBottom: 4 }} />
                            <View style={{ height: 14, width: 80, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
                        </View>
                    </View>
                    <View style={[styles.debtActions, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
                        <View style={{ height: 32, flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: 8, marginRight: 12 }} />
                        <View style={{ height: 32, flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: 8 }} />
                    </View>
                </View>
            ))}
        </View>
    );
};

const SummarySkeleton = () => {
    const { colors } = useApp();
    return (
        <View style={styles.summaryGrid}>
            <View style={[styles.sumCard, { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }]}>
                <View style={{ height: 10, width: 70, backgroundColor: colors.surfaceVariant, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ height: 22, width: 120, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
            </View>
            <View style={[styles.sumCard, { backgroundColor: colors.card, borderColor: colors.borderLight, borderWidth: 1 }]}>
                <View style={{ height: 10, width: 70, backgroundColor: colors.surfaceVariant, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ height: 22, width: 80, backgroundColor: colors.surfaceVariant, borderRadius: 4 }} />
            </View>
        </View>
    );
};

// ─── CUSTOMER AVATAR ────────────────────────────────────────────
const CustomerAvatar = ({ name, size = 40, color }: { name: string, size?: number, color: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: color + '40'
        }}>
            <Text style={{ fontSize: size * 0.4, fontWeight: 'bold', color: color }}>{initials}</Text>
        </View>
    );
};

// ─── MAIN SCREEN ────────────────────────────────────────────────
const DebtsScreen: React.FC = ({ route }: any) => {
    const { colors } = useApp();
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);
    const FLOAT_BOTTOM = TAB_BAR_HEIGHT + 16;

    // Shared state
    const [activeTab, setActiveTab] = useState<'debts' | 'customers'>('debts');

    // Handle tab navigation from params
    useEffect(() => {
        if (route.params?.tab) {
            setActiveTab(route.params.tab);
            // Reset params to avoid stuck state on re-focus if needed, but usually fine
        }
    }, [route.params?.tab]);

    // ─── Debts State ────
    const [debts, setDebts] = useState<Debt[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [debtLoading, setDebtLoading] = useState(true);
    const [debtSearch, setDebtSearch] = useState('');
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [payAmount, setPayAmount] = useState('');

    // ─── Customers State ────
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [customerRefreshing, setCustomerRefreshing] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // ─── Fetch Debts ────
    const fetchDebts = useCallback(async () => {
        try {
            setDebtLoading(true);
            const [debtRes, sumRes] = await Promise.all([
                api.get('/debts', { params: { search: debtSearch } }),
                api.get('/debts/summary')
            ]);
            setDebts(debtRes.data.data);
            setSummary(sumRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setDebtLoading(false);
        }
    }, [debtSearch]);

    // ─── Fetch Customers ────
    const fetchCustomers = useCallback(async () => {
        try {
            setCustomerLoading(true);
            const res = await api.get('/customers', { params: { search: customerSearch } });
            setCustomers(res.data.data || []);
        } catch (err: any) {
            console.error(err);
        } finally {
            setCustomerLoading(false);
            setCustomerRefreshing(false);
        }
    }, [customerSearch]);

    useEffect(() => {
        fetchDebts();
    }, [fetchDebts]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // ─── Debt Actions ────
    const handlePay = async () => {
        if (!selectedDebt || !payAmount || Number(payAmount) <= 0) return;
        try {
            await api.post(`/debts/${selectedDebt.id}/pay`, { amount: Number(payAmount) });
            Alert.alert('Sukses', 'Pembayaran berhasil dicatat');
            setPayAmount('');
            setSelectedDebt(null);
            fetchDebts();
        } catch (err) {
            Alert.alert('Error', 'Gagal mencatat pembayaran');
        }
    };

    const contactWhatsApp = async (phone: string, name: string, customMessage?: string) => {
        if (!phone) {
            Alert.alert('Data Tidak Lengkap', 'Nomor telepon tidak ditemukan.');
            return;
        }

        try {
            // Clean phone number
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '62' + cleanPhone.slice(1);
            } else if (!cleanPhone.startsWith('62')) {
                cleanPhone = '62' + cleanPhone;
            }

            const message = customMessage || `Halo ${name}, saya dari Toko Catatan Warung ingin menghubungi Anda.`;
            const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                await Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Gagal membuka WhatsApp');
        }
    };

    const sendReminder = async (debt: Debt) => {
        try {
            // Update backend status first
            await api.post(`/debts/${debt.id}/remind`);

            const phone = (debt as any).customerPhone || '';
            const message = `Halo ${debt.customerName}, ini pengingat dari Toko Catatan Warung. Ada catatan hutang sebesar ${formatRupiah(debt.remaining)} yang jatuh tempo pada ${formatDate(debt.dueDate)}. Mohon segera diselesaikan ya. Terima kasih!`;

            await contactWhatsApp(phone, debt.customerName, message);
            fetchDebts();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Gagal memproses pengingat');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'overdue': return <Badge text="Jatuh Tempo" variant="danger" />;
            case 'unpaid': return <Badge text="Belum Bayar" variant="warning" />;
            case 'partial': return <Badge text="Cicilan" variant="info" />;
            case 'paid': return <Badge text="Lunas" variant="success" />;
            default: return null;
        }
    };

    // ─── Render Debt Item ────
    const renderDebtItem = useCallback(({ item, index }: { item: Debt, index: number }) => (
        <AnimatedView delay={(index % 10) * 80} style={{ marginBottom: Spacing.md }}>
            <Card style={[styles.debtCard, { marginBottom: 0 }]}>
                <View style={styles.debtHeader}>
                    <View>
                        <Text style={[styles.custName, { color: colors.text }]}>{item.customerName}</Text>
                        <Text style={[styles.debtDate, { color: colors.textTertiary }]}>Dibuat: {formatDate(item.createdAt)}</Text>
                    </View>
                    {getStatusBadge(item.status)}
                </View>

                <View style={styles.debtDetails}>
                    <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Hutang</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{formatRupiah(item.amount)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sisa</Text>
                        <Text style={[styles.detailValue, { color: colors.danger, fontWeight: FontWeight.bold }]}>{formatRupiah(item.remaining)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Jatuh Tempo</Text>
                        <Text style={[styles.detailValue, { color: item.status === 'overdue' ? colors.danger : colors.text }]}>{formatDate(item.dueDate)}</Text>
                    </View>
                </View>

                <View style={[styles.debtActions, { borderTopColor: colors.border || '#E5E7EB' }]}>
                    <Button
                        title="Ingatkan WA"
                        variant="ghost"
                        size="sm"
                        icon={<MessageCircle size={18} color="#25D366" fill="#25D36610" />}
                        onPress={() => sendReminder(item)}
                        disabled={item.status === 'paid'}
                    />
                    <Button
                        title="Bayar"
                        variant="primary"
                        size="sm"
                        onPress={() => setSelectedDebt(item)}
                        disabled={item.status === 'paid'}
                    />
                </View>
            </Card>
        </AnimatedView>
    ), [colors]);

    // ─── Render Customer Item ────
    const renderCustomerItem = useCallback(({ item, index }: { item: Customer, index: number }) => (
        <AnimatedView delay={(index % 10) * 80} style={{ marginBottom: Spacing.md }}>
            <TouchableOpacity
                style={[styles.customerCard, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg, marginBottom: 0 }, Shadow.sm]}
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
                <View>
                    <View style={[styles.pointsBadge, { backgroundColor: '#FFF' }]}>
                        <Star size={12} color={colors.warning} fill={colors.warning} />
                        <Text style={[styles.pointsText, { color: colors.warning }]}>{item.loyaltyPoints}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </AnimatedView>
    ), [colors]);

    // ─── Info Row for Customer Modal ────
    const InfoRow = ({ icon, label, value }: any) => (
        <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: '#FFF' }]}>
                {React.cloneElement(icon, { size: 18, color: colors.textSecondary })}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{value || '-'}</Text>
            </View>
        </View>
    );

    // ─── DEBTS TAB CONTENT ────
    const DebtsContent = () => (
        <>
            {debtLoading && !debtSearch ? (
                <>
                    <SummarySkeleton />
                    <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
                        <SearchBar value={debtSearch} onChangeText={setDebtSearch} placeholder="Cari nama penghutang..." />
                    </View>
                    <DebtSkeleton />
                </>
            ) : (
                <>
                    <View style={styles.summaryGrid}>
                        <View style={[styles.sumCard, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>Total Hutang</Text>
                            <Text style={[styles.sumValue, { color: colors.text }]}>{formatRupiah(summary?.totalDebt || 0)}</Text>
                        </View>
                        <View style={[styles.sumCard, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>Lewat Tempo</Text>
                            <Text style={[styles.sumValue, { color: colors.danger }]}>{summary?.overdueCount || 0} Orang</Text>
                        </View>
                    </View>

                    <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
                        <SearchBar value={debtSearch} onChangeText={setDebtSearch} placeholder="Cari nama penghutang..." />
                    </View>

                    {debts.length === 0 ? (
                        <EmptyState title="Tidak ada hutang" subtitle="Semua catatan hutang telah lunas atau belum ada data." />
                    ) : (
                        <FlatList
                            data={debts}
                            renderItem={renderDebtItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                            refreshControl={<RefreshControl refreshing={debtLoading} onRefresh={fetchDebts} />}
                        />
                    )}
                </>
            )}
        </>
    );

    // ─── CUSTOMERS TAB CONTENT ────
    const CustomersContent = () => (
        <>
            <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
                <SearchBar
                    value={customerSearch}
                    onChangeText={setCustomerSearch}
                    placeholder="Cari nama atau nomor telepon..."
                />
            </View>

            {customerLoading && !customerRefreshing ? (
                <LoadingSkeleton count={6} />
            ) : customers.length === 0 ? (
                <EmptyState title="Belum ada penghutang" subtitle="Data penghutang baru akan muncul di sini." />
            ) : (
                <FlatList
                    data={customers}
                    renderItem={renderCustomerItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.list, { paddingBottom: FLOAT_BOTTOM + 60 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={customerRefreshing} onRefresh={() => { setCustomerRefreshing(true); fetchCustomers(); }} colors={[colors.primary]} />}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary, bottom: FLOAT_BOTTOM }, Shadow.lg]}
                onPress={() => { /* Navigate to Add Customer Form */ }}
            >
                <Plus size={28} color="#FFF" />
            </TouchableOpacity>
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Tab Switcher */}
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} colors={colors} />

            {/* Tab Content */}
            {activeTab === 'debts' ? <DebtsContent /> : <CustomersContent />}

            {/* ─── Payment Modal ─── */}
            <Modal visible={!!selectedDebt} onClose={() => setSelectedDebt(null)} title="Catat Pembayaran" size="md">
                {selectedDebt ? (
                    <View>
                        <Text style={[styles.paySubtitle, { color: colors.textSecondary }]}>Mencatat pembayaran untuk</Text>
                        <Text style={[styles.payName, { color: colors.text }]}>{selectedDebt.customerName}</Text>
                        <View style={[styles.payInfoBox, { backgroundColor: colors.surfaceVariant }]}>
                            <Text style={{ color: colors.textSecondary }}>Sisa Hutang: <Text style={{ color: colors.danger, fontWeight: 'bold' }}>{formatRupiah(selectedDebt.remaining)}</Text></Text>
                        </View>
                        <InputField
                            label="Jumlah Pembayaran"
                            value={payAmount}
                            onChangeText={setPayAmount}
                            keyboardType="numeric"
                            placeholder="Masukkan nominal bayar..."
                        />
                        <View style={styles.quickPayRow}>
                            <TouchableOpacity style={[styles.quickPayBtn, { borderColor: colors.border }]} onPress={() => setPayAmount(String(selectedDebt.remaining))}>
                                <Text style={{ color: colors.primary }}>Bayar Lunas</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.quickPayBtn, { borderColor: colors.border }]} onPress={() => setPayAmount(String(Math.floor(selectedDebt.remaining / 2)))}>
                                <Text style={{ color: colors.primary }}>Bayar Setengah</Text>
                            </TouchableOpacity>
                        </View>
                        <Button title="Simpan Pembayaran" onPress={handlePay} style={{ marginTop: 20, marginBottom: 30 }} />
                    </View>
                ) : <View />}
            </Modal>

            {/* ─── Customer Detail Modal ─── */}
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
                                    style={{ flex: 1, backgroundColor: '#25D366' }}
                                    onPress={() => contactWhatsApp(selectedCustomer.phone, selectedCustomer.name)}
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

    // Tab Switcher
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.md,
        marginTop: 4,
        marginBottom: Spacing.xs,
        borderRadius: 14,
        padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        height: '100%',
        borderRadius: 11,
    },
    tabBtn: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    tabText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
    },

    // Debts
    summaryGrid: { flexDirection: 'row', padding: Spacing.md, paddingTop: Spacing.xs, gap: Spacing.sm },
    sumCard: { flex: 1, padding: 12, borderRadius: 10, elevation: 1 },
    sumLabel: { fontSize: 9, fontWeight: FontWeight.bold, textTransform: 'uppercase', marginBottom: 2 },
    sumValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    searchBox: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
    list: { padding: Spacing.md },
    debtCard: { marginBottom: Spacing.sm, padding: 0 },
    debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.sm },
    custName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    debtDate: { fontSize: 10, marginTop: 2 },
    debtDetails: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 9, marginBottom: 2 },
    detailValue: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
    debtActions: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.sm, borderTopWidth: 1 },

    // Payment Modal
    paySubtitle: { fontSize: FontSize.sm, textAlign: 'center' },
    payName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: 15 },
    payInfoBox: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
    quickPayRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    quickPayBtn: { flex: 1, padding: 8, borderWidth: 1, borderRadius: 8, alignItems: 'center' },

    // Customer Cards
    customerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.sm, marginBottom: Spacing.sm },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardSubtitle: { fontSize: FontSize.xs },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    pointsText: { fontSize: 10, fontWeight: FontWeight.bold },

    fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

    // Customer Detail Modal
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

export default DebtsScreen;

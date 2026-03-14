import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Animated, Dimensions, Linking, ScrollView, TextInput, Platform, Share } from 'react-native';
import { MessageSquare, User, Phone, MapPin, Star, DollarSign, Plus, MessageCircle, Trash2, XCircle, AlertCircle, CheckCircle, Info, Edit2, QrCode } from 'lucide-react-native';
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
import { useFocusEffect } from '@react-navigation/native';
import { Debt, Customer } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    sumCard: { flex: 1, padding: 12, borderRadius: 10, elevation: 2, borderWidth: 0 },
    sumLabel: { fontSize: 9, fontWeight: FontWeight.bold, textTransform: 'uppercase', marginBottom: 2 },
    sumValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    searchBox: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
    list: { padding: Spacing.md },
    debtCard: { marginBottom: Spacing.sm, padding: 0 },
    debtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
    custName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    debtDate: { fontSize: 10, marginTop: 2 },
    debtDetails: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 9, marginBottom: 2 },
    detailValue: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
    debtActions: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderTopWidth: 1 },

    // Payment Modal
    paySubtitle: { fontSize: FontSize.sm, textAlign: 'center' },
    payName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: 15 },
    payInfoBox: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
    quickPayRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    quickPayBtn: { flex: 1, padding: 8, borderWidth: 1, borderRadius: 8, alignItems: 'center' },

    // Customer Cards
    customerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, marginBottom: Spacing.sm },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 2 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardSubtitle: { fontSize: FontSize.xs },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8 },
    pointsText: { fontSize: 9, fontWeight: FontWeight.bold },

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
    label: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    pickerContainer: { borderWidth: 1, borderRadius: 12, marginBottom: Spacing.md, overflow: 'hidden' },
    pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
});

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
    const { colors, fetchDashboard, user } = useApp();
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
    const [isAddDebtVisible, setIsAddDebtVisible] = useState(false);
    const [newDebtCustomerId, setNewDebtCustomerId] = useState('');
    const [newDebtAmount, setNewDebtAmount] = useState('');
    const [newDebtItems, setNewDebtItems] = useState('');
    const [newDebtDueDate, setNewDebtDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [isCreatingDebt, setIsCreatingDebt] = useState(false);

    // ─── Deletion State ───
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ─── Add Customer State ───
    const [isAddCustomerVisible, setIsAddCustomerVisible] = useState(false);
    const [newCustName, setNewCustName] = useState('');
    const [newCustPhone, setNewCustPhone] = useState('');
    const [newCustAddress, setNewCustAddress] = useState('');
    const [newCustInitialDebt, setNewCustInitialDebt] = useState('');
    const [isAddingCust, setIsAddingCust] = useState(false);
    const [isEditingCust, setIsEditingCust] = useState(false);
    const [editingCustId, setEditingCustId] = useState<string | null>(null);
    const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
    
    // ─── Form Errors State ───
    const [debtErrors, setDebtErrors] = useState<any>({});
    const [custErrors, setCustErrors] = useState<any>({});

    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info',
        onConfirm: null as (() => void) | null
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm: (() => void) | null = null) => {
        setAlertState({ visible: true, title, message, type, onConfirm });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    // Clear errors when modals change
    useEffect(() => {
        if (!isAddDebtVisible) setDebtErrors({});
    }, [isAddDebtVisible]);

    useEffect(() => {
        if (!isAddCustomerVisible) setCustErrors({});
    }, [isAddCustomerVisible]);

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

    useFocusEffect(
        useCallback(() => {
            fetchDebts();
            fetchCustomers();
            fetchDashboard();
        }, [fetchDebts, fetchCustomers, fetchDashboard])
    );

    // ─── Debt Actions ────
    const handlePay = async () => {
        if (!selectedDebt || !payAmount || Number(payAmount) <= 0) return;
        try {
            await api.post(`/debts/${selectedDebt.id}/pay`, { amount: Number(payAmount) });
            showAlert('Sukses', 'Pembayaran berhasil dicatat', 'success');
            setPayAmount('');
            setSelectedDebt(null);
            fetchDebts();
            fetchCustomers(); // Sync customer list debt total
            fetchDashboard(); // Refresh notifications
        } catch (err) {
            showAlert('Error', 'Gagal mencatat pembayaran', 'error');
        }
    };

    const handleCreateDebt = async () => {
        const errors: any = {};
        if (!newDebtCustomerId) errors.customerId = 'Pilih pelanggan terlebih dahulu';
        if (!newDebtAmount || Number(newDebtAmount) <= 0) errors.amount = 'Masukkan jumlah hutang yang valid';
        
        if (Object.keys(errors).length > 0) {
            setDebtErrors(errors);
            return;
        }

        try {
            setIsCreatingDebt(true);
            const customer = customers.find(c => c.id === newDebtCustomerId);
            await api.post('/debts', {
                customerId: newDebtCustomerId,
                customerName: customer?.name || 'Pelanggan',
                amount: Number(newDebtAmount),
                items: newDebtItems,
                dueDate: newDebtDueDate
            });
            showAlert('Sukses', 'Catatan hutang berhasil ditambahkan', 'success');
            setIsAddDebtVisible(false);
            setNewDebtAmount('');
            setNewDebtItems('');
            fetchDebts();
            fetchCustomers();
            fetchDashboard();
        } catch (err) {
            showAlert('Error', 'Gagal membuat catatan hutang', 'error');
        } finally {
            setIsCreatingDebt(false);
        }
    };

    const contactWhatsApp = async (phone: string, name: string, customMessage?: string) => {
        if (!phone) {
            showAlert('Data Tidak Lengkap', 'Nomor telepon tidak ditemukan.', 'warning');
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
            showAlert('Error', 'Gagal membuka WhatsApp', 'error');
        }
    };

    const sendReminder = async (debt: Debt) => {
        try {
            // Update backend status first
            await api.post(`/debts/${debt.id}/remind`);

            const phone = (debt as any).customerPhone || '';
            let qrisNote = '';
            
            if (user?.qrisImage) {
                qrisNote = `\n\nUntuk pembayaran yang lebih mudah dan praktis, Anda bisa menggunakan QRIS. Barcode QRIS-nya saya lampirkan setelah pesan ini ya.`;
            }

            const message = `Halo ${debt.customerName}, ini pengingat dari Toko ${user?.name || 'Catatan Warung'}.\n\nAda catatan hutang sebesar *${formatRupiah(debt.remaining)}* yang jatuh tempo pada *${formatDate(debt.dueDate)}*.\n\nMohon segera diselesaikan ya.${qrisNote}\n\nTerima kasih! 🙏`;

            await contactWhatsApp(phone, debt.customerName, message);
            fetchDebts();
        } catch (err) {
            console.error(err);
            showAlert('Error', 'Gagal memproses pengingat', 'error');
        }
    };

    const handleShareQRIS = async (customer: Customer) => {
        if (!user?.qrisImage) {
            showAlert('QRIS Belum Diatur', 'Silakan atur barcode QRIS Anda terlebih dahulu di halaman Profil.', 'warning');
            return;
        }

        const phone = customer.phone || '';
        const message = `Halo ${customer.name}, berikut adalah barcode pembayaran QRIS dari Toko ${user?.name || 'Catatan Warung'}. Anda bisa menscan gambar ini untuk melakukan pembayaran hutang. Terima kasih!`;
        
        // Since we can't share base64 as a file easily without extra libraries, 
        // we'll send the text and instructions. 
        // If it was a real URL, it would preview.
        await contactWhatsApp(phone, customer.name, message);
    };

    const handleDeleteCustomer = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;
        
        try {
            setIsDeleting(true);
            await api.delete(`/customers/${customerToDelete.id}`);
            if (selectedCustomer?.id === customerToDelete.id) setSelectedCustomer(null);
            setIsDeleteModalVisible(false);
            setCustomerToDelete(null);
            fetchCustomers();
            fetchDebts();
            fetchDashboard();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Gagal menghapus data pelanggan';
            showAlert('Error', errorMsg, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditCustomer = async (customer: Customer) => {
        setEditingCustId(customer.id);
        setNewCustName(customer.name);
        setNewCustPhone(customer.phone);
        setNewCustAddress(customer.address || '');
        
        // Try to find if they have an initial debt (simplification: find the first unpaid debt)
        try {
            const res = await api.get(`/customers/${customer.id}`);
            const customerData = res.data.data;
            const initialDebtRecord = customerData.debts?.find((d: any) => d.status !== 'paid');
            if (initialDebtRecord) {
                setNewCustInitialDebt(String(initialDebtRecord.amount));
                setEditingDebtId(initialDebtRecord.id);
            } else {
                setNewCustInitialDebt('');
                setEditingDebtId(null);
            }
        } catch (err) {
            setNewCustInitialDebt('');
            setEditingDebtId(null);
        }

        setIsEditingCust(true);
        setIsAddCustomerVisible(true);
    };

    const handleAddCustomer = async () => {
        const errors: any = {};
        if (!newCustName.trim()) errors.name = 'Nama pelanggan wajib diisi';
        if (newCustPhone.length > 0 && newCustPhone.length < 10) errors.phone = 'Nomor telepon tidak valid';
        
        if (Object.keys(errors).length > 0) {
            setCustErrors(errors);
            return;
        }

        try {
            setIsAddingCust(true);
            if (isEditingCust && editingCustId) {
                await api.put(`/customers/${editingCustId}`, {
                    name: newCustName,
                    phone: newCustPhone,
                    address: newCustAddress
                });

                // Also update the debt if it exists and was changed
                if (editingDebtId && newCustInitialDebt) {
                    await api.put(`/debts/${editingDebtId}`, {
                        amount: Number(newCustInitialDebt)
                    });
                } else if (!editingDebtId && Number(newCustInitialDebt) > 0) {
                    // Create new debt if none existed but now added
                    await api.post('/debts', {
                        customerId: editingCustId,
                        customerName: newCustName,
                        amount: Number(newCustInitialDebt),
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    });
                }

                showAlert('Sukses', 'Data penghutang berhasil diperbarui', 'success');
            } else {
                await api.post('/customers', {
                    name: newCustName,
                    phone: newCustPhone || '000000000',
                    address: newCustAddress,
                    initialDebt: Number(newCustInitialDebt) || 0
                });
                showAlert('Sukses', 'Data penghutang berhasil ditambahkan', 'success');
            }
            
            setIsAddCustomerVisible(false);
            setNewCustName('');
            setNewCustPhone('');
            setNewCustAddress('');
            setNewCustInitialDebt('');
            setIsEditingCust(false);
            setEditingCustId(null);
            setEditingDebtId(null);
            fetchCustomers();
            fetchDebts();
            fetchDashboard();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Gagal menyimpan data';
            showAlert('Error', errorMsg, 'error');
        } finally {
            setIsAddingCust(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badgeStyle = { 
            paddingHorizontal: 8, 
            paddingVertical: 3,
            borderRadius: 8 
        };
        const textStyle = { fontSize: 10.5 };
        
        switch (status) {
            case 'overdue': return <Badge text="Jatuh Tempo" variant="danger" style={badgeStyle} textStyle={textStyle} />;
            case 'unpaid': return <Badge text="Belum Bayar" variant="warning" style={badgeStyle} textStyle={textStyle} />;
            case 'partial': return <Badge text="Cicilan" variant="info" style={badgeStyle} textStyle={textStyle} />;
            case 'paid': return <Badge text="Lunas" variant="success" style={[badgeStyle, { backgroundColor: '#FFF', borderWidth: 0 }]} textStyle={[textStyle, { color: colors.success }]} />;
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
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sisa Hutang</Text>
                        <Text style={[styles.detailValue, { color: colors.danger, fontWeight: FontWeight.bold, fontSize: FontSize.md }]}>{formatRupiah(item.remaining)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Jatuh Tempo</Text>
                        <Text style={[styles.detailValue, { color: item.status === 'overdue' ? colors.danger : colors.text }]}>{formatDate(item.dueDate)}</Text>
                    </View>
                </View>

                {item.items && (
                    <View style={{ paddingHorizontal: Spacing.sm, paddingBottom: 8 }}>
                        <Text style={{ fontSize: 10, color: colors.textTertiary }} numberOfLines={1}>Beli: {item.items}</Text>
                    </View>
                )}

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
                onLongPress={() => handleDeleteCustomer(item)}
                delayLongPress={800}
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
                        {item.address && (
                            <View style={[styles.phoneRow, { marginTop: 2 }]}>
                                <MapPin size={12} color={colors.textSecondary} />
                                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    {Number(item.totalDebt || 0) > 0 ? (
                        <View style={{ 
                            paddingHorizontal: 8, 
                            paddingVertical: 3, 
                            borderRadius: 8, 
                            backgroundColor: '#FFF', 
                            borderWidth: 0, 
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <DollarSign size={12} color={colors.danger} />
                            <Text style={{ color: colors.danger, fontSize: 10.5, fontWeight: FontWeight.bold }}>
                                {formatRupiah(Number(item.totalDebt))}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ 
                            paddingHorizontal: 8, 
                            paddingVertical: 3, 
                            borderRadius: 8, 
                            backgroundColor: '#FFF', 
                            borderWidth: 0,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <DollarSign size={12} color={colors.success} />
                            <Text style={{ color: colors.success, fontSize: 10.5, fontWeight: FontWeight.bold }}>
                                Lunas
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </AnimatedView>
    ), [colors]);

    // ─── Info Row for Customer Modal ────
    const renderInfoRow = (icon: any, label: string, value: any) => (
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Tab Switcher */}
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} colors={colors} />

            {/* Tab Content */}
            {activeTab === 'debts' ? (
                <View style={{ flex: 1 }}>
                    {debtLoading && !debtSearch ? (
                        <View style={{ flex: 1 }}>
                            <SummarySkeleton />
                            <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
                                <SearchBar value={debtSearch} onChangeText={setDebtSearch} placeholder="Cari nama penghutang..." />
                            </View>
                            <DebtSkeleton />
                        </View>
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
                                    contentContainerStyle={[styles.list, { paddingBottom: FLOAT_BOTTOM + 20 }]}
                                    refreshControl={<RefreshControl refreshing={debtLoading} onRefresh={fetchDebts} />}
                                    showsVerticalScrollIndicator={false}
                                />
                            )}
                        </>
                    )}
                </View>
            ) : (
                <View style={{ flex: 1 }}>
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
                </View>
            )}

            {activeTab === 'customers' && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary, bottom: FLOAT_BOTTOM }, Shadow.lg]}
                    onPress={() => setIsAddCustomerVisible(true)}
                >
                    <Plus size={28} color="#FFF" />
                </TouchableOpacity>
            )}

            {/* ─── Payment Modal ─── */}
            <Modal visible={!!selectedDebt} onClose={() => setSelectedDebt(null)} title="Catat Pembayaran" size="md">
                <View style={{ paddingBottom: 10 }}>
                    {selectedDebt ? (
                        <View>
                            <Text style={[styles.paySubtitle, { color: colors.textSecondary }]}>Mencatat pembayaran untuk</Text>
                            <Text style={[styles.payName, { color: colors.text }]}>{selectedDebt.customerName}</Text>
                            <View style={[styles.payInfoBox, { backgroundColor: colors.surfaceVariant, borderRadius: 12 }]}>
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
                                <TouchableOpacity style={[styles.quickPayBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => setPayAmount(String(selectedDebt.remaining))}>
                                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Lunas</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.quickPayBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => setPayAmount(String(Math.floor(selectedDebt.remaining / 2)))}>
                                    <Text style={{ color: colors.primary }}>Setengah</Text>
                                </TouchableOpacity>
                            </View>
                            <Button title="Simpan Pembayaran" onPress={handlePay} style={{ marginTop: 20, marginBottom: 10 }} />
                        </View>
                    ) : <View />}
                </View>
            </Modal>

            {/* ─── Add Debt Modal ─── */}
            <Modal visible={isAddDebtVisible} onClose={() => setIsAddDebtVisible(false)} title="Tambah Catatan Hutang" size="md">
                <View style={{ paddingBottom: 10 }}>
                    <Text style={[styles.label, { color: debtErrors.customerId ? colors.danger : colors.textSecondary, marginBottom: 8 }]}>Pilih Pelanggan {debtErrors.customerId && <Text style={{ fontSize: 10, fontWeight: 'normal' }}>({debtErrors.customerId})</Text>}</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: debtErrors.customerId ? colors.danger : colors.border }]}>
                        <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                            {customers.map(c => (
                                <TouchableOpacity 
                                    key={c.id} 
                                    style={[
                                        styles.pickerItem, 
                                        { borderBottomColor: colors.border },
                                        newDebtCustomerId === c.id && { backgroundColor: colors.primary + '10', borderLeftWidth: 4, borderLeftColor: colors.primary }
                                    ]}
                                    onPress={() => setNewDebtCustomerId(c.id)}
                                >
                                    <View>
                                        <Text style={{ color: colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.sm }}>{c.name}</Text>
                                        <Text style={{ fontSize: 10, color: colors.textTertiary }}>{c.phone || 'No Phone'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <InputField
                        label="Jumlah Hutang (Rp)"
                        value={newDebtAmount}
                        onChangeText={(val) => {
                            setNewDebtAmount(val);
                            if (debtErrors.amount) setDebtErrors({ ...debtErrors, amount: null });
                        }}
                        keyboardType="numeric"
                        placeholder="Contoh: 50000"
                        error={debtErrors.amount}
                    />

                    <InputField
                        label="Catatan Barang (Opsional)"
                        value={newDebtItems}
                        onChangeText={setNewDebtItems}
                        placeholder="Contoh: Beras, Sabun..."
                    />

                    <InputField
                        label="Jatuh Tempo"
                        value={newDebtDueDate}
                        onChangeText={setNewDebtDueDate}
                        placeholder="YYYY-MM-DD"
                    />

                    <Button 
                        title={isCreatingDebt ? "Sedang Menyimpan..." : "Simpan Catatan"} 
                        onPress={handleCreateDebt} 
                        style={{ marginTop: 20, marginBottom: 10 }} 
                        disabled={isCreatingDebt}
                    />
                </View>
            </Modal>

            {/* ─── Customer Detail Modal ─── */}
            <Modal visible={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Detail Penghutang" size="md">
                <View style={{ paddingBottom: 10 }}>
                    {selectedCustomer && (
                        <View>
                            <View style={styles.modalHeaderProfile}>
                                <CustomerAvatar name={selectedCustomer.name} size={70} color={colors.primary} />
                                <Text style={[styles.modalName, { color: colors.text }]}>{selectedCustomer.name}</Text>
                                <Text style={[styles.modalJoin, { color: colors.textSecondary }]}>Bergabung sejak {new Date(selectedCustomer.joinDate).getFullYear()}</Text>
                            </View>

                            <View style={[styles.modalInfoCard, { backgroundColor: colors.surfaceVariant, borderRadius: 16 }]}>
                                {renderInfoRow(<Phone />, "Nomor Telepon", selectedCustomer.phone)}
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                {renderInfoRow(<MapPin />, "Alamat", selectedCustomer.address)}
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                {renderInfoRow(<DollarSign />, "Total Hutang", formatRupiah(selectedCustomer.totalDebt || 0))}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                                <Button 
                                    title="Edit Profile" 
                                    variant="outline" 
                                    icon={<Edit2 size={16} color={colors.primary} />}
                                    style={{ flex: 1 }} 
                                    onPress={() => {
                                        const cust = selectedCustomer;
                                        setSelectedCustomer(null);
                                        handleEditCustomer(cust);
                                    }} 
                                />
                                <Button 
                                    title="Kirim QRIS" 
                                    variant="outline" 
                                    icon={<QrCode size={16} color={colors.secondary} />}
                                    style={{ flex: 1 }} 
                                    onPress={() => handleShareQRIS(selectedCustomer)} 
                                />
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            {/* ─── Delete Confirmation Modal ─── */}
            <Modal visible={isDeleteModalVisible} onClose={() => setIsDeleteModalVisible(false)} title="Konfirmasi Hapus" size="sm" type="center">
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.danger + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
                        <Trash2 size={30} color={colors.danger} />
                    </View>
                    <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: colors.text, textAlign: 'center', marginBottom: 8 }}>
                        Hapus Data Penghutang?
                    </Text>
                    <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 }}>
                        Apakah Anda yakin ingin menghapus <Text style={{ fontWeight: 'bold', color: colors.text }}>{customerToDelete?.name}</Text>? Tindakan ini tidak dapat dibatalkan.
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                        <Button 
                            title="Batal" 
                            variant="outline" 
                            style={{ flex: 1 }} 
                            onPress={() => setIsDeleteModalVisible(false)} 
                        />
                        <Button 
                            title={isDeleting ? "..." : "Ya, Hapus"} 
                            style={{ flex: 1, backgroundColor: colors.danger }} 
                            onPress={handleConfirmDelete}
                            disabled={isDeleting}
                        />
                    </View>
                </View>
            </Modal>

            {/* ─── Add/Edit Customer Modal ─── */}
            <Modal 
                visible={isAddCustomerVisible} 
                onClose={() => {
                    setIsAddCustomerVisible(false);
                    setIsEditingCust(false);
                    setEditingCustId(null);
                }} 
                title={isEditingCust ? "Edit Data Penghutang" : "Tambah Data Penghutang"} 
                size="md"
            >
                <View style={{ paddingBottom: 10 }}>
                    <InputField
                        label="Nama Lengkap"
                        value={newCustName}
                        onChangeText={(val) => {
                            setNewCustName(val);
                            if (custErrors.name) setCustErrors({ ...custErrors, name: null });
                        }}
                        placeholder="Contoh: Budi Santoso"
                        error={custErrors.name}
                    />

                    <InputField
                        label="Nomor Telepon / WhatsApp"
                        value={newCustPhone}
                        onChangeText={(val) => {
                            setNewCustPhone(val);
                            if (custErrors.phone) setCustErrors({ ...custErrors, phone: null });
                        }}
                        keyboardType="phone-pad"
                        placeholder="Contoh: 081234567..."
                        error={custErrors.phone}
                    />

                    <InputField
                        label="Alamat Lengkap"
                        value={newCustAddress}
                        onChangeText={setNewCustAddress}
                        placeholder="Contoh: Jl. Merdeka No. 12"
                        multiline
                    />

                    <InputField
                        label={isEditingCust ? "Jumlah Hutang Saat Ini" : "Jumlah Hutang Awal (Opsional)"}
                        value={newCustInitialDebt}
                        onChangeText={setNewCustInitialDebt}
                        placeholder="Contoh: 50000"
                        keyboardType="numeric"
                    />

                    <Button 
                        title={isAddingCust ? "Sedang Menyimpan..." : (isEditingCust ? "Perbarui Data" : "Simpan Data")} 
                        onPress={handleAddCustomer} 
                        style={{ marginTop: 20, marginBottom: 10 }} 
                        disabled={isAddingCust}
                    />
                </View>
            </Modal>

            {/* Custom Alert Modal */}
            <Modal visible={alertState.visible} onClose={closeAlert} title={alertState.title} size="sm" type="center">
                <View style={{ alignItems: 'center', padding: Spacing.md }}>
                    {alertState.type === 'error' && <XCircle size={48} color={colors.danger} />}
                    {alertState.type === 'warning' && <AlertCircle size={48} color={colors.warning} />}
                    {alertState.type === 'success' && <CheckCircle size={48} color={colors.secondary} />}
                    {alertState.type === 'info' && <Info size={48} color={colors.info} />}

                    <Text style={{ textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg, color: colors.textSecondary, fontSize: FontSize.md, lineHeight: 22 }}>
                        {alertState.message}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                        {alertState.onConfirm && (
                            <Button 
                                title="Batal" 
                                onPress={closeAlert} 
                                style={{ flex: 1 }} 
                                variant="outline" 
                                rounded 
                            />
                        )}
                        <Button 
                            title={alertState.onConfirm ? "Konfirmasi" : "Tutup"} 
                            onPress={() => {
                                if (alertState.onConfirm) {
                                    alertState.onConfirm();
                                }
                                closeAlert();
                            }} 
                            style={{ flex: 1 }} 
                            variant={alertState.type === 'error' ? 'danger' : 'primary'} 
                            rounded 
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};



export default DebtsScreen;


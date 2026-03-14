import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Dimensions, Image } from 'react-native';
import {
    ShoppingCart,
    CreditCard,
    Banknote,
    Smartphone,
    User,
    Trash2,
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    XCircle,
    Info,
    Layers,
    Tag,
    ChevronDown,
    Users,
    QrCode
} from 'lucide-react-native';
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
import { Product, Category } from '../types';

const { width } = Dimensions.get('window');
const PRODUCT_ITEM_WIDTH = (width - (Spacing.md * 2) - Spacing.sm) / 2; // 2 column grid

interface PaymentOptionProps {
    active: boolean;
    icon: React.ReactElement<{ color?: string }>;
    label: string;
    onPress: () => void;
    colors: any;
}

const PaymentOption = ({ active, icon, label, onPress, colors }: PaymentOptionProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.paymentOpt,
                {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary + '10' : colors.surface
                }
            ]}
            onPress={onPress}
        >
            <View style={{ marginBottom: 5 }}>{React.cloneElement(icon, { color: active ? colors.primary : colors.textSecondary })}</View>
            <Text style={[styles.paymentLabel, { color: active ? colors.primary : colors.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
    );
};

// Helper: Dapatkan tanggal & waktu saat ini dalam format Indonesia
const getCurrentDateTime = () => {
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const jam = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return { tanggal, jam, full: now };
};

const POSScreen: React.FC = () => {
    const { colors, addToCart, cart, cartTotal, clearCart, updateCartQty, removeFromCart, fetchDashboard, user } = useApp();
    const insets = useSafeAreaInsets();
    // Hitung tinggi tab bar dinamis (sama seperti di App.tsx)
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);
    const FLOAT_BOTTOM = TAB_BAR_HEIGHT + 16; // 16px gap di atas tab bar
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Filter Mode: 'category' atau 'group'
    const [filterMode, setFilterMode] = useState<'category' | 'group'>('category');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    // Modal Visual States
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [isQRISModalVisible, setIsQRISModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Custom Alert State
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    // Transaction States
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState('');
    const [transactionTime, setTransactionTime] = useState(getCurrentDateTime());
    const [lastInvoice, setLastInvoice] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string, phone?: string } | null>(null);
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [selectionCustomers, setSelectionCustomers] = useState<any[]>([]);
    const [isAddQuickCustomer, setIsAddQuickCustomer] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [newCustomerAddress, setNewCustomerAddress] = useState('');
    const [addingCustomer, setAddingCustomer] = useState(false);
    const [customerModalMode, setCustomerModalMode] = useState<'choice' | 'search'>('choice');

    const fetchCustomersForSelection = useCallback(async () => {
        try {
            const res = await api.get('/customers', { params: { search: customerSearchQuery, limit: 50 } });
            setSelectionCustomers(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    }, [customerSearchQuery]);

    useEffect(() => {
        if (isCustomerModalVisible) {
            fetchCustomersForSelection();
        }
    }, [fetchCustomersForSelection, isCustomerModalVisible]);

    // Update waktu setiap detik saat checkout modal terbuka
    useEffect(() => {
        if (isCheckoutVisible) {
            const timer = setInterval(() => {
                setTransactionTime(getCurrentDateTime());
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isCheckoutVisible]);

    const amountPaidNum = Number(amountPaid) || 0;
    const changeAmount = amountPaidNum - cartTotal;
    const isPaymentSufficient = amountPaidNum >= cartTotal;

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertState({ visible: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const getQuickNominals = () => {
        if (cartTotal <= 0) return [];
        const nominals = [];
        nominals.push({ label: 'Uang Pas', value: cartTotal });
        const roundups = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
        for (const r of roundups) {
            const rounded = Math.ceil(cartTotal / r) * r;
            if (rounded > cartTotal && !nominals.find(n => n.value === rounded)) {
                nominals.push({ label: formatRupiah(rounded), value: rounded });
            }
            if (nominals.length >= 6) break;
        }
        return nominals;
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get('/products', { params: { search: searchQuery, category: selectedCategory, limit: 100 } }),
                api.get('/products/categories')
            ]);
            setProducts(prodRes.data.data);
            setCategories(catRes.data.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Re-fetch when screen is focused (e.g. coming back from Inventory or Settings)
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // === Fitur Grup Nama Produk Serupa ===
    // Deteksi otomatis kata pertama yang muncul lebih dari 1x
    const nameGroups = useMemo(() => {
        const wordMap: Record<string, number> = {};

        products.forEach(p => {
            // Ambil kata pertama dari nama produk
            const firstWord = p.name.split(' ')[0];
            if (firstWord && firstWord.length >= 2) {
                wordMap[firstWord] = (wordMap[firstWord] || 0) + 1;
            }
        });

        // Hanya tampilkan grup yang memiliki >1 produk (nama serupa)
        return Object.entries(wordMap)
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1]) // Urutkan dari yang paling banyak
            .map(([word, count]) => ({ name: word, count }));
    }, [products]);

    // Filter produk berdasarkan grup nama yang dipilih
    const filteredProducts = useMemo(() => {
        if (filterMode !== 'group' || !selectedGroup) return products;
        return products.filter(p => {
            const firstWord = p.name.split(' ')[0];
            return firstWord === selectedGroup;
        });
    }, [products, filterMode, selectedGroup]);

    const openCheckout = () => {
        setCustomerModalMode(selectedCustomer ? 'search' : 'choice');
        setIsAddQuickCustomer(false);
        setAmountPaid('');
        setPaymentMethod('cash');
        setIsCheckoutVisible(true);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Validation for Partial payment (becomes debt)
        if (paymentMethod === 'cash' && !isPaymentSufficient && !selectedCustomer) {
            showAlert('Pilih Penghutang', 'Uang pembayaran kurang. Silakan pilih penghutang untuk mencatat sisa sebagai hutang.', 'warning');
            return;
        }

        if (paymentMethod === 'qris') {
            setIsQRISModalVisible(true);
            return;
        }

        await processTransaction();
    };

    const processTransaction = async () => {
        const finalAmountPaid = (paymentMethod === 'cash') ? amountPaidNum : cartTotal;
        const finalChange = (paymentMethod === 'cash' && isPaymentSufficient) ? (finalAmountPaid - cartTotal) : 0;
        const debtAmount = (paymentMethod === 'cash' && !isPaymentSufficient) ? (cartTotal - finalAmountPaid) : 0;

        try {
            setIsSaving(true);
            const res = await api.post('/transactions', {
                items: cart,
                paymentMethod: paymentMethod, // Uses 'cash' or 'e-wallet' which matches DB ENUM
                amountPaid: finalAmountPaid,
                change: finalChange,
                cashier: 'Kasir Utama',
                customerId: selectedCustomer?.id,
                customerName: selectedCustomer?.name
            });

            // If there's debt, also create debt record
            if (debtAmount > 0 && selectedCustomer) {
                await api.post('/debts', {
                    customerId: selectedCustomer.id,
                    customerName: selectedCustomer.name,
                    amount: debtAmount,
                    items: cart.map(i => i.name).join(', '),
                    transactionId: res.data?.data?.id,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days
                });
            }

            setLastInvoice(res.data?.data?.invoiceNumber || `INV-${Date.now()}`);
            setIsCheckoutVisible(false);
            setIsQRISModalVisible(false);
            
            // Refresh data globally
            fetchDashboard();
            
            setTimeout(() => setIsSuccessVisible(true), 500);
        } catch (err) {
            showAlert('Gagal', 'Terjadi kesalahan saat memproses transaksi.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseSuccess = () => {
        setIsSuccessVisible(false);
        setIsCartVisible(false);
        clearCart();
        setAmountPaid('');
        setSelectedCustomer(null);
        setSearchQuery(''); // Clear search to show updated stock
    };

    const renderProduct = useCallback(({ item, index }: { item: Product, index: number }) => (
        <AnimatedView delay={(index % 10) * 80} style={{ width: PRODUCT_ITEM_WIDTH, marginBottom: Spacing.md }}>
            <TouchableOpacity
                style={[styles.productItem, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg, width: '100%' }, Shadow.sm]}
                onPress={() => item && item.stock > 0 ? addToCart(item) : showAlert('Stok Habis', `Produk ${item.name} sedang tidak tersedia.`, 'warning')}
                activeOpacity={0.9}
            >
                <View style={[styles.productImagePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg }} resizeMode="cover" />
                    ) : (
                        <Text style={{ color: colors.textTertiary, fontSize: FontSize.xs }}>No Img</Text>
                    )}
                </View>
                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>{formatRupiah(item.sellPrice)}</Text>
                    <View style={styles.stockRow}>
                        <Text style={[styles.productStock, { color: item.stock <= 10 ? colors.danger : colors.textSecondary }]}>
                            Stok: {item.stock}
                        </Text>
                        {item.stock <= 10 && <Badge text="Low" variant="danger" size="sm" />}
                    </View>
                </View>
            </TouchableOpacity>
        </AnimatedView>
    ), [colors, addToCart]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top Filter & Search */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Cari produk atau scan..."
                />

                {/* Toggle Filter Mode: Kategori / Grup Nama */}
                <View style={styles.filterToggleRow}>
                    <TouchableOpacity
                        style={[
                            styles.filterToggleBtn,
                            filterMode === 'category'
                                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                : { backgroundColor: colors.surface, borderColor: colors.border }
                        ]}
                        onPress={() => { setFilterMode('category'); setSelectedGroup(null); }}
                    >
                        <Tag size={14} color={filterMode === 'category' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.filterToggleText, { color: filterMode === 'category' ? '#FFF' : colors.textSecondary }]}>Kategori</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterToggleBtn,
                            filterMode === 'group'
                                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                : { backgroundColor: colors.surface, borderColor: colors.border }
                        ]}
                        onPress={() => { setFilterMode('group'); setSelectedCategory(null); }}
                    >
                        <Layers size={14} color={filterMode === 'group' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.filterToggleText, { color: filterMode === 'group' ? '#FFF' : colors.textSecondary }]}>Grup Nama</Text>
                        {nameGroups.length > 0 && (
                            <View style={[styles.groupCountBadge, { backgroundColor: filterMode === 'group' ? '#FFF' : colors.primary }]}>
                                <Text style={[styles.groupCountText, { color: filterMode === 'group' ? colors.primary : '#FFF' }]}>{nameGroups.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Filter Chips berdasarkan mode */}
                {filterMode === 'category' ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList} contentContainerStyle={{ paddingRight: Spacing.lg }}>
                        <TouchableOpacity
                            style={[styles.categoryBtn, !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[styles.categoryText, { color: !selectedCategory ? '#FFF' : colors.textSecondary }]}>Semua</Text>
                        </TouchableOpacity>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryBtn,
                                    selectedCategory === cat.id
                                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                        : { backgroundColor: colors.surface, borderColor: colors.border }
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? '#FFF' : colors.textSecondary }]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList} contentContainerStyle={{ paddingRight: Spacing.lg }}>
                        <TouchableOpacity
                            style={[styles.categoryBtn, !selectedGroup && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                            onPress={() => setSelectedGroup(null)}
                        >
                            <Text style={[styles.categoryText, { color: !selectedGroup ? '#FFF' : colors.textSecondary }]}>Semua</Text>
                        </TouchableOpacity>
                        {nameGroups.map(group => (
                            <TouchableOpacity
                                key={group.name}
                                style={[
                                    styles.groupBtn,
                                    selectedGroup === group.name
                                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                        : { backgroundColor: colors.surface, borderColor: colors.border }
                                ]}
                                onPress={() => setSelectedGroup(group.name)}
                            >
                                <Text style={[styles.categoryText, { color: selectedGroup === group.name ? '#FFF' : colors.textSecondary }]}>
                                    {group.name}
                                </Text>
                                <View style={[
                                    styles.chipBadge,
                                    { backgroundColor: selectedGroup === group.name ? '#FFFFFF40' : colors.primary + '20' }
                                ]}>
                                    <Text style={[
                                        styles.chipBadgeText,
                                        { color: selectedGroup === group.name ? '#FFF' : colors.primary }
                                    ]}>{group.count}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Product Grid */}
            {loading ? (
                <LoadingSkeleton count={6} variant="grid" />
            ) : filteredProducts.length === 0 ? (
                <EmptyState title="Produk tidak ditemukan" subtitle={filterMode === 'group' && selectedGroup ? `Tidak ada produk dengan nama "${selectedGroup}"` : "Coba kata kunci lain atau pilih kategori lain."} />
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={[styles.productList, { paddingBottom: FLOAT_BOTTOM + 80 }]}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <View style={[styles.floatingCartContainer, { bottom: FLOAT_BOTTOM }]}>
                    <TouchableOpacity
                        style={[styles.cartBar, { backgroundColor: colors.primary }, Shadow.lg]}
                        onPress={() => setIsCartVisible(true)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.cartBarLeft}>
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cart.reduce((s, i) => s + i.qty, 0)}</Text>
                            </View>
                            <Text style={styles.cartBarTotal}>{formatRupiah(cartTotal)}</Text>
                        </View>
                        <View style={styles.cartBarRight}>
                            <Text style={styles.cartBarLabel}>Keranjang</Text>
                            <ShoppingCart size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Cart Modal */}
            <Modal visible={isCartVisible} onClose={() => setIsCartVisible(false)} title="Keranjang Belanja" size="lg">
                <View style={[styles.cartItems, { maxHeight: 400 }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {cart.map(item => (
                            <View key={item.productId} style={[styles.cartItem, { borderBottomColor: colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cartItemName, { color: colors.text }]}>{item.name}</Text>
                                    <Text style={[styles.cartItemPrice, { color: colors.textSecondary }]}>{formatRupiah(item.price)} × {item.qty} = {formatRupiah(item.price * item.qty)}</Text>
                                </View>
                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                                        onPress={() => updateCartQty(item.productId, item.qty - 1)}
                                    >
                                        <Text style={{ color: colors.text }}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.qtyText, { color: colors.text }]}>{item.qty}</Text>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                                        onPress={() => updateCartQty(item.productId, item.qty + 1)}
                                    >
                                        <Text style={{ color: colors.text }}>+</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.productId)}>
                                        <Trash2 size={18} color={colors.danger} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={[styles.cartSummary, { borderTopColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: colors.textSecondary }}>Total Item</Text>
                        <Text style={{ color: colors.text }}>{cart.reduce((s, i) => s + i.qty, 0)} barang</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginBottom: Spacing.lg }]}>
                        <Text style={{ color: colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.lg }}>Total Bayar</Text>
                        <Text style={{ color: colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.xl }}>{formatRupiah(cartTotal)}</Text>
                    </View>
                    <Button title="Lanjut Pembayaran" onPress={openCheckout} size="lg" rounded />
                </View>
            </Modal>

            {/* Checkout Modal */}
            <Modal visible={isCheckoutVisible} onClose={() => setIsCheckoutVisible(false)} title="Pembayaran" size="lg">
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Tanggal & Waktu Transaksi */}
                    <View style={[styles.dateTimeBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                        <View style={styles.dateTimeRow}>
                            <Calendar size={16} color={colors.primary} />
                            <Text style={[styles.dateTimeText, { color: colors.text }]}>{transactionTime.tanggal}</Text>
                        </View>
                        <View style={styles.dateTimeRow}>
                            <Clock size={16} color={colors.primary} />
                            <Text style={[styles.dateTimeText, { color: colors.text }]}>{transactionTime.jam}</Text>
                        </View>
                    </View>

                    {/* Pilih Penghutang (Dropdown Style) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md }}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Pembeli / Penghutang</Text>
                        {selectedCustomer && (
                            <Badge text="STATUS: PENGHUTANG" variant="success" />
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.customerSelectBtn, { backgroundColor: colors.surface, borderColor: selectedCustomer ? colors.primary : colors.border, borderLeftWidth: selectedCustomer ? 5 : 1 }]}
                        onPress={() => {
                            setCustomerModalMode(selectedCustomer ? 'search' : 'choice');
                            fetchCustomersForSelection();
                            setIsCustomerModalVisible(true);
                        }}
                    >
                        <View style={styles.customerSelectInfo}>
                            <User size={18} color={selectedCustomer ? colors.primary : colors.textTertiary} />
                            <Text style={[styles.customerSelectText, { color: selectedCustomer ? colors.text : colors.textTertiary, fontWeight: selectedCustomer ? 'bold' : 'normal' }]}>
                                {selectedCustomer ? selectedCustomer.name.toUpperCase() : 'Beli Umum (Klik untuk pilih/tambah nama)'}
                            </Text>
                        </View>
                        {selectedCustomer ? (
                            <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                                <XCircle size={18} color={colors.danger} />
                            </TouchableOpacity>
                        ) : (
                            <ChevronDown size={18} color={colors.textTertiary} />
                        )}
                    </TouchableOpacity>

                    {/* Warning if Credit selected but no customer */}
                    {paymentMethod === 'credit' && !selectedCustomer && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 15 }}>
                            <AlertCircle size={14} color={colors.danger} />
                            <Text style={{ color: colors.danger, fontSize: 11, fontWeight: 'bold' }}>Hutang wajib pilih/tambah nama!</Text>
                        </View>
                    )}

                    {/* Total Belanja */}
                    <View style={styles.checkoutTotalBox}>
                        <Text style={[styles.checkoutTotalLabel, { color: colors.textSecondary }]}>TOTAL BELANJA</Text>
                        <Text style={[styles.checkoutTotal, { color: colors.primary }]}>{formatRupiah(cartTotal)}</Text>
                    </View>

                    {/* Metode Pembayaran */}
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Metode Pembayaran</Text>
                    <View style={styles.paymentGrid}>
                        <PaymentOption active={paymentMethod === 'cash'} icon={<Banknote size={24} color={undefined} />} label="Tunai" onPress={() => setPaymentMethod('cash')} colors={colors} />
                        <PaymentOption active={paymentMethod === 'qris'} icon={<QrCode size={24} color={undefined} />} label="QRIS" onPress={() => setPaymentMethod('qris')} colors={colors} />
                    </View>

                    {/* Input Nominal (hanya untuk tunai) */}
                    {paymentMethod === 'cash' && (
                        <View style={styles.nominalSection}>
                            <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.xl }]}>Nominal Diberikan</Text>
                            <View style={[styles.nominalInputBox, { backgroundColor: colors.surfaceVariant, borderColor: isPaymentSufficient && amountPaid !== '' ? colors.secondary : (amountPaid !== '' ? colors.danger : colors.border) }]}>
                                <Text style={[styles.nominalPrefix, { color: colors.textSecondary }]}>Rp</Text>
                                <TextInput
                                    style={[styles.nominalInput, { color: colors.text }]}
                                    value={amountPaid}
                                    onChangeText={(text) => setAmountPaid(text.replace(/[^0-9]/g, ''))}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>

                            {/* Quick Nominal Buttons */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickNominalScroll}>
                                <View style={styles.quickNominalRow}>
                                    {getQuickNominals().map((nom, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.quickNominalBtn,
                                                {
                                                    backgroundColor: Number(amountPaid) === nom.value ? colors.primary : colors.surface,
                                                    borderColor: Number(amountPaid) === nom.value ? colors.primary : colors.border,
                                                }
                                            ]}
                                            onPress={() => setAmountPaid(String(nom.value))}
                                        >
                                            <Text style={[
                                                styles.quickNominalText,
                                                { color: Number(amountPaid) === nom.value ? '#FFF' : colors.text }
                                            ]}>{nom.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Kembalian */}
                            {amountPaid !== '' && (
                                <View style={[
                                    styles.changeBox,
                                    {
                                        backgroundColor: isPaymentSufficient ? colors.successLight : colors.dangerLight,
                                        borderColor: isPaymentSufficient ? colors.secondary + '40' : colors.danger + '40',
                                    }
                                ]}>
                                    <View style={styles.changeRow}>
                                        <Text style={[styles.changeFinalLabel, { color: isPaymentSufficient ? colors.secondary : colors.danger }]}>
                                            {isPaymentSufficient ? 'Kembalian' : 'Kurang'}
                                        </Text>
                                        <Text style={[styles.changeFinalValue, { color: isPaymentSufficient ? colors.secondary : colors.danger }]}>
                                            {isPaymentSufficient ? formatRupiah(changeAmount) : formatRupiah(Math.abs(changeAmount))}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    <Button
                        title="Proses Transaksi"
                        variant="primary"
                        onPress={handleCheckout}
                        loading={isSaving}
                        disabled={(paymentMethod === 'cash' && !isPaymentSufficient && !selectedCustomer)}
                        style={{ marginTop: Spacing.xl, marginBottom: 20 }}
                        rounded
                        size="lg"
                    />
                </ScrollView>
            </Modal>

            {/* QRIS Payment Modal */}
            <Modal visible={isQRISModalVisible} onClose={() => setIsQRISModalVisible(false)} title="Pembayaran QRIS" size="md">
                <View style={{ alignItems: 'center', padding: Spacing.md }}>
                    <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }}>
                        Silakan scan barcode di bawah ini untuk membayar senilai:
                    </Text>
                    
                    <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: colors.primary, marginBottom: Spacing.xl }}>
                        {formatRupiah(cartTotal)}
                    </Text>

                    <View style={{ 
                        width: '100%', 
                        height: 400, 
                        backgroundColor: '#FFF', 
                        borderRadius: BorderRadius.xl,
                        padding: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                        overflow: 'hidden'
                    }}>
                        {/* QRIS Image from User Profile or Placeholder */}
                        {user?.qrisImage ? (
                            <Image 
                                source={{ uri: user.qrisImage }} 
                                style={{ width: '100%', height: '100%' }} 
                                resizeMode="contain" 
                            />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <QrCode size={180} color={colors.text} strokeWidth={1.5} />
                                <View style={{ 
                                    marginTop: 20,
                                    backgroundColor: colors.primary, 
                                    paddingHorizontal: 20, 
                                    paddingVertical: 8, 
                                    borderRadius: 20 
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>SCAN QRIS</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <Text style={{ marginTop: Spacing.xl, fontSize: 11, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }}>
                        Pastikan pembayaran sudah masuk di HP Anda sebelum menekan tombol konfirmasi.
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: Spacing.xl, width: '100%' }}>
                        <Button 
                            title="Batal" 
                            onPress={() => setIsQRISModalVisible(false)} 
                            variant="outline" 
                            style={{ flex: 1 }}
                            rounded
                        />
                        <Button 
                            title="Konfirmasi" 
                            onPress={processTransaction} 
                            loading={isSaving}
                            variant="primary" 
                            style={{ flex: 1 }}
                            rounded
                        />
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={isSuccessVisible} onClose={handleCloseSuccess} title="" size="md" type="center">
                <View style={styles.successContent}>
                    <View style={[styles.successIconBubble, { backgroundColor: colors.secondary + '20' }]}>
                        <CheckCircle size={48} color={colors.secondary} strokeWidth={3} />
                    </View>
                    <Text style={[styles.successTitle, { color: colors.text }]}>Transaksi Berhasil!</Text>
                    <Text style={[styles.successInvoice, { color: colors.textSecondary }]}>{lastInvoice}</Text>

                    <View style={[styles.successInfoBox, { backgroundColor: colors.surfaceVariant }]}>
                        <View style={styles.successInfoRow}>
                            <Text style={{ color: colors.textSecondary }}>Metode</Text>
                            <Text style={{ color: colors.text, fontWeight: FontWeight.bold }}>
                                {paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}
                            </Text>
                        </View>
                        <View style={[styles.successDivider, { borderTopColor: colors.border }]} />
                        <View style={styles.successInfoRow}>
                            <Text style={{ color: colors.text, fontWeight: FontWeight.bold }}>Total</Text>
                            <Text style={{ color: colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.lg }}>{formatRupiah(cartTotal)}</Text>
                        </View>
                        {paymentMethod === 'cash' && amountPaidNum > 0 && (
                            <View style={styles.successInfoRow}>
                                <Text style={{ color: colors.secondary, fontWeight: FontWeight.bold }}>Kembalian</Text>
                                <Text style={{ color: colors.secondary, fontWeight: FontWeight.bold, fontSize: FontSize.lg }}>{formatRupiah(changeAmount)}</Text>
                            </View>
                        )}
                    </View>

                    <Button title="Transaksi Baru" onPress={handleCloseSuccess} style={{ marginTop: Spacing.xl, width: '100%' }} rounded />
                </View>
            </Modal>

            {/* Customer Selection Modal */}
            <Modal 
                visible={isCustomerModalVisible} 
                onClose={() => setIsCustomerModalVisible(false)} 
                title={customerModalMode === 'choice' ? 'Tipe Pembeli' : 'Detail Pelanggan'} 
                size="md"
            >
                <View style={{ paddingBottom: 20 }}>
                    {customerModalMode === 'choice' ? (
                        <View style={{ gap: 12, paddingVertical: 10 }}>
                            <TouchableOpacity
                                style={[styles.choiceBtn, { backgroundColor: colors.surfaceVariant, borderColor: !selectedCustomer ? colors.primary : colors.border }]}
                                onPress={() => {
                                    setSelectedCustomer(null);
                                    setIsCustomerModalVisible(false);
                                }}
                            >
                                <View style={[styles.choiceIcon, { backgroundColor: !selectedCustomer ? colors.primary : '#FFF' }]}>
                                    <Users size={24} color={!selectedCustomer ? '#FFF' : colors.textSecondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.choiceTitle, { color: colors.text }]}>Pembeli Umum</Text>
                                    <Text style={[styles.choiceSub, { color: colors.textSecondary }]}>Bayar langsung tanpa nama</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.choiceBtn, { backgroundColor: colors.surfaceVariant, borderColor: selectedCustomer ? colors.primary : colors.border }]}
                                onPress={() => setCustomerModalMode('search')}
                            >
                                <View style={[styles.choiceIcon, { backgroundColor: selectedCustomer ? colors.primary : '#FFF' }]}>
                                    <User size={24} color={selectedCustomer ? '#FFF' : colors.textSecondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.choiceTitle, { color: colors.text }]}>Hutang / Beridentitas</Text>
                                    <Text style={[styles.choiceSub, { color: colors.textSecondary }]}>Catat nama untuk langganan atau hutang</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <SearchBar
                                value={customerSearchQuery}
                                onChangeText={setCustomerSearchQuery}
                                placeholder="Cari nama penghutang..."
                            />
                            
                            {!isAddQuickCustomer ? (
                                <>
                                    <View style={{ maxHeight: 250, marginTop: Spacing.md }}>
                                        <ScrollView showsVerticalScrollIndicator={false}>
                                            {selectionCustomers.map(c => (
                                                <TouchableOpacity
                                                    key={c.id}
                                                    style={[styles.customerItemOption, { borderBottomColor: colors.border }]}
                                                    onPress={() => {
                                                        setSelectedCustomer({ id: c.id, name: c.name, phone: c.phone });
                                                        setIsCustomerModalVisible(false);
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <View>
                                                            <Text style={{ color: colors.text, fontWeight: FontWeight.bold }}>{c.name}</Text>
                                                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{c.phone || 'No Phone'}</Text>
                                                        </View>
                                                        {c.totalDebt > 0 && (
                                                            <View style={{ alignItems: 'flex-end' }}>
                                                                <Text style={{ fontSize: 9, color: colors.danger, fontWeight: 'bold' }}>HUTANG</Text>
                                                                <Text style={{ fontSize: 11, color: colors.danger, fontWeight: 'bold' }}>{formatRupiah(c.totalDebt)}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                            {selectionCustomers.length === 0 && customerSearchQuery !== '' && (
                                                <Text style={{ textAlign: 'center', padding: 20, color: colors.textTertiary }}>Nama tidak ditemukan</Text>
                                            )}
                                        </ScrollView>
                                    </View>
                                    
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: Spacing.md }}>
                                        <Button
                                            title="Kembali"
                                            variant="outline"
                                            style={{ flex: 1 }}
                                            onPress={() => setCustomerModalMode('choice')}
                                        />
                                        <Button
                                            title="Tambah Baru"
                                            style={{ flex: 2 }}
                                            onPress={() => setIsAddQuickCustomer(true)}
                                        />
                                    </View>
                                </>
                            ) : (
                                <AnimatedView delay={100} style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.lg }}>
                                    <Text style={[styles.label, { fontSize: FontSize.sm, marginBottom: 10, color: colors.text }]}>Tambah Pelanggan Baru</Text>
                                    <TextInput
                                        style={[styles.quickInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                        placeholder="Nama Lengkap"
                                        value={newCustomerName}
                                        onChangeText={setNewCustomerName}
                                    />
                                    <TextInput
                                        style={[styles.quickInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginTop: 10 }]}
                                        placeholder="Nomor HP"
                                        value={newCustomerPhone}
                                        onChangeText={setNewCustomerPhone}
                                        keyboardType="phone-pad"
                                    />
                                    <TextInput
                                        style={[styles.quickInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, marginTop: 10, height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                                        placeholder="Alamat Lengkap"
                                        value={newCustomerAddress}
                                        onChangeText={setNewCustomerAddress}
                                        multiline
                                    />
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                                        <Button
                                            title="Batal"
                                            variant="outline"
                                            style={{ flex: 1 }}
                                            onPress={() => setIsAddQuickCustomer(false)}
                                        />
                                        <Button
                                            title={addingCustomer ? "..." : "Simpan"}
                                            style={{ flex: 1 }}
                                            onPress={async () => {
                                                if (!newCustomerName) return showAlert('Nama Wajib', 'Harap isi nama.', 'warning');
                                                setAddingCustomer(true);
                                                try {
                                                    const res = await api.post('/customers', { 
                                                        name: newCustomerName, 
                                                        phone: newCustomerPhone || '000000000',
                                                        address: newCustomerAddress
                                                    });
                                                    if (res.data.success) {
                                                        setSelectedCustomer({ id: res.data.data.id, name: newCustomerName });
                                                        setIsAddQuickCustomer(false);
                                                        setIsCustomerModalVisible(false);
                                                        setNewCustomerName('');
                                                        setNewCustomerPhone('');
                                                        setNewCustomerAddress('');
                                                        setCustomerSearchQuery(''); // Refresh customer list
                                                        fetchDashboard(); // Trigger dashboard update for customer count
                                                    }
                                                } catch (err: any) {
                                                    const errorMsg = err.response?.data?.error || 'Gagal menambah pelanggan.';
                                                    showAlert('Gagal', errorMsg, 'error');
                                                } finally {
                                                    setAddingCustomer(false);
                                                }
                                            }}
                                            disabled={addingCustomer}
                                        />
                                    </View>
                                </AnimatedView>
                            )}
                        </>
                    )}
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

                    <Button title="Tutup" onPress={closeAlert} style={{ width: '100%' }} variant={alertState.type === 'error' ? 'danger' : 'primary'} rounded />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },

    // Filter Toggle
    filterToggleRow: { flexDirection: 'row', gap: 8 },
    filterToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    filterToggleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
    groupCountBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    groupCountText: { fontSize: 10, fontWeight: FontWeight.bold },

    // Filter Chips
    categoryList: { paddingVertical: Spacing.sm },
    categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 6, borderWidth: 1 },
    categoryText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
    groupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 6,
        borderWidth: 1,
    },
    chipBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    chipBadgeText: { fontSize: 9, fontWeight: FontWeight.bold },

    productList: { padding: Spacing.md },
    columnWrapper: { justifyContent: 'space-between', marginBottom: Spacing.sm },
    productItem: {
        width: PRODUCT_ITEM_WIDTH,
        overflow: 'hidden',
        paddingBottom: Spacing.xs,
    },
    productImagePlaceholder: {
        height: PRODUCT_ITEM_WIDTH, // Square image
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
    },
    productInfo: { padding: Spacing.sm },
    productName: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginBottom: 2 },
    productPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    productStock: { fontSize: 10 },

    // Floating Cart
    floatingCartContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        zIndex: 5,
    },
    cartBar: {
        width: '100%',
        height: 56,
        borderRadius: BorderRadius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cartBadge: { backgroundColor: '#FFF', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    cartBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
    cartBarTotal: { color: '#FFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    cartBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cartBarLabel: { color: '#FFF', fontWeight: FontWeight.bold },

    // Cart Modal
    cartItems: { marginBottom: 20 },
    cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
    cartItemName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    cartItemPrice: { fontSize: FontSize.sm, marginTop: 2 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    qtyBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    qtyText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, width: 24, textAlign: 'center' },
    removeBtn: { marginLeft: 8 },
    cartSummary: { paddingTop: Spacing.lg, borderTopWidth: 1 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },

    // Date Time Box
    dateTimeBox: { padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.xl, gap: 6 },
    dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateTimeText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

    // Checkout
    checkoutTotalBox: { alignItems: 'center', marginBottom: Spacing.xl },
    checkoutTotalLabel: { fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: 4 },
    checkoutTotal: { fontSize: FontSize.display, fontWeight: FontWeight.bold },
    label: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 15 },
    paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    paymentOpt: { width: '48%', height: 90, borderRadius: BorderRadius.xl, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 6 },
    paymentLabel: { fontWeight: FontWeight.bold, fontSize: FontSize.sm },

    // Nominal
    nominalSection: {},
    nominalInputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, borderWidth: 2, paddingHorizontal: Spacing.md, marginBottom: Spacing.md, height: 60 },
    nominalPrefix: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginRight: 8 },
    nominalInput: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, paddingVertical: 0, height: '100%' },
    quickNominalScroll: { marginBottom: Spacing.md },
    quickNominalRow: { flexDirection: 'row', gap: 8 },
    quickNominalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: BorderRadius.full, borderWidth: 1 },
    quickNominalText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

    // Change Box
    changeBox: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, alignItems: 'center', marginTop: Spacing.md },
    changeRow: { alignItems: 'center', gap: 4 },
    changeFinalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    changeFinalValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold },

    // Success Modal
    successContent: { alignItems: 'center', paddingVertical: Spacing.lg },
    successIconBubble: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
    successTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 4 },
    successInvoice: { fontSize: FontSize.sm, marginBottom: Spacing.xl },
    successInfoBox: { width: '100%', padding: Spacing.lg, borderRadius: BorderRadius.xl, gap: 8 },
    successInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    successDivider: { borderTopWidth: 1, marginVertical: 8 },
    customerSelectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        marginTop: 6,
        marginBottom: Spacing.md,
    },
    customerSelectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    customerSelectText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    customerItemOption: {
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
    },
    quickInput: {
        height: 45,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: FontSize.sm,
    },
    choiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        gap: 16,
    },
    choiceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    choiceSub: {
        fontSize: 11,
        marginTop: 2,
    },
});

export default POSScreen;

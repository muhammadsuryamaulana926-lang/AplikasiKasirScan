import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { FileText, Calendar, Filter, Printer, RotateCcw, Search, ChevronDown, CheckCircle, XCircle, ShoppingBag, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import api from '../services/api';
import SearchBar from '../components/shared/SearchBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { Spacing, FontSize, FontWeight, formatRupiah, formatDateTime, BorderRadius, Shadow } from '../theme';
import { LoadingSkeleton, EmptyState } from '../components/shared/States';
import AnimatedView from '../components/shared/AnimatedView';
import { Transaction } from '../types';

const TransactionsScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useApp();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/transactions', { params: { search: searchQuery, limit: 100 } });
            setTransactions(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTransactions();
    };

    const handleRefund = async () => {
        if (!selectedTrx) return;

        // Custom Alert Logic here instead of native Alert if possible, but keeping native for destructive action safety
        Alert.alert(
            'Konfirmasi Refund',
            'Apakah Anda yakin? Stok barang akan dikembalikan.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Refund Sekarang',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.put(`/transactions/${selectedTrx.id}/refund`);
                            fetchTransactions();
                            setSelectedTrx(null);
                            Alert.alert('Sukses', 'Transaksi berhasil di-refund.');
                        } catch (err) {
                            Alert.alert('Gagal', 'Terjadi kesalahan saat refund.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = useCallback(({ item, index }: { item: Transaction, index: number }) => {
        const isRefund = item.status === 'refunded';
        return (
            <AnimatedView delay={(index % 10) * 60} style={{ marginBottom: Spacing.md }}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg, marginBottom: 0 }, Shadow.sm]}
                    onPress={() => setSelectedTrx(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF' }]}>
                            {isRefund ? <RotateCcw size={20} color={colors.danger} /> : <ShoppingBag size={20} color={colors.success} />}
                        </View>
                        <View>
                            <Text style={[styles.invoiceText, { color: colors.text }]}>{item.invoiceNumber}</Text>
                            <Text style={[styles.dateText, { color: colors.textTertiary }]}>{formatDateTime(item.createdAt)}</Text>
                        </View>
                    </View>
                    <View style={styles.cardRight}>
                        <Text style={[styles.amountText, { color: isRefund ? colors.danger : colors.text }]}>
                            {isRefund ? '-' : '+'}{formatRupiah(item.total)}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: isRefund ? colors.danger + '15' : colors.info + '15' }]}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: isRefund ? colors.danger : colors.info }}>
                                {item.paymentMethod ? item.paymentMethod.toUpperCase() : 'CASH'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </AnimatedView>
        );
    }, [colors]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Cari invoice..."
                />
            </View>

            {loading && !refreshing ? (
                <LoadingSkeleton count={6} />
            ) : transactions.length === 0 ? (
                <EmptyState title="Belum ada transaksi" subtitle="Transaksi penjualan akan muncul di sini." />
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                />
            )}

            {/* Detail Modal */}
            <Modal visible={!!selectedTrx} onClose={() => setSelectedTrx(null)} title="Detail Transaksi" size="lg">
                {selectedTrx && (
                    <View>
                        <View style={styles.detailHeader}>
                            <Text style={[styles.detailInvoice, { color: colors.text }]}>{selectedTrx.invoiceNumber}</Text>
                            <Text style={[styles.detailDate, { color: colors.textSecondary }]}>{formatDateTime(selectedTrx.createdAt)}</Text>
                            <View style={[styles.statusPill, { backgroundColor: selectedTrx.status === 'refunded' ? colors.danger : colors.success }]}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>
                                    {selectedTrx.status === 'refunded' ? 'REFUNDED' : 'SUKSES'}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.itemList, { backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md }]}>
                            <View style={styles.itemsHeader}>
                                <Text style={[styles.itemsHeaderTitle, { color: colors.textSecondary }]}>DAFTAR BARANG</Text>
                            </View>
                            {selectedTrx.items && selectedTrx.items.length > 0 ? (
                                selectedTrx.items.map((item: any, idx: number) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                                                {item.qty} x {formatRupiah(item.price)}
                                            </Text>
                                        </View>
                                        <Text style={[styles.itemSubtotal, { color: colors.text }]}>
                                            {formatRupiah(item.price * item.qty)}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.itemRow}>
                                    <Text style={{ color: colors.textSecondary }}>Data barang tidak tersedia</Text>
                                </View>
                            )}

                            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: Spacing.sm }]} />

                            <View style={styles.summaryRow}>
                                <Text style={{ color: colors.textSecondary }}>Total Belanja</Text>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{formatRupiah(selectedTrx.total)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={{ color: colors.textSecondary }}>Bayar ({selectedTrx.paymentMethod.toUpperCase()})</Text>
                                <Text style={{ color: colors.text }}>{formatRupiah(selectedTrx.amountPaid || selectedTrx.total)}</Text>
                            </View>
                            {selectedTrx.change > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={{ color: colors.textSecondary }}>Kembalian</Text>
                                    <Text style={{ color: colors.text }}>{formatRupiah(selectedTrx.change)}</Text>
                                </View>
                            )}
                            <View style={styles.summaryRow}>
                                <Text style={{ color: colors.textSecondary }}>Pembeli</Text>
                                <Text style={{ color: colors.text }}>{selectedTrx.customerName || 'Pembeli Umum'}</Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <Button
                                title="Cetak Struk"
                                icon={<Printer size={18} color="#FFF" />}
                                rounded
                                style={{ flex: 1 }}
                            />
                            {selectedTrx.status !== 'refunded' && (
                                <>
                                    <View style={{ width: Spacing.md }} />
                                    <Button
                                        title="Refund"
                                        variant="danger"
                                        icon={<RotateCcw size={18} color="#FFF" />}
                                        rounded
                                        style={{ flex: 1 }}
                                        onPress={handleRefund}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBox: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },

    listContent: { padding: Spacing.md, paddingBottom: 100 },

    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.sm, marginBottom: Spacing.sm },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    iconBox: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
    invoiceText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
    dateText: { fontSize: 10 },

    cardRight: { alignItems: 'flex-end' },
    amountText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

    // Modal
    detailHeader: { alignItems: 'center', marginBottom: Spacing.lg },
    detailInvoice: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 4 },
    detailDate: { fontSize: FontSize.sm, marginBottom: Spacing.md },
    statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },

    itemList: { padding: Spacing.md, gap: Spacing.xs, marginBottom: Spacing.lg },
    itemsHeader: { marginBottom: 8, paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.1)' },
    itemsHeaderTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    itemDetail: { fontSize: 11 },
    itemSubtotal: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
    divider: { height: 1, width: '100%' },

    actionButtons: { flexDirection: 'row' },
});

export default TransactionsScreen;

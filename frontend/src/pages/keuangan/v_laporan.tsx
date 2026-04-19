import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Download, ArrowUpRight, TrendingUp, DollarSign, Calendar } from 'lucide-react-native';
import { gunakanApp } from '../../penyimpanan/pusat_data_aplikasi';
import api from '../../layanan/api';
import Button from '../../komponen/antarmuka/c_tombol';
import { Spacing, FontSize, FontWeight, formatRupiah, BorderRadius, Shadow } from '../../tema';
import { LoadingSkeleton } from '../../komponen/umum/c_status';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, icon, color, trend }: any) => {
    const { warna: colors } = gunakanApp();
    return (
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }, Shadow.sm]}>
            <View style={[styles.statHeader]}>
                <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
                    {React.cloneElement(icon, { size: 20, color: color })}
                </View>
                {trend && (
                    <View style={[styles.trendBadge, { backgroundColor: colors.success + '15' }]}>
                        <ArrowUpRight size={12} color={colors.success} />
                        <Text style={[styles.trendText, { color: colors.success }]}>{trend}</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
};

const BarChart = ({ data, maxVal }: any) => {
    const { warna: colors } = gunakanApp();
    return (
        <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderRadius: BorderRadius.xl }, Shadow.sm]}>
            <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Statistik Penjualan</Text>
                <TouchableOpacity style={[styles.chartFilter, { backgroundColor: colors.surfaceVariant }]}>
                    <Calendar size={14} color={colors.textSecondary} />
                    <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' }}>BULAN INI</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.barsArea}>
                {data.map((item: any, index: number) => {
                    const heightPercent = (item.value / maxVal) * 100;
                    // Cegah tinggi 0 pada batang grafik
                    const barHeight = Math.max(heightPercent, 5);

                    return (
                        <View key={index} style={styles.barGroup}>
                            <View style={styles.barTrack}>
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            height: `${barHeight}%`,
                                            backgroundColor: index === data.length - 1 ? colors.primary : colors.primary + '40'
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const ReportsScreen: React.FC = () => {
    const { warna: colors } = gunakanApp();
    const [dataLaporan, setDataLaporan] = useState<any>(null);
    const [prosesMemuat, setProsesMemuat] = useState(true);
    const [sedangRefresh, setSedangRefresh] = useState(false);

    // Data contoh jika API gagal atau kosong
    const mockChartData = [
        { label: 'Sen', value: 1500000 },
        { label: 'Sel', value: 2100000 },
        { label: 'Rab', value: 1800000 },
        { label: 'Kam', value: 2400000 },
        { label: 'Jum', value: 3200000 },
        { label: 'Sab', value: 4500000 },
        { label: 'Min', value: 3800000 },
    ];

    const ambilDataLaporan = useCallback(async () => {
        try {
            setProsesMemuat(true);
            const hasil = await api.get('/reports/sales');
            setDataLaporan(hasil.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setProsesMemuat(false);
            setSedangRefresh(false);
        }
    }, []);

    useEffect(() => {
        ambilDataLaporan();
    }, [ambilDataLaporan]);

    const tarikUntukRefresh = () => {
        setSedangRefresh(true);
        ambilDataLaporan();
    };

    const maxChartValue = Math.max(...mockChartData.map(d => d.value));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={sedangRefresh} onRefresh={tarikUntukRefresh} colors={[colors.primary]} />}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.header, { marginBottom: Spacing.lg }]}>
                    <Text style={[styles.screenTitle, { color: colors.text }]}>Laporan Toko</Text>
                    <Button
                        title="Unduh"
                        size="sm"
                        variant="outline"
                        icon={<Download size={16} color={colors.primary} />}
                        rounded
                    />
                </View>

                {/* Summary Cards */}
                <View style={styles.statsRow}>
                    <StatCard
                        label="Omzet Bersih"
                        value={formatRupiah(dataLaporan?.totalRevenue || 15450000)} // Nilai cadangan
                        icon={<DollarSign />}
                        color={colors.success}
                        trend="+12%"
                    />
                    <StatCard
                        label="Total Transaksi"
                        value={dataLaporan?.totalTransactions || "142"} // Nilai cadangan
                        icon={<TrendingUp />}
                        color={colors.primary}
                        trend="+5%"
                    />
                </View>

                {/* Main Chart */}
                <BarChart data={mockChartData} maxVal={maxChartValue} />

                {/* Payment Methods Breakdown */}
                <View style={{ marginTop: Spacing.xl }}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Metode Pembayaran</Text>
                    <View style={[styles.breakdownCard, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }, Shadow.sm]}>
                        {[
                            { method: 'Tunai', amount: 8500000, color: colors.success },
                            { method: 'Transfer', amount: 4200000, color: colors.info },
                            { method: 'E-Wallet', amount: 2750000, color: colors.primary },
                        ].map((pay, pIdx) => (
                            <View key={pIdx} style={[styles.breakdownRow, { borderBottomColor: colors.borderLight, borderBottomWidth: pIdx === 2 ? 0 : 1 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pay.color }} />
                                    <Text style={{ fontWeight: 'bold', color: colors.text }}>{pay.method}</Text>
                                </View>
                                <Text style={{ fontWeight: 'bold', color: colors.text }}>{formatRupiah(pay.amount)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.md, paddingTop: Spacing.md },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    screenTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },

    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: { flex: 1, padding: Spacing.md, gap: 2 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
    statIconBox: { width: 32, height: 32, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    statLabel: { fontSize: 10 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, borderRadius: 8, gap: 2 },
    trendText: { fontSize: 10, fontWeight: 'bold' },

    // Grafik
    chartContainer: { padding: Spacing.md },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    chartTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    chartFilter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    barsArea: { flexDirection: 'row', justifyContent: 'space-between', height: 180, alignItems: 'flex-end', paddingTop: 20 },
    barGroup: { alignItems: 'center', gap: 8, flex: 1 },
    barTrack: { height: '100%', width: 8, justifyContent: 'flex-end', borderRadius: 4, backgroundColor: 'transparent' }, // Jalur tidak terlihat
    barFill: { width: '100%', borderRadius: 4 },
    barLabel: { fontSize: 10, fontWeight: 'bold' },

    // Rincian
    sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
    breakdownCard: { padding: Spacing.sm },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
});

export default ReportsScreen;

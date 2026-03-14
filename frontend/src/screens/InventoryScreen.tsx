import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, ScrollView, TextInput, Image, Platform } from 'react-native';
import { Plus, Filter, AlertTriangle, Calendar, Package, MoreVertical, Edit2, Trash2, Search, X, Camera, Image as LucideImage } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
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
import { CameraView, useCameraPermissions } from 'expo-camera';

const InputGroup = ({ label, value, onChangeText, keyboardType = 'default', placeholder, colors }: any) => (
    <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
        <TextInput
            style={[styles.inputField, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
        />
    </View>
);

const InventoryScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useApp();
    const insets = useSafeAreaInsets();
    // Hitung tinggi tab bar dinamis (sama seperti di App.tsx)
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);
    const FLOAT_BOTTOM = TAB_BAR_HEIGHT + 16; // 16px gap di atas tab bar
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Modal & Form States
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        sellPrice: '',
        buyPrice: '',
        stock: '',
        minStock: '10',
        unit: 'pcs',
        categoryId: '',
        image: null as string | null,
        expiryDate: null as string | null,
        supplier: '',
    });

    const [isScanning, setIsScanning] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    // Alert State
    const [alertState, setAlertState] = useState({ visible: false, title: '', message: '', type: 'info' as 'success' | 'error' });

    const fetchCommonData = useCallback(async () => {
        try {
            const catRes = await api.get('/products/categories');
            setCategories(catRes.data.data || []);
        } catch (err) {
            console.error('Fetch categories error:', err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/products', { 
                params: { 
                    search: searchQuery, 
                    category: selectedCategory,
                    limit: 100 
                } 
            });
            setProducts(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        fetchCommonData();
    }, [fetchCommonData]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Re-fetch when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [fetchProducts])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleOpenForm = (product?: Product) => {
        if (product) {
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                barcode: product.barcode,
                sellPrice: String(product.sellPrice),
                buyPrice: String(product.buyPrice),
                stock: String(product.stock),
                minStock: String(product.minStock),
                unit: product.unit,
                categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : ''),
                image: product.image || null,
                expiryDate: product.expiryDate || null,
                supplier: product.supplier || '',
            });
        } else {
            setSelectedProduct(null);
            setFormData({
                name: '', 
                barcode: '', 
                sellPrice: '', 
                buyPrice: '', 
                stock: '', 
                minStock: '10', 
                unit: 'pcs', 
                categoryId: categories.length > 0 ? categories[0].id : '', 
                image: null, 
                expiryDate: null, 
                supplier: '',
            });
        }
        setIsScanning(false);
        setIsFormVisible(true);
    };

    // Image Picker Functions
    const pickImageFromGallery = async () => {
        try {
            const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permResult.granted) {
                setAlertState({ visible: true, title: 'Izin Ditolak', message: 'Izinkan akses galeri untuk memilih gambar produk.', type: 'error' });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (asset.base64) {
                    setFormData(prev => ({ ...prev, image: `data:image/jpeg;base64,${asset.base64}` }));
                } else {
                    setFormData(prev => ({ ...prev, image: asset.uri }));
                }
            }
        } catch (error) {
            console.error('Image picker error:', error);
            setAlertState({ visible: true, title: 'Error', message: 'Gagal memilih gambar.', type: 'error' });
        }
    };

    const pickImageFromCamera = async () => {
        try {
            const permResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permResult.granted) {
                setAlertState({ visible: true, title: 'Izin Ditolak', message: 'Izinkan akses kamera untuk mengambil foto produk.', type: 'error' });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (asset.base64) {
                    setFormData(prev => ({ ...prev, image: `data:image/jpeg;base64,${asset.base64}` }));
                } else {
                    setFormData(prev => ({ ...prev, image: asset.uri }));
                }
            }
        } catch (error) {
            console.error('Camera error:', error);
            setAlertState({ visible: true, title: 'Error', message: 'Gagal mengambil foto.', type: 'error' });
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
    };

    const handleStartScan = async () => {
        if (!cameraPermission?.granted) {
            const result = await requestCameraPermission();
            if (!result.granted) {
                setAlertState({ visible: true, title: 'Izin Ditolak', message: 'Izinkan akses kamera untuk scan barcode.', type: 'error' });
                return;
            }
        }
        setIsScanning(true);
    };

    const handleBarCodeScanned = ({ data }: { type: string, data: string }) => {
        setFormData(prev => ({ ...prev, barcode: data }));
        setIsScanning(false);
        setAlertState({ visible: true, title: 'Berhasil', message: `Barcode terscan: ${data}`, type: 'success' });
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsSubmittingCategory(true);
            const res = await api.post('/products/categories', { name: newCategoryName });
            if (res.data.success) {
                await fetchCommonData();
                setFormData(prev => ({ ...prev, categoryId: res.data.data.id }));
                setNewCategoryName('');
                setIsAddingCategory(false);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Gagal menambah kategori.';
            setAlertState({ visible: true, title: 'Error', message: errorMsg, type: 'error' });
        } finally {
            setIsSubmittingCategory(false);
        }
    };

    const handleSave = async () => {
        // Simple Validation
        if (!formData.name || !formData.sellPrice) {
            setAlertState({ visible: true, title: 'Validasi', message: 'Nama dan Harga Jual wajib diisi!', type: 'error' });
            return;
        }

        try {
            const payload = {
                ...formData,
                sellPrice: Number(formData.sellPrice),
                buyPrice: Number(formData.buyPrice),
                stock: Number(formData.stock),
                minStock: Number(formData.minStock),
            };

            if (selectedProduct) {
                await api.put(`/products/${selectedProduct.id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            setIsFormVisible(false);
            setAlertState({ visible: true, title: 'Sukses', message: 'Data produk berhasil disimpan.', type: 'success' });
            fetchProducts();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Gagal menyimpan data.';
            setAlertState({ visible: true, title: 'Error', message: errorMsg, type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        // In real app, show confirmation modal first
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            setAlertState({ visible: true, title: 'Terhapus', message: 'Produk berhasil dihapus.', type: 'success' });
        } catch (err) {
            setAlertState({ visible: true, title: 'Error', message: 'Gagal menghapus produk.', type: 'error' });
        }
    };

    const renderItem = useCallback(({ item, index }: { item: Product, index: number }) => (
        <AnimatedView delay={(index % 10) * 80} style={{ marginBottom: Spacing.md }}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface, borderRadius: BorderRadius.lg }, Shadow.sm, { marginBottom: 0 }]}
                activeOpacity={0.9}
                onPress={() => handleOpenForm(item)}
            >
                <View style={styles.cardLeft}>
                    <View style={[styles.iconBox, { backgroundColor: colors.surfaceVariant }]}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.productThumb} />
                        ) : (
                            <Package size={24} color={colors.primary} />
                        )}
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.barcode || '-'} • {item.categoryName || 'Tanpa Kategori'}</Text>
                        {item.stock <= item.minStock && (
                            <View style={styles.stockWarning}>
                                <AlertTriangle size={12} color={colors.danger} />
                                <Text style={[styles.warningText, { color: colors.danger }]}>Stok Menipis: {item.stock}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <Text style={[styles.priceTag, { color: colors.primary }]}>{formatRupiah(item.sellPrice)}</Text>
                    <Text style={[styles.stockTag, { color: colors.textTertiary }]}>Stok: {item.stock} {item.unit}</Text>
                </View>
            </TouchableOpacity>
        </AnimatedView>
    ), [colors]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Cari nama barang atau kode SKU..."
                />
                
                {/* Category Filter */}
                <View style={styles.categoryFilterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFilterScroll}>
                        <TouchableOpacity 
                            style={[
                                styles.filterChip, 
                                !selectedCategory && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setSelectedCategory(null)}
                        >
                            <Text style={[styles.filterChipText, !selectedCategory && { color: '#FFF' }]}>Semua</Text>
                        </TouchableOpacity>
                        {categories.map(cat => (
                            <TouchableOpacity 
                                key={cat.id}
                                style={[
                                    styles.filterChip, 
                                    selectedCategory === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[styles.filterChipText, selectedCategory === cat.id && { color: '#FFF' }]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {loading && !refreshing ? (
                <LoadingSkeleton count={5} />
            ) : products.length === 0 ? (
                <EmptyState title="Belum ada produk" subtitle="Tambahkan produk pertama anda sekarang." />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: FLOAT_BOTTOM + 60 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary, bottom: FLOAT_BOTTOM }, Shadow.lg]}
                onPress={() => handleOpenForm()}
            >
                <Plus size={28} color="#FFF" />
            </TouchableOpacity>

            {/* Form Modal */}
            <Modal visible={isFormVisible} onClose={() => setIsFormVisible(false)} title={selectedProduct ? "Edit Produk" : "Tambah Produk"} size="lg">
                {/* Image Picker Section */}
                <View style={styles.imageSection}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>Foto Produk</Text>

                    {formData.image ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: formData.image }} style={[styles.imagePreview, { borderColor: colors.border }]} />
                            <TouchableOpacity
                                style={[styles.removeImageBtn, { backgroundColor: colors.danger }]}
                                onPress={removeImage}
                            >
                                <X size={14} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.imagePickerRow}>
                            <TouchableOpacity
                                style={[styles.imagePickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={pickImageFromGallery}
                            >
                                <LucideImage size={24} color={colors.primary} />
                                <Text style={[styles.imagePickerLabel, { color: colors.textSecondary }]}>Galeri</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.imagePickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={pickImageFromCamera}
                            >
                                <Camera size={24} color={colors.primary} />
                                <Text style={[styles.imagePickerLabel, { color: colors.textSecondary }]}>Kamera</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <InputGroup colors={colors} label="Nama Produk" value={formData.name} onChangeText={(t: string) => setFormData({ ...formData, name: t })} placeholder="Contoh: Indomie Goreng" />

                <View style={[styles.inputGroup, { marginBottom: Spacing.md }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Kategori Produk</Text>
                        <TouchableOpacity 
                            onPress={() => setIsAddingCategory(true)}
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                gap: 4,
                                backgroundColor: colors.primary + '10',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12
                            }}
                        >
                            <Plus size={12} color={colors.primary} />
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.primary }}>Kategori Baru</Text>
                        </TouchableOpacity>
                    </View>
                    {categories.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        { 
                                            backgroundColor: formData.categoryId === cat.id ? colors.primary : colors.surface,
                                            borderColor: formData.categoryId === cat.id ? colors.primary : colors.border
                                        }
                                    ]}
                                    onPress={() => setFormData({ ...formData, categoryId: cat.id })}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        { color: formData.categoryId === cat.id ? '#FFF' : colors.textSecondary }
                                    ]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={{ fontSize: 10, color: colors.textTertiary, fontStyle: 'italic', marginLeft: 4 }}>Belum ada kategori tersedia</Text>
                    )}
                </View>

                <View style={[styles.inputGroup, { marginBottom: Spacing.md }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Barcode / SKU</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput
                            style={[styles.inputField, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                            value={formData.barcode}
                            onChangeText={(t: string) => setFormData({ ...formData, barcode: t })}
                            placeholder="Ketik manual"
                            placeholderTextColor={colors.textTertiary}
                        />
                        <TouchableOpacity
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: BorderRadius.md,
                                backgroundColor: colors.primary,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onPress={handleStartScan}
                        >
                            <Camera size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                        <InputGroup colors={colors} label="Harga Beli" value={formData.buyPrice} onChangeText={(t: string) => setFormData({ ...formData, buyPrice: t })} keyboardType="numeric" placeholder="0" />
                    </View>
                    <View style={{ width: Spacing.md }} />
                    <View style={{ flex: 1 }}>
                        <InputGroup colors={colors} label="Harga Jual" value={formData.sellPrice} onChangeText={(t: string) => setFormData({ ...formData, sellPrice: t })} keyboardType="numeric" placeholder="0" />
                    </View>
                </View>

                <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                        <InputGroup colors={colors} label="Stok Saat Ini" value={formData.stock} onChangeText={(t: string) => setFormData({ ...formData, stock: t })} keyboardType="numeric" placeholder="0" />
                    </View>
                    <View style={{ width: Spacing.md }} />
                    <View style={{ flex: 1 }}>
                        <InputGroup colors={colors} label="Min. Stok" value={formData.minStock} onChangeText={(t: string) => setFormData({ ...formData, minStock: t })} keyboardType="numeric" placeholder="10" />
                    </View>
                </View>

                <View style={{ height: Spacing.xl }} />
                <Button title="Simpan Produk" onPress={handleSave} size="md" rounded />

                {selectedProduct && (
                    <TouchableOpacity style={styles.deleteLink} onPress={() => handleDelete(selectedProduct.id)}>
                        <Trash2 size={18} color={colors.danger} />
                        <Text style={{ color: colors.danger, fontWeight: FontWeight.bold }}>Hapus Produk Ini</Text>
                    </TouchableOpacity>
                )}

                {/* Extra spacing at bottom to ensure everything is accessible */}
                <View style={{ height: 30 }} />
            </Modal>

            {/* Fullscreen Scanner Modal */}
            <Modal visible={isScanning} onClose={() => setIsScanning(false)} title="Scan Barcode" size="lg">
                <View style={{ height: Dimensions.get('window').height * 0.6, width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden' }}>
                    {isScanning && (
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            facing="back"
                            onBarcodeScanned={handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr', 'ean13', 'ean8', 'codabar', 'code128', 'code39', 'upc_a', 'upc_e']
                            }}
                        />
                    )}
                    <View style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginLeft: -100,
                        marginTop: -50,
                        width: 200,
                        height: 100,
                        borderWidth: 2,
                        borderColor: colors.success,
                        backgroundColor: 'rgba(255,255,255,0.1)'
                    }} />
                    <Text style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', color: '#FFF', fontWeight: 'bold' }}>
                        Arahkan kamera ke barcode produk
                    </Text>
                </View>
                <Button title="Batal Scan" onPress={() => setIsScanning(false)} style={{ marginTop: Spacing.md }} variant="danger" rounded />
            </Modal>

            {/* Alert Modal */}
            <Modal visible={alertState.visible} onClose={() => setAlertState(prev => ({ ...prev, visible: false }))} title={alertState.title} size="sm">
                <Text style={{ textAlign: 'center', marginBottom: Spacing.lg, color: colors.textSecondary }}>{alertState.message}</Text>
                <Button title="Tutup" onPress={() => setAlertState(prev => ({ ...prev, visible: false }))} variant={alertState.type === 'error' ? 'danger' : 'primary'} rounded />
            </Modal>

            {/* Add Category Modal */}
            <Modal 
                visible={isAddingCategory} 
                onClose={() => setIsAddingCategory(false)} 
                title="Tambah Kategori Baru" 
                size="sm"
                type="center"
            >
                <View style={{ gap: Spacing.md }}>
                    <InputGroup 
                        colors={colors} 
                        label="Nama Kategori" 
                        value={newCategoryName} 
                        onChangeText={setNewCategoryName} 
                        placeholder="Contoh: Snack, Minuman Dingin" 
                    />
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: Spacing.sm }}>
                        <Button 
                            title="Batal" 
                            onPress={() => setIsAddingCategory(false)} 
                            variant="ghost" 
                            style={{ flex: 1 }}
                            rounded
                        />
                        <Button 
                            title="Simpan" 
                            onPress={handleCreateCategory} 
                            loading={isSubmittingCategory}
                            style={{ flex: 1 }}
                            rounded
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: Spacing.md, paddingBottom: Spacing.sm },
    categoryFilterContainer: { marginTop: Spacing.sm },
    categoryFilterScroll: { gap: 8, paddingHorizontal: 2 },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    filterChipText: {
        fontSize: 11,
        fontWeight: FontWeight.semibold,
        color: 'rgba(0,0,0,0.5)',
    },
    listContent: { padding: Spacing.md },

    // Card Styles
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
    iconBox: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    productThumb: { width: 40, height: 40, borderRadius: BorderRadius.sm },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 2 },
    cardSubtitle: { fontSize: 10 },
    stockWarning: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    warningText: { fontSize: 9, fontWeight: FontWeight.bold },

    cardRight: { alignItems: 'flex-end' },
    priceTag: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    stockTag: { fontSize: 10, marginTop: 2 },

    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    // Form Styles
    inputGroup: { marginBottom: Spacing.xs }, // Lebih rapat lagi
    inputLabel: { fontSize: 11, fontWeight: FontWeight.semibold, marginBottom: 2, marginLeft: 4 },
    inputField: {
        height: 42, // Lebih ramping
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: FontSize.sm,
        borderWidth: 0.6, // Garis lebih tipis lagi
    },
    rowInputs: { flexDirection: 'row' },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    categoryChipText: {
        fontSize: 11,
        fontWeight: FontWeight.bold,
    },
    deleteLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.md,
        gap: 8,
        padding: Spacing.sm,
    },

    // Image picker styles
    imageSection: {
        marginBottom: Spacing.sm,
    },
    imagePreviewContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    imagePreview: {
        width: 100, // Lebih kecil lagi
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 0.8,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 0,
        right: '50%',
        marginRight: -58,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    imagePickerRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    imagePickerBtn: {
        flex: 1,
        height: 70, // Lebih pendek
        borderRadius: BorderRadius.md,
        borderWidth: 0.8,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    imagePickerLabel: {
        fontSize: 10,
        fontWeight: FontWeight.medium,
    },

    // Source picker styles
    sourceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    sourceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sourceTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    sourceSub: {
        fontSize: FontSize.xs,
    },
});

export default InventoryScreen;

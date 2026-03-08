import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { useApp } from '../store/AppContext';
import { X, ShoppingCart, CheckCircle } from 'lucide-react-native';
import { Spacing, FontSize, FontWeight, BorderRadius, formatRupiah, Shadow } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { Product } from '../types';
import AnimatedView from '../components/shared/AnimatedView';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

const ScannerScreen = ({ navigation }: any) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [sound, setSound] = useState<any>();
    const [foundProduct, setFoundProduct] = useState<Product | null>(null);
    const [scanMessage, setScanMessage] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    const { colors, addToCart } = useApp();
    const insets = useSafeAreaInsets();

    const isScanningRef = useRef(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    async function playSound() {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                // asumsikan file sound ada di folder assets/sound seperti yg dilist sebelumnya
                require('../../assets/sound/freesound_community-store-scanner-beep-90395.mp3')
            );
            setSound(newSound);
            await newSound.playAsync();
        } catch (error) {
            console.log("Error playing sound", error);
        }
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
        if (scanned || isScanningRef.current) return;

        setScanned(true);
        isScanningRef.current = true;
        await playSound();

        try {
            // Cari produk berdasarkan barcode
            // Asumsikan API support ?search=barcode atau kita fetch semua
            const res = await api.get(`/products?search=${data}`);
            const products: Product[] = res.data.data;

            // Coba cari exact match barcode
            const product = products.find(p => p.barcode === data || p.name.includes(data));

            if (product) {
                setFoundProduct(product);
                addToCart(product);
                setScanMessage(`Berhasil masuk keranjang!`);
            } else {
                setFoundProduct(null);
                setScanMessage(`Produk tidak ditemukan (Barcode: ${data})`);
            }
        } catch (error) {
            setFoundProduct(null);
            setScanMessage('Gagal mencari produk.');
        }

        // Auto reset setelah beberapa detik
        setTimeout(() => {
            setScanned(false);
            isScanningRef.current = false;
        }, 3000);
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text style={{ color: colors.text }}>Meminta izin kamera...</Text></View>;
    }
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={{ color: colors.text }}>Izin kamera ditolak.</Text>
                <Button title="Kembali" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'codabar', 'code128', 'code39', 'upc_a', 'upc_e']
                }}
            />

            {/* Header / Back Button */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 40) }]}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    onPress={() => navigation.goBack()}
                >
                    <X size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Barcode</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Target Area Overlay */}
            <View style={styles.overlay}>
                <View style={[styles.targetBox, { borderColor: scanned ? colors.success : colors.primary }]} />
                <Text style={styles.helperText}>Arahkan barcode ke dalam kotak</Text>
            </View>

            {/* Scanned Result Banner */}
            {scanned && (
                <View style={styles.resultContainer}>
                    <AnimatedView style={[styles.resultCard, { backgroundColor: colors.surface }]}>
                        {foundProduct ? (
                            <View style={styles.productResult}>
                                <View style={[styles.successIconBubble, { backgroundColor: colors.success + '20' }]}>
                                    <CheckCircle size={32} color={colors.success} />
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                                        {foundProduct.name}
                                    </Text>
                                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                                        {formatRupiah(foundProduct.sellPrice)}
                                    </Text>
                                    <Text style={[styles.message, { color: colors.success }]}>{scanMessage}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.productResult}>
                                <Text style={[styles.message, { color: colors.danger }]}>{scanMessage}</Text>
                            </View>
                        )}
                    </AnimatedView>
                </View>
            )}

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
                <TouchableOpacity
                    style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('POS')}
                >
                    <ShoppingCart size={24} color="#FFF" />
                    <Text style={styles.checkoutText}>Ke Kasir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        zIndex: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    overlay: {
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    targetBox: {
        width: width * 0.7,
        height: width * 0.4,
        borderWidth: 3,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    helperText: {
        color: '#FFF',
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    resultContainer: {
        position: 'absolute',
        bottom: 140,
        left: Spacing.lg,
        right: Spacing.lg,
    },
    resultCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        ...Shadow.md,
    },
    productResult: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    successIconBubble: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        marginBottom: 4,
    },
    message: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    checkoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: BorderRadius.full,
        ...Shadow.md,
    },
    checkoutText: {
        color: '#FFF',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    }
});

export default ScannerScreen;

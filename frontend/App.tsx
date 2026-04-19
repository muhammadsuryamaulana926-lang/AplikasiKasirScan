import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    CreditCard,
    Bell,
    User,  
    ChevronLeft,
    Search,
    FileText,
    QrCode,
    AlertTriangle,
    Info,
    CheckCircle,
    AlertCircle,
} from 'lucide-react-native';

// Penyimpanan state global
import { AppProvider, gunakanApp } from './src/penyimpanan/pusat_data_aplikasi';

// Halaman-halaman aplikasi
import DashboardScreen from './src/pages/lainnya/v_dasbor';
import POSScreen from './src/pages/transaksi/v_kasir';
import InventoryScreen from './src/pages/manajemen/v_produk';
import DebtsScreen from './src/pages/keuangan/v_hutang';
import MoreScreen from './src/pages/lainnya/v_lainnya';
import TransactionsScreen from './src/pages/transaksi/v_transaksi';
import ReportsScreen from './src/pages/keuangan/v_laporan';
import LoginScreen from './src/pages/auth/v_login';
import RegisterScreen from './src/pages/auth/v_register';
import ForgotPasswordScreen from './src/pages/auth/v_forgot_password';
import LoadingScreen from './src/pages/lainnya/v_loading';
import TypingText from './src/komponen/umum/c_teks_mengetik';
import ScannerScreen from './src/pages/transaksi/v_scanner';

// Komponen antarmuka
import Button from './src/komponen/antarmuka/c_tombol';
import Modal from './src/komponen/antarmuka/c_modal';
import api from './src/layanan/api';

// Tema - Menggunakan tema baru
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from './src/tema';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Header modern dengan avatar dan notifikasi
const ModernHeader = ({ title, showBack = false, navigation, isDashboard = false, hideProfile = false }: any) => {
    const { warna: colors, jumlahBelumDibaca: unreadNotifications, notifikasi: notifications, pengguna: user, ambilNotifikasi, bacaNotifikasi, hapusNotifikasi } = gunakanApp();
    const insets = useSafeAreaInsets();
    const [showNotifModal, setShowNotifModal] = React.useState(false);

    const bukaNotifikasi = () => {
        ambilNotifikasi();
        setShowNotifModal(true);
    };

    const getNotifColor = (type: string) => {
        switch (type) {
            case 'debt_reminder': return colors.warning;
            case 'info': return colors.info;
            case 'success': return colors.success;
            case 'error': return colors.danger;
            default: return colors.primary;
        }
    };

    // Icon sesuai tipe notifikasi
    const getNotifIcon = (type: string) => {
        const color = getNotifColor(type);
        switch (type) {
            case 'debt_reminder': return <AlertTriangle size={18} color={color} />;
            case 'info': return <Info size={18} color={color} />;
            case 'success': return <CheckCircle size={18} color={color} />;
            case 'error': return <AlertCircle size={18} color={color} />;
            default: return <Bell size={18} color={color} />;
        }
    };

    return (
        <View style={[styles.headerContainer, { backgroundColor: colors.surface, paddingTop: Math.max(insets.top + 10, 40) }]}>
            <View style={styles.headerLeft}>
                {showBack && (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { backgroundColor: colors.surface }]}
                    >
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
                    {isDashboard && !showBack && (
                        <TypingText
                            phrases={[
                                `Selamat datang, ${user?.username || 'Bos'}!`,
                                "Semangat jualan hari ini! 🚀",
                                "Kelola toko jadi lebih mudah!",
                                "Pantau stok, jangan sampai kosong.",
                                "Pelanggan senang, dompet tenang."
                            ]}
                            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
                            typingSpeed={80}
                            pauseTime={3000}
                        />
                    )}
                </View>
            </View>

            <View style={styles.headerRight}>
                {/* Tombol lonceng notifikasi */}
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
                    onPress={bukaNotifikasi}
                >
                    <Bell size={20} color={colors.text} />
                    {unreadNotifications > 0 && (
                        <View style={[styles.notifBadge, { backgroundColor: colors.danger, borderColor: colors.surface }]} />
                    )}
                </TouchableOpacity>

                {!hideProfile && (
                    <TouchableOpacity
                        style={[styles.avatarButton, { borderColor: colors.primary }]}
                        onPress={() => navigation.navigate('More')}
                    >
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                            <View style={{ width: '100%', height: '100%', backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>{user?.name?.substring(0, 2).toUpperCase() || 'WB'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Modal Notifikasi */}
            <Modal visible={showNotifModal} onClose={() => setShowNotifModal(false)} title="Notifikasi" size="lg">
                <View>
                    {/* Tombol aksi baris atas */}
                    {notifications.length > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: Spacing.md }}>
                            {unreadNotifications > 0 && (
                                <TouchableOpacity
                                    onPress={() => bacaNotifikasi('read-all')}
                                    style={{
                                        paddingHorizontal: Spacing.md,
                                        paddingVertical: 6,
                                        borderRadius: BorderRadius.full,
                                        backgroundColor: colors.primary + '15',
                                        borderWidth: 1,
                                        borderColor: colors.primary + '30',
                                    }}
                                >
                                    <Text style={{ fontSize: FontSize.xs, color: colors.primary, fontWeight: FontWeight.bold }}>Tandai Semua Dibaca</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={hapusNotifikasi}
                                style={{
                                    paddingHorizontal: Spacing.md,
                                    paddingVertical: 6,
                                    borderRadius: BorderRadius.full,
                                    backgroundColor: colors.danger + '10',
                                    borderWidth: 1,
                                    borderColor: colors.danger + '30',
                                }}
                            >
                                <Text style={{ fontSize: FontSize.xs, color: colors.danger, fontWeight: FontWeight.bold }}>Hapus Dibaca</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Daftar notifikasi */}
                    {notifications.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: Spacing.xxl * 2 }}>
                            <View style={{
                                width: 72, height: 72, borderRadius: 36,
                                backgroundColor: colors.surfaceVariant,
                                alignItems: 'center', justifyContent: 'center',
                                marginBottom: Spacing.md,
                            }}>
                                <Bell size={32} color={colors.textTertiary} />
                            </View>
                            <Text style={{ color: colors.text, fontWeight: FontWeight.bold, fontSize: FontSize.md }}>Tidak ada notifikasi</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 }}>Semua sudah terbaca</Text>
                        </View>
                    ) : (
                        notifications.map((notif: any, idx: number) => (
                            <TouchableOpacity
                                key={notif.id}
                                onPress={() => !notif.isRead && bacaNotifikasi(notif.id)}
                                activeOpacity={0.7}
                                style={[
                                    {
                                        flexDirection: 'row',
                                        alignItems: 'flex-start',
                                        paddingVertical: Spacing.md,
                                        paddingHorizontal: Spacing.sm,
                                        borderRadius: BorderRadius.lg,
                                        marginBottom: Spacing.sm,
                                        backgroundColor: notif.isRead ? colors.surfaceVariant + '60' : colors.primary + '08',
                                        borderWidth: 1,
                                        borderColor: notif.isRead ? colors.border : colors.primary + '20',
                                    },
                                    !notif.isRead && Shadow.sm,
                                ]}
                            >
                                {/* Icon tipe notifikasi */}
                                <View style={{
                                    width: 40, height: 40, borderRadius: 20,
                                    backgroundColor: getNotifColor(notif.type) + '15',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginRight: Spacing.md, flexShrink: 0,
                                }}>
                                    {getNotifIcon(notif.type)}
                                </View>

                                {/* Konten notifikasi */}
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                        <Text style={{
                                            fontSize: FontSize.sm,
                                            fontWeight: FontWeight.bold,
                                            color: colors.text,
                                            flex: 1,
                                        }} numberOfLines={1}>{notif.title}</Text>
                                        {!notif.isRead && (
                                            <View style={{
                                                width: 8, height: 8, borderRadius: 4,
                                                backgroundColor: colors.primary,
                                                marginLeft: Spacing.sm,
                                            }} />
                                        )}
                                    </View>
                                    <Text style={{
                                        fontSize: FontSize.xs,
                                        color: colors.textSecondary,
                                        lineHeight: 18,
                                        marginBottom: 4,
                                    }} numberOfLines={2}>{notif.message}</Text>
                                    <Text style={{
                                        fontSize: 10,
                                        color: colors.textTertiary,
                                        fontWeight: FontWeight.medium,
                                    }}>
                                        {new Date(notif.createdAt).toLocaleString('id-ID', {
                                            day: 'numeric', month: 'short',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </Modal>
        </View>
    );
};



const MoreStackNavigator = () => {
    const { warna: colors } = gunakanApp();
    return (
        <MoreStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_bottom',
            }}
        >
            <MoreStack.Screen name="MoreHome" component={MoreScreen} />
            <MoreStack.Screen name="Reports" component={ReportsScreen} />
        </MoreStack.Navigator>
    );
};

const AuthStackNavigator = () => {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade_from_bottom', // Animasi halus dari bawah untuk autentikasi
            }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
    );
};

// Tombol tab bar kustom
const TabBarButton = ({ children, onPress, accessibilityState, ...props }: any) => {
    const { warna: colors } = gunakanApp();
    // Gunakan optional chaining (?.) agar tidak error jika accessibilityState kosong
    const isSelected = accessibilityState?.selected;

    if (isSelected) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[
                    styles.tabButton,
                    styles.tabButtonFocused,
                    { backgroundColor: colors.primary + '15' } // Latar bernuansa oranye
                ]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabButton}
        >
            {children}
        </TouchableOpacity>
    );
}

const MainTabsNavigator = () => {
    const { warna: colors } = gunakanApp();
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);

    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                header: ({ route, navigation }) => {
                    const titleMap: Record<string, string> = {
                        Dashboard: 'Beranda',
                        POS: 'Kasir',
                        Inventory: 'Stok Barang',
                        Debts: 'Hutang & Pelanggan',
                        Transactions: 'Transaksi',
                        More: 'Profil',
                    };
                    const title = titleMap[route.name] || route.name;
                    const isDashboard = route.name === 'Dashboard';
                    const hideProfile = ['POS', 'Inventory', 'Debts', 'Transactions'].includes(route.name);
                    return <ModernHeader title={title} navigation={navigation} isDashboard={isDashboard} hideProfile={hideProfile} />;
                },
                animation: 'fade',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: BorderRadius.xl,
                    borderTopRightRadius: BorderRadius.xl,
                    height: TAB_BAR_HEIGHT,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 20,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    borderTopWidth: 0,
                    paddingTop: 0,
                },
                tabBarShowLabel: false,
                tabBarButton: (props) => <TabBarButton {...props} />,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <LayoutDashboard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                            {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="POS"
                component={POSScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCart size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                            {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                            {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />

            {/* FAB Scan Button */}
            <Tab.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{
                    headerShown: false,
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            style={{
                                top: -20,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flex: 1,
                            }}
                            onPress={props.onPress}
                            activeOpacity={0.9}
                        >
                            <View style={{
                                width: 62,
                                height: 62,
                                borderRadius: 31,
                                backgroundColor: colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 4,
                                borderColor: colors.surface, // Membuat efek potongan
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.4,
                                shadowRadius: 6,
                                elevation: 8,
                            }}>
                                <QrCode size={24} color="#FFF" />
                                <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>SCAN</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />

            <Tab.Screen
                name="Debts"
                component={DebtsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
                            {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                            {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="More"
                component={MoreStackNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                            {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const NavigationWrapper = () => {
    const { warna: colors, sudahMasuk: isLoggedIn, prosesAuthMemuat: isLoadingAuth } = gunakanApp();

    if (isLoadingAuth) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {!isLoggedIn ? (
                <AuthStackNavigator />
            ) : (
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
                </RootStack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <AppProvider>
                <View style={{ flex: 1 }}>
                    <NavigationWrapper />
                    <StatusBar style="auto" />
                </View>
            </AppProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    // Gaya header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.lg,
        borderBottomLeftRadius: BorderRadius.xl, // Sudut bawah header melengkung
        borderBottomRightRadius: BorderRadius.xl,
        ...Shadow.sm,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22, // Judul besar gaya modern
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12, // Kotak lebih melengkung
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarButton: {
        width: 40,
        height: 40,
        borderRadius: 14, // Avatar kotak melengkung
        overflow: 'hidden',
        borderWidth: 2,
    },
    notifBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        minWidth: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
    },
    notifBadgeText: {
        display: 'none' // Tampilkan titik saja untuk tampilan minimal
    },

    // Gaya tab bar
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonFocused: {
        // Latar opsional saat aktif
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    // Gaya notifikasi
    notifItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    notifTypeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    notifItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    notifItemMsg: {
        fontSize: 12,
        lineHeight: 18,
    },
    notifItemDate: {
        fontSize: 10,
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    }
});

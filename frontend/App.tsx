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
    QrCode
} from 'lucide-react-native';

// Store
import { AppProvider, useApp } from './src/store/AppContext';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import POSScreen from './src/screens/POSScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import DebtsScreen from './src/screens/DebtsScreen';
import MoreScreen from './src/screens/MoreScreen';
// CustomersScreen is now integrated into DebtsScreen
import TransactionsScreen from './src/screens/TransactionsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import TypingText from './src/components/shared/TypingText';
import ChatbotScreen from './src/screens/ChatbotScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Components UI
import Button from './src/components/ui/Button';
import Modal from './src/components/ui/Modal';
import api from './src/services/api';

// Theme - Memakai tema baru
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from './src/theme';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Header Modern dengan Avatar dan Notifikasi
const ModernHeader = ({ title, showBack = false, navigation, isDashboard = false, hideProfile = false }: any) => {
    const { colors, unreadNotifications, notifications, user, fetchDashboard } = useApp();
    const insets = useSafeAreaInsets(); // Safe area for header top padding
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
                <TouchableOpacity 
                    style={[
                        styles.iconButton,
                        { backgroundColor: colors.surfaceVariant }
                    ]}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Bell size={20} color={colors.text} />
                    {unreadNotifications > 0 && (
                        <View style={[styles.notifBadge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
                            <Text style={styles.notifBadgeText}>{unreadNotifications}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {!hideProfile && (
                    <TouchableOpacity
                        style={[
                            styles.avatarButton,
                            { borderColor: colors.primary }
                        ]}
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
        </View>
    );
};



const MoreStackNavigator = () => {
    const { colors } = useApp();
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
                animation: 'fade_from_bottom', // Animasi halus dari bawah untuk auth
            }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
    );
};

// Custom Tab Bar Button
const TabBarButton = ({ children, onPress, accessibilityState, ...props }: any) => {
    const { colors } = useApp();
    // Gunakan optional chaining (?.) untuk mencegah error jika accessibilityState undefined
    const isSelected = accessibilityState?.selected;

    if (isSelected) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[
                    styles.tabButton,
                    styles.tabButtonFocused,
                    { backgroundColor: colors.primary + '15' } // Orange tint background
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
    const { colors } = useApp();
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
                                borderColor: colors.surface, // Creating a cutout effect
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
    const { colors, isLoggedIn, isLoadingAuth } = useApp();

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
                    <RootStack.Screen name="Assistant" component={ChatbotScreen} />
                    <RootStack.Screen 
                        name="Notifications" 
                        component={NotificationsScreen} 
                        options={{ animation: 'fade_from_bottom' }}
                    />
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
    // Header Styles
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.lg,
        borderBottomLeftRadius: BorderRadius.xl, // Rounded header bottom
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
        fontSize: 22, // Jhotpot style large title
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
        borderRadius: 12, // More rounded square
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarButton: {
        width: 40,
        height: 40,
        borderRadius: 14, // Rounded square avatar
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
        display: 'none' // Just show dot for minimal look
    },

    // Tab Bar Styles
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonFocused: {
        // Optional active state background
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    // Notification Styles
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

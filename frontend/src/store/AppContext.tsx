import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme';
import api from '../services/api';

interface AppContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
    theme: string;
    setTheme: (theme: string) => void;
    colors: any;
    cart: any[];
    addToCart: (product: any, qty?: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQty: (productId: string, qty: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    notifications: any[];
    unreadNotifications: number;
    dashboardData: any;
    fetchDashboard: () => Promise<void>;
    loading: boolean;
    isLoggedIn: boolean;
    isLoadingAuth: boolean;
    setIsLoggedIn: (value: boolean) => void;
    user: any;
    fetchUserProfile: () => Promise<void>;
    updateUser: (data: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState('light');
    const [darkMode, setDarkMode] = useState(false); // Kept for compat, derived ideally but state for now to avoid breaking changes if used elsewhere directly
    const [isLoggedIn, setIsLoggedInState] = useState(false); // Internal state
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [cart, setCart] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Check login status and theme on mount
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // Minimum loading time (2 seconds to show splash properly)
                await new Promise(resolve => setTimeout(resolve, 2000));

                const session = await AsyncStorage.getItem('userSession');
                if (session) {
                    const { timestamp } = JSON.parse(session);
                    const now = Date.now();
                    const THIRTY_MINUTES = 30 * 60 * 1000;

                    if (now - timestamp < THIRTY_MINUTES) {
                        setIsLoggedInState(true);
                        // Refresh session
                        await AsyncStorage.setItem('userSession', JSON.stringify({ timestamp: now }));
                    } else {
                        // Session expired
                        await AsyncStorage.removeItem('userSession');
                        setIsLoggedInState(false);
                    }
                }
            } catch (error) {
                console.error('Failed to check login status', error);
            } finally {
                setIsLoadingAuth(false);
            }
        };

        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('userTheme');
                if (savedTheme) {
                    setThemeState(savedTheme);
                    setDarkMode(savedTheme === 'dark');
                }
            } catch (err) {
                console.log('Failed to load theme');
            }
        };

        checkLoginStatus();
        loadTheme();
    }, []);

    // Update session timestamp on app background or change
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            // Update timestamp whenever app goes to background or becomes active, effectively keeping session alive if used within 30 mins
            if (nextAppState === 'active' || nextAppState.match(/inactive|background/)) {
                AsyncStorage.getItem('userSession').then(session => {
                    if (session) {
                        const { timestamp } = JSON.parse(session);
                        // Only update if session is still valid (less than 30 mins old)
                        // Actually, if we are here, we act as refreshing the session.
                        // But we should check if it WAS expired already? No, because context would handle logout.
                        // Simple update:
                        AsyncStorage.setItem('userSession', JSON.stringify({ timestamp: Date.now() }));
                    }
                });
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const setIsLoggedIn = async (value: boolean) => {
        setIsLoggedInState(value);
        try {
            if (value) {
                await AsyncStorage.setItem('userSession', JSON.stringify({ timestamp: Date.now() }));
            } else {
                await AsyncStorage.removeItem('userSession');
                await AsyncStorage.removeItem('userId');
            }
        } catch (error) {
            console.error('Failed to update session storage', error);
        }
    };

    const setTheme = async (newTheme: string) => {
        setThemeState(newTheme);
        setDarkMode(newTheme === 'dark');
        try {
            await AsyncStorage.setItem('userTheme', newTheme);
        } catch (e) {
            console.log('Failed to save theme');
        }
    };

    // @ts-ignore
    const colors = Colors[theme] || Colors.light;

    const toggleDarkMode = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    // Cart operations
    const addToCart = (product: any, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, qty: item.qty + qty }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.sellPrice,
                qty,
                stock: product.stock,
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateCartQty = (productId: string, qty: number) => {
        if (qty <= 0) return removeFromCart(productId);
        setCart(prev => prev.map(item =>
            item.productId === productId ? { ...item, qty } : item
        ));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Fetch dashboard
    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/reports/dashboard');
            setDashboardData(res.data.data);
            setNotifications(res.data.data.notifications || []);
        } catch (err: any) {
            console.log('Dashboard fetch error:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch User Profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const res = await api.get(`/employees/${userId}`);
                if (res.data.success) {
                    setUser(res.data.data);
                }
            }
        } catch (err: any) {
            console.log('User fetch error:', err.message);
        }
    }, []);

    const updateUser = async (data: any) => {
        setUser((prev: any) => ({ ...prev, ...data }));
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserProfile();
            fetchDashboard();
        }
    }, [isLoggedIn, fetchUserProfile, fetchDashboard]);

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const value: AppContextType = {
        darkMode,
        toggleDarkMode,
        theme,
        setTheme,
        colors,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
        notifications,
        unreadNotifications,
        dashboardData,
        fetchDashboard,
        loading,
        isLoggedIn,
        isLoadingAuth,
        setIsLoggedIn,
        user,
        fetchUserProfile,
        updateUser
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

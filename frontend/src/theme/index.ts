import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Palet warna baru berdasarkan referensi desain (Jhotpot Style)
export const Colors = {
    light: {
        primary: '#FF6B00',         // Jhotpot Orange
        primaryDark: '#E65100',     // Darker Orange
        primaryLight: '#FFF3E0',    // Very Light Orange (Backgrounds)

        secondary: '#2ecc71',       // Green for Success/Money
        accent: '#3498db',          // Blue for Info/Links

        background: '#FAFAFA',      // Almost White Background
        surface: '#FFFFFF',         // Card Background
        surfaceVariant: '#F3F4F6',  // Input fields, secondary bg

        text: '#1F2937',            // Dark Grey (Not pure black)
        textSecondary: '#6B7280',   // Medium Grey
        textTertiary: '#9CA3AF',    // Light Grey

        border: '#E5E7EB',
        borderLight: '#F3F4F6',

        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        info: '#3B82F6',
        infoLight: '#DBEAFE',

        cardShadow: '#FF6B00',      // Orange Tinted Shadow
        overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    },
    dark: {
        primary: '#FF8A3C',         // Lighter Orange for Dark Mode
        primaryDark: '#CC5500',
        primaryLight: '#331400',

        secondary: '#4ADE80',
        accent: '#60A5FA',

        background: '#111827',      // Very Dark Blue/Grey
        surface: '#1F2937',         // Dark Grey Surface
        surfaceVariant: '#374151',

        text: '#F9FAFB',
        textSecondary: '#D1D5DB',
        textTertiary: '#9CA3AF',

        border: '#374151',
        borderLight: '#4B5563',

        danger: '#F87171',
        dangerLight: '#7F1D1D',
        success: '#34D399',
        successLight: '#064E3B',
        warning: '#FBBF24',
        warningLight: '#78350F',
        info: '#60A5FA',
        infoLight: '#1E3A8A',

        cardShadow: '#000000',
        overlay: 'rgba(0, 0, 0, 0.7)', // Darker overlay for dark mode
    },
    // Tema Hutan (Forest) - Hijau Segar
    forest: {
        primary: '#10B981',         // Emerald Green
        primaryDark: '#059669',
        primaryLight: '#ECFDF5',

        secondary: '#F59E0B',       // Amber
        accent: '#3B82F6',

        background: '#F0FDF4',      // Very Light Green Bg
        surface: '#FFFFFF',
        surfaceVariant: '#D1FAE5',  // Light Green Surface

        text: '#064E3B',            // Dark Green Text
        textSecondary: '#047857',
        textTertiary: '#6EE7B7',

        border: '#A7F3D0',
        borderLight: '#D1FAE5',

        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        info: '#3B82F6',
        infoLight: '#DBEAFE',

        cardShadow: '#10B981',
        overlay: 'rgba(6, 78, 59, 0.5)',
    },
    // Tema Laut (Ocean) - Biru Profesional
    ocean: {
        primary: '#2563EB',         // Royal Blue
        primaryDark: '#1E40AF',
        primaryLight: '#EFF6FF',

        secondary: '#10B981',       // Emerald
        accent: '#F59E0B',

        background: '#F0F9FF',      // Sky Blue Bg
        surface: '#FFFFFF',
        surfaceVariant: '#DBEAFE',

        text: '#1E3A8A',            // Dark Blue Text
        textSecondary: '#1D4ED8',
        textTertiary: '#93C5FD',

        border: '#BFDBFE',
        borderLight: '#DBEAFE',

        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#F59E0B',
        warningLight: '#FEF3C7',
        info: '#2563EB',
        infoLight: '#DBEAFE',

        cardShadow: '#2563EB',
        overlay: 'rgba(30, 58, 138, 0.5)',
    },
    // Tema Mewah (Royal) - Ungu Emas
    royal: {
        primary: '#7C3AED',         // Violet
        primaryDark: '#5B21B6',
        primaryLight: '#F5F3FF',

        secondary: '#FBBF24',       // Gold
        accent: '#EC4899',          // Pink

        background: '#FAFAFA',
        surface: '#FFFFFF',
        surfaceVariant: '#F3F4F6',

        text: '#4C1D95',            // Dark Violet Text
        textSecondary: '#6D28D9',
        textTertiary: '#A78BFA',

        border: '#DDD6FE',
        borderLight: '#EDE9FE',

        danger: '#EF4444',
        dangerLight: '#FEE2E2',
        success: '#10B981',
        successLight: '#D1FAE5',
        warning: '#FBBF24',
        warningLight: '#FEF3C7',
        info: '#7C3AED',
        infoLight: '#EDE9FE',

        cardShadow: '#7C3AED',
        overlay: 'rgba(76, 29, 149, 0.5)',
    }
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    iphoneXHeader: 44,
    bottomNavHeight: 70, // Taller nav bar
};

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 26,
    xxxl: 32,
    display: 42,
};

export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
};

// Rounded Corners yang lebih besar sesuai referensi
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 18,        // Standard Card Radius
    xl: 24,        // Large Card / Modal
    full: 9999,
};

// Soft Shadows ala iOS/Modern Design
export const Shadow = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: "#FF6B00", // Orange tinted shadow for primary elements
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    none: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    }
};

export const Layout = {
    width,
    height,
    isSmallDevice: width < 375,
};

// Helper standar rupiah
export const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Helper format tanggal
export const formatDate = (dateString: string | Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// Helper format tanggal & waktu
export const formatDateTime = (dateString: string | Date) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Helper presentase perubahan
export const getPercentChange = (current: number = 0, previous: number = 0) => {
    if (previous === 0) return current === 0 ? '0' : '100';
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
};

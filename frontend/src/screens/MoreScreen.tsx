import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Dimensions, Modal as NativeModal } from 'react-native';
import { useApp } from '../store/AppContext';
import { Camera, Edit2, LogOut, Info, Shield, ChevronRight, Mail, Phone, Calendar, User, Briefcase, CheckCircle, X } from 'lucide-react-native';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import AnimatedView from '../components/shared/AnimatedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';

const { width } = Dimensions.get('window');

const MoreScreen: React.FC = ({ navigation }: any) => {
    const { colors, user, updateUser, setIsLoggedIn, theme, setTheme } = useApp();
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);
    const FLOAT_BOTTOM = TAB_BAR_HEIGHT + 16;
    const [uploading, setUploading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Local state for image feedback
    const [bannerUri, setBannerUri] = useState(user?.banner || null);
    const [avatarUri, setAvatarUri] = useState(user?.avatar || null);

    // Local state for profile form
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setBannerUri(user.banner);
            setAvatarUri(user.avatar);
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const pickImage = async (type: 'avatar' | 'banner') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Perlu izin akses galeri untuk mengganti foto.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            if (type === 'avatar') setAvatarUri(base64Img);
            else setBannerUri(base64Img);
            handleSaveImage(type, base64Img);
        }
    };

    const handleSaveImage = async (type: 'avatar' | 'banner', uri: string) => {
        if (!user?.id) return;
        setUploading(true);
        try {
            const payload = type === 'avatar' ? { avatar: uri } : { banner: uri };
            await api.put(`/employees/${user.id}`, payload);
            await updateUser(payload);
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Update image failed', err);
            Alert.alert('Gagal', 'Gagal menyimpan perubahan foto.');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfileData = async () => {
        if (!user?.id) return;
        if (!editForm.name.trim()) {
            Alert.alert('Error', 'Nama harus diisi.');
            return;
        }

        setUploading(true);
        try {
            await api.put(`/employees/${user.id}`, editForm);
            await updateUser(editForm);
            setShowEditProfileModal(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Update profile data failed', err);
            Alert.alert('Gagal', 'Gagal menyimpan perubahan profil.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        if (setIsLoggedIn) setIsLoggedIn(false);
    };

    if (!user) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* FIXED HEADER AREA: Banner + Profile Info + Title */}
            <View style={styles.fixedHeaderArea}>
                {/* 1. Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={{
                            uri: bannerUri || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80'
                        }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }} />
                </View>

                {/* 2. Fixed Content Sheet (Avatar, Name, Title) */}
                <View style={[styles.fixedContentSheet, { backgroundColor: colors.background }]}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatarWrapper, { borderColor: colors.background }]}>
                                <TouchableOpacity activeOpacity={0.9} onPress={() => setShowFullImage(true)}>
                                    <Image
                                        source={{
                                            uri: avatarUri || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=${colors.primary.replace('#', '')}&color=fff&size=256&bold=true`
                                        }}
                                        style={styles.avatarImage}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.editAvatarBtn, { backgroundColor: colors.text, borderColor: colors.background }]}
                                    onPress={() => pickImage('avatar')}
                                >
                                    <Edit2 size={12} color={colors.background} />
                                </TouchableOpacity>
                            </View>
                        </View>



                        <View style={styles.nameSection}>
                            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                            <Text style={[styles.userRole, { color: colors.textSecondary }]}>@{user.username || 'username'} • {user.role}</Text>

                            <TouchableOpacity
                                onPress={() => setShowEditProfileModal(true)}
                                style={{
                                    marginTop: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 6,
                                    backgroundColor: colors.primary + '15',
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: colors.primary + '30'
                                }}
                            >
                                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: FontSize.xs }}>Edit Profil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Section Title with Grey Line */}
                    <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 10, backgroundColor: colors.background, zIndex: 10 }}>
                        <View style={{ height: 4, width: 40, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 15, borderRadius: 2 }} />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Informasi Pribadi</Text>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => pickImage('banner')}
                    style={[styles.editBannerBtn, { top: Math.max(insets.top + 20, 40) }]}
                >
                    <Camera size={16} color="#FFF" />
                    <Text style={styles.editBannerText}>Ubah</Text>
                </TouchableOpacity>
            </View>

            {/* SCROLLABLE CONTENT AREA */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 380, paddingBottom: FLOAT_BOTTOM + 20, paddingHorizontal: Spacing.md }}
            >
                {/* Personal Info Grid */}
                <AnimatedView delay={200} style={[styles.sectionContainer, { marginTop: 0 }]}>
                    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.infoGrid}>
                            <InfoRow icon={<Calendar />} label="Bergabung Sejak" value={new Date(user.createdAt).toLocaleDateString()} />
                            <InfoRow icon={<Mail />} label="Email" value={user.email} />
                            <InfoRow icon={<Briefcase />} label="Profesi" value="Pemilik Warung" />
                            <InfoRow icon={<Phone />} label="Telepon" value={user.phone} />
                        </View>
                    </View>
                </AnimatedView>

                {/* Theme Selector */}
                <AnimatedView delay={300} style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tampilan Aplikasi</Text>
                    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 16 }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
                            {[
                                { id: 'light', name: 'Terang', color: '#FF6B00', bg: '#FAFAFA' },
                                { id: 'dark', name: 'Gelap', color: '#FF8A3C', bg: '#1F2937' },
                                { id: 'forest', name: 'Hutan', color: '#10B981', bg: '#F0FDF4' },
                                { id: 'ocean', name: 'Laut', color: '#2563EB', bg: '#F0F9FF' },
                                { id: 'royal', name: 'Mewah', color: '#7C3AED', bg: '#FAFAFA' },
                            ].map((t) => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[
                                        styles.themeOption,
                                        {
                                            borderColor: theme === t.id ? colors.primary : colors.border,
                                            backgroundColor: theme === t.id ? colors.primary + '10' : 'transparent',
                                            borderWidth: theme === t.id ? 2 : 1,
                                        }
                                    ]}
                                    onPress={() => setTheme(t.id)}
                                >
                                    <View style={[styles.themePreview, { backgroundColor: t.bg, borderColor: t.color }]}>
                                        <View style={[styles.themeCircle, { backgroundColor: t.color }]} />
                                    </View>
                                    <Text style={[
                                        styles.themeName,
                                        {
                                            color: theme === t.id ? colors.primary : colors.textSecondary,
                                            fontWeight: theme === t.id ? 'bold' : 'normal'
                                        }
                                    ]}>
                                        {t.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </AnimatedView>

                {/* Settings */}
                <AnimatedView delay={400} style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Pengaturan</Text>
                    <View style={styles.settingsList}>
                        <SettingItem icon={<Shield />} label="Privasi & Keamanan" onPress={() => setShowPrivacyModal(true)} />
                        <SettingItem icon={<Info />} label="Tentang Aplikasi" onPress={() => setShowAboutModal(true)} />
                        <SettingItem icon={<LogOut />} label="Keluar" isDestructive onPress={handleLogout} />
                    </View>
                </AnimatedView>

            </ScrollView>

            {/* Logout Modal */}
            <Modal
                visible={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Keluar Akun"
                size="sm"
                type="center"
            >
                <View style={{ gap: 20 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: FontSize.md, textAlign: 'center' }}>
                        Apakah Anda yakin ingin keluar dari aplikasi?
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                { backgroundColor: colors.surfaceVariant, flex: 1 }
                            ]}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Batal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modalButton,
                                { backgroundColor: colors.danger, flex: 1 }
                            ]}
                            onPress={handleConfirmLogout}
                        >
                            <Text style={{ color: '#white', fontWeight: 'bold' }}>Keluar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                visible={showEditProfileModal}
                onClose={() => setShowEditProfileModal(false)}
                title="Edit Profil"
            >
                <View>
                    <InputField
                        label="Nama Lengkap"
                        value={editForm.name}
                        onChangeText={(t: string) => setEditForm({ ...editForm, name: t })}
                        placeholder="Masukkan nama lengkap"
                        backgroundColor={colors.surface}
                    />

                    <InputField
                        label="Email"
                        value={editForm.email}
                        onChangeText={(t: string) => setEditForm({ ...editForm, email: t })}
                        placeholder="contoh@email.com"
                        keyboardType="email-address"
                        backgroundColor={colors.surface}
                    />
                    <InputField
                        label="Nomor Telepon"
                        value={editForm.phone}
                        onChangeText={(t: string) => setEditForm({ ...editForm, phone: t })}
                        placeholder="08..."
                        keyboardType="phone-pad"
                        backgroundColor={colors.surface}
                    />

                    <Button
                        title="Simpan Perubahan"
                        onPress={handleSaveProfileData}
                        loading={uploading}
                        style={{ marginTop: Spacing.md }}
                    />
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                size="sm"
                type="center"
            >
                <View style={{ alignItems: 'center', padding: Spacing.lg }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.success + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
                        <CheckCircle size={32} color={colors.success} />
                    </View>
                    <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.text, marginBottom: 8 }}>Berhasil!</Text>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }}>Perubahan profil Anda telah berhasil disimpan.</Text>

                    <Button
                        title="OK"
                        onPress={() => setShowSuccessModal(false)}
                        style={{ width: '100%' }}
                        rounded
                    />
                </View>
            </Modal>

            {/* Privacy Modal */}
            <Modal
                visible={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                title="Privasi & Keamanan"
                size="md"
            >
                <View style={{ gap: Spacing.md }}>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: FontSize.md }}>Kebijakan Privasi</Text>
                    <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
                        Aplikasi CatatanWarung menghargai privasi Anda. Kami mengumpulkan data minimal yang diperlukan untuk operasional aplikasi, seperti data transaksi dan stok barang.
                    </Text>

                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: FontSize.md, marginTop: Spacing.sm }}>Keamanan Data</Text>
                    <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
                        Semua data sensitif dienkripsi. Kami tidak membagikan data Anda kepada pihak ketiga tanpa persetujuan Anda.
                    </Text>

                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: FontSize.md, marginTop: Spacing.sm }}>Hubungi Kami</Text>
                    <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
                        Jika Anda memiliki pertanyaan tentang privasi, silakan hubungi tim support kami.
                    </Text>
                </View>
            </Modal>

            {/* About Modal */}
            <Modal
                visible={showAboutModal}
                onClose={() => setShowAboutModal(false)}
                title="Tentang Aplikasi"
                size="md"
            >
                <View style={{ alignItems: 'center', marginVertical: Spacing.lg }}>
                    <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
                        {/* App Icon Placeholder */}
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FFF' }}>CW</Text>
                    </View>
                    <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>CatatanWarung</Text>
                    <Text style={{ color: colors.textSecondary, marginBottom: Spacing.lg }}>Versi 1.0.0</Text>

                    <Text style={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                        Aplikasi manajemen warung modern untuk membantu pencatatan transaksi, stok, dan laporan keuangan Anda menjadi lebih mudah dan efisien.
                    </Text>

                    <View style={{ marginTop: Spacing.xl, width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: colors.textTertiary, fontSize: FontSize.sm }}>Dibuat dengan ❤️ oleh Tim Developer</Text>
                        <Text style={{ color: colors.textTertiary, fontSize: FontSize.sm }}>© 2024 CatatanWarung Apps</Text>
                    </View>
                </View>
            </Modal>

            <NativeModal visible={showFullImage} transparent={true} animationType="fade" onRequestClose={() => setShowFullImage(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 50, right: 20, zIndex: 50, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}
                        onPress={() => setShowFullImage(false)}
                    >
                        <X size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Image
                        source={{
                            uri: avatarUri || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=${colors.primary.replace('#', '')}&color=fff&size=256&bold=true`
                        }}
                        style={{ width: width, height: width, resizeMode: 'contain' }}
                    />
                </View>
            </NativeModal>
        </View>
    );
};

const InfoRow = ({ icon, label, value }: any) => {
    const { colors } = useApp();
    return (
        <View style={styles.infoRowGrid}>
            <View style={[styles.infoIcon, { backgroundColor: '#FFF' }]}>
                {React.cloneElement(icon, { size: 18, color: colors.primary })}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value || '-'}</Text>
            </View>
        </View>
    );
};

const SettingItem = ({ icon, label, onPress, isDestructive = false }: any) => {
    const { colors } = useApp();
    return (
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surfaceVariant }]} onPress={onPress}>
            <View style={[styles.settingIcon, { backgroundColor: '#FFF' }]}>
                {React.cloneElement(icon, { size: 20, color: isDestructive ? colors.danger : colors.primary })}
            </View>
            <Text style={[styles.settingLabel, { color: isDestructive ? colors.danger : colors.text }]}>{label}</Text>
            <ChevronRight size={20} color={colors.textTertiary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    fixedHeaderArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 350, // Reduced from 400
        zIndex: 10,
    },
    bannerContainer: {
        width: '100%',
        height: 200, // Reduced from 250
        position: 'absolute',
        top: 0,
        zIndex: 0,
    },
    bannerPlaceholder: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    fixedContentSheet: {
        position: 'absolute',
        top: 170, // Moved up from 220
        left: 0,
        right: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 0, // Padding handled by internal views margin
        paddingBottom: 10,
        zIndex: 5,
        // This needs to be tall enough or let the scroll content perform visually.
        // Actually, this view just holds the fixed items.
    },
    editBannerBtn: {
        position: 'absolute',
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        zIndex: 20,
    },
    editBannerText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    profileSection: {
        marginTop: -60, // Overlap banner
        paddingHorizontal: Spacing.lg,
        paddingBottom: 0,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    avatarWrapper: {
        width: 100, // Reduced from 120
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFF',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    nameSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    userName: {
        fontSize: FontSize.lg, // Reduced from 24
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userRole: {
        fontSize: FontSize.sm,
    },
    sectionContainer: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md, // Reduced from lg
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
    },
    infoCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        ...Shadow.sm,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoRowGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%', // Pastikan muat 2 kolom
        marginBottom: 12,
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.02)', // Sedikit background biar rapi per kotak
        padding: 8,
        borderRadius: 12,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    settingsList: {
        gap: Spacing.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.md,
    },
    settingIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        flex: 1,
        fontSize: FontSize.sm, // Reduced from md
        fontWeight: FontWeight.medium,
    },
    themeOption: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        width: 80,
    },
    themePreview: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        ...Shadow.sm,
    },
    themeCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    themeName: {
        fontSize: 12,
        textAlign: 'center',
        paddingTop: 5,
    },
    modalButton: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default MoreScreen;

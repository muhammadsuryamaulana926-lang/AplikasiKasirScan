
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useApp();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success', onOk: undefined as (() => void) | undefined });

    const handleRequestOtp = async () => {
        if (!email) {
            setAlertModal({ visible: true, title: 'Error', message: 'Mohon masukkan email Anda', type: 'error', onOk: undefined });
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/employees/forgot-password', { email: email.trim() });
            if (res.data.success) {
                setStep('otp');
                setAlertModal({ visible: true, title: 'OTP Dikirim', message: 'Cek email Anda untuk kode OTP reset password.', type: 'success', onOk: undefined });
            }
        } catch (error: any) {
            setAlertModal({ visible: true, title: 'Gagal', message: error.response?.data?.error || 'Gagal mengirim OTP. Pastikan email terdaftar.', type: 'error', onOk: undefined });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (otp.length < 6 || !newPassword) {
            setAlertModal({ visible: true, title: 'Data Belum Lengkap', message: 'Mohon masukkan OTP dan Password baru.', type: 'error', onOk: undefined });
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/employees/reset-password', {
                email: email.trim(),
                code: otp,
                newPassword: newPassword
            });
            if (res.data.success) {
                setAlertModal({
                    visible: true,
                    title: 'Berhasil',
                    message: 'Kata sandi berhasil diperbarui. Silakan login kembali.',
                    type: 'success',
                    onOk: () => navigation.navigate('Login')
                });
            }
        } catch (error: any) {
            setAlertModal({ visible: true, title: 'Gagal', message: error.response?.data?.error || 'Gagal meriset password.', type: 'error', onOk: undefined });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: '#FFF' }]}>
                {/* Wavy Background Header */}
                <View style={[styles.waveContainer, { backgroundColor: colors.primary }]}>
                    <View style={[styles.circleDeco, { top: 50, left: 40, backgroundColor: '#FF8F40' }]} />
                    <View style={[styles.circleDeco, { top: 120, right: 60, width: 15, height: 15, backgroundColor: '#FF8F40' }]} />
                    <View style={[styles.circleDeco, { top: 80, right: 120, width: 10, height: 10, backgroundColor: '#FFE0B2' }]} />
                </View>

                {/* Back Button - Placed outside wave to avoid scaling issues, but absolutely positioned on top */}
                <TouchableOpacity
                    style={[styles.backButton, { top: 50 }]}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={{ height: 120 }} />

                    {/* Floating Card */}
                    <View style={[styles.card, Shadow.lg, { backgroundColor: '#FFF' }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Lupa Kata Sandi</Text>

                        {step === 'email' && (
                            <>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    Masukkan email yang terdaftar. Kami akan mengirimkan kode OTP untuk mereset kata sandi Anda.
                                </Text>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                        <Mail size={20} color={colors.textTertiary} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="nama@email.com"
                                            placeholderTextColor={colors.textTertiary}
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </View>
                                </View>

                                <Button
                                    title="Kirim OTP"
                                    onPress={handleRequestOtp}
                                    loading={loading}
                                    rounded
                                    size="md"
                                    style={{ width: '100%', marginTop: Spacing.md }}
                                />
                            </>
                        )}

                        {step === 'otp' && (
                            <>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    Masukkan 6 digit kode OTP dan buat kata sandi baru Anda.
                                </Text>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Kode OTP</Text>
                                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 5, marginLeft: 0 }]}
                                            placeholder="000000"
                                            placeholderTextColor={colors.textTertiary}
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Kata Sandi Baru</Text>
                                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Minimal 8 karakter"
                                            placeholderTextColor={colors.textTertiary}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                    </View>
                                </View>

                                <Button
                                    title="Reset Kata Sandi"
                                    onPress={handleResetPassword}
                                    loading={loading}
                                    rounded
                                    size="md"
                                    style={{ width: '100%', marginTop: Spacing.md }}
                                />

                                <TouchableOpacity onPress={() => setStep('email')} style={{ marginTop: Spacing.md, alignItems: 'center' }}>
                                    <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>Ganti Email</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* Alert Modal */}
            <Modal
                visible={alertModal.visible}
                onClose={() => {
                    setAlertModal({ ...alertModal, visible: false });
                    if (alertModal.onOk) alertModal.onOk();
                }}
                size="sm"
                type="center"
            >
                <View style={{ alignItems: 'center', padding: Spacing.lg }}>
                    <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.text, marginBottom: 8 }}>
                        {alertModal.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }}>
                        {alertModal.message}
                    </Text>
                    <Button
                        title="OK"
                        onPress={() => {
                            setAlertModal({ ...alertModal, visible: false });
                            if (alertModal.onOk) alertModal.onOk();
                        }}
                        style={{ width: '100%' }}
                        rounded
                    />
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    waveContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.45,
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 0,
        transform: [{ scaleX: 1.2 }],
    },
    backButton: {
        position: 'absolute',
        left: 24, // Safe margin from left
        zIndex: 20,
        padding: 8, // Hit slop
    },
    circleDeco: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        opacity: 0.6,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    card: {
        borderRadius: 30,
        padding: Spacing.xl,
        paddingTop: Spacing.xxl,
        marginTop: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: FontSize.sm,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        height: 50,
        backgroundColor: '#FCFCFC',
    },
    input: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: FontSize.md,
        height: '100%',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.sm,
    },
    successText: {
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default ForgotPasswordScreen;

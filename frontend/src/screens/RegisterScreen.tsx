import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, AlertCircle } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const RegisterScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useApp();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertModal, setAlertModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error' as 'error' | 'success',
        onOk: undefined as (() => void) | undefined
    });
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [otp, setOtp] = useState('');

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setAlertModal({
                visible: true,
                title: 'Data Belum Lengkap',
                message: 'Mohon lengkapi Nama, Email, dan Kata Sandi.',
                type: 'error',
                onOk: undefined
            });
            return;
        }

        setLoading(true);
        try {
            // Step 1: Request OTP
            const res = await api.post('/employees/request-otp', { email: email.trim(), type: 'register' });
            if (res.data.success) {
                setStep('otp');
                setAlertModal({
                    visible: true,
                    title: 'OTP Dikirim',
                    message: 'Silakan cek email Anda untuk kode OTP.',
                    type: 'success',
                    onOk: undefined
                });
            }
        } catch (error: any) {
            console.error('OTP Request Failed', error);
            setAlertModal({
                visible: true,
                title: 'Gagal',
                message: error.response?.data?.error || 'Gagal mengirim OTP. Pastikan email valid.',
                type: 'error',
                onOk: undefined
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return;

        setLoading(true);
        try {
            // Step 2: Verify OTP
            const verifyRes = await api.post('/employees/verify-otp', { email: email.trim(), code: otp, type: 'register' });
            
            if (verifyRes.data.success) {
                // Step 3: Complete Register
                const payload = {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    password: password,
                    role: 'admin',
                    username: email.split('@')[0],
                    isActive: 1
                };

                const response = await api.post('/employees', payload);

                if (response.data.success) {
                    setAlertModal({
                        visible: true,
                        title: 'Pendaftaran Berhasil',
                        message: 'Akun Anda berhasil dibuat. Silakan masuk.',
                        type: 'success',
                        onOk: () => navigation.navigate('Login')
                    });
                }
            }
        } catch (error: any) {
            setAlertModal({
                visible: true,
                title: 'Verifikasi Gagal',
                message: error.response?.data?.error || 'Kode OTP salah.',
                type: 'error',
                onOk: undefined
            });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (alertModal.onOk) {
            alertModal.onOk();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: '#FFF' }]}>
                {/* Wavy Background Header - Same style as Login */}
                <View style={[styles.waveContainer, { backgroundColor: colors.primary }]}>
                    <View style={[styles.circleDeco, { top: 50, left: 40, backgroundColor: '#FF8F40' }]} />
                    <View style={[styles.circleDeco, { top: 120, right: 60, width: 15, height: 15, backgroundColor: '#FF8F40' }]} />
                    <View style={[styles.circleDeco, { top: 80, right: 120, width: 10, height: 10, backgroundColor: '#FFE0B2' }]} />

                </View>

                {/* Back Button - Moved outside wave container */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={{ height: 100 }} />

                    {/* Floating Card */}
                    <View style={[styles.card, Shadow.lg, { backgroundColor: '#FFF' }]}>
                        <Text style={[styles.title, { color: colors.text }]}>{step === 'form' ? 'Buat Akun' : 'Verifikasi Email'}</Text>

                        {step === 'form' ? (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Lengkap</Text>
                                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                        <User size={20} color={colors.textTertiary} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Nama Toko / Pemilik"
                                            placeholderTextColor={colors.textTertiary}
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>
                                </View>

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

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Nomor Telepon</Text>
                                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                        <Phone size={20} color={colors.textTertiary} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="08xxxxxxxxxx"
                                            placeholderTextColor={colors.textTertiary}
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Kata Sandi</Text>
                                    <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                        <Lock size={20} color={colors.textTertiary} />
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Minimal 8 karakter"
                                            placeholderTextColor={colors.textTertiary}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ?
                                                <EyeOff size={20} color={colors.textTertiary} /> :
                                                <Eye size={20} color={colors.textTertiary} />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={{ height: Spacing.md }} />

                                <Button
                                    title="Daftar Sekarang"
                                    onPress={handleRegister}
                                    loading={loading}
                                    rounded
                                    size="md"
                                    style={{ width: '100%', marginTop: Spacing.md }}
                                />

                                {/* Social Login Mockup */}
                                <View style={styles.dividerContainer}>
                                    <View style={styles.line} />
                                    <Text style={styles.orText}>atau daftar dengan</Text>
                                    <View style={styles.line} />
                                </View>

                                    <TouchableOpacity style={[styles.socialBtn, Shadow.sm]}>
                                        <Text style={{ fontWeight: 'bold', color: '#EA4335', fontSize: 18 }}>G</Text>
                                        <Text style={styles.socialText}>Daftar dengan Google</Text>
                                    </TouchableOpacity>

                                <Text style={styles.termsText}>
                                    Dengan mendaftar, Anda menyetujui <Text style={{ color: colors.primary }}>Syarat & Ketentuan</Text> kami.
                                </Text>
                            </>
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }}>
                                    Masukkan 6 digit kode OTP yang kami kirimkan ke email {email}
                                </Text>
                                
                                <View style={[styles.inputContainer, { borderColor: colors.border, width: '100%', justifyContent: 'center' }]}>
                                    <TextInput
                                        style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 10, marginLeft: 0 }]}
                                        placeholder="000000"
                                        maxLength={6}
                                        keyboardType="number-pad"
                                        value={otp}
                                        onChangeText={setOtp}
                                    />
                                </View>

                                <Button
                                    title="Verifikasi OTP"
                                    onPress={handleVerifyOtp}
                                    loading={loading}
                                    rounded
                                    size="md"
                                    style={{ width: '100%', marginTop: Spacing.xl }}
                                />

                                <TouchableOpacity 
                                    onPress={() => setStep('form')}
                                    style={{ marginTop: Spacing.md }}
                                >
                                    <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>Ganti Email</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Bottom Link */}
                    <View style={styles.bottomLink}>
                        <Text style={{ color: colors.textSecondary }}>Sudah punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>Masuk</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Alert Modal */}
            <Modal
                visible={alertModal.visible}
                onClose={handleModalClose}
                size="sm"
                type="center"
            >
                <View style={{ alignItems: 'center', padding: Spacing.lg }}>
                    <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: (alertModal.type === 'success' ? colors.success : colors.danger) + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: Spacing.md
                    }}>
                        <AlertCircle size={32} color={alertModal.type === 'success' ? colors.success : colors.danger} />
                    </View>
                    <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: colors.text, marginBottom: 8, textAlign: 'center' }}>
                        {alertModal.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg }}>
                        {alertModal.message}
                    </Text>

                    <Button
                        title="OK"
                        onPress={handleModalClose}
                        style={{ width: '100%' }}
                        rounded
                        variant={alertModal.type === 'success' ? 'secondary' : 'primary'}
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
        top: 50,
        left: 20, // Adjusted padding
        zIndex: 20,
        elevation: 5,
        padding: 8, // Hit area
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
        fontSize: 28,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    formGroup: {
        marginBottom: Spacing.sm,
    },
    label: {
        fontSize: FontSize.sm,
        marginBottom: 6,
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#EEE',
    },
    orText: {
        marginHorizontal: Spacing.md,
        color: '#AAA',
        fontSize: FontSize.xs,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        height: 48,
        borderRadius: BorderRadius.full,
        gap: 8,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    socialText: {
        fontWeight: FontWeight.medium,
        color: '#555',
    },
    termsText: {
        textAlign: 'center',
        marginTop: Spacing.lg,
        fontSize: 10,
        color: '#AAA',
    },
    bottomLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
});

export default RegisterScreen;

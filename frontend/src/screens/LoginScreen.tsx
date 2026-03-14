import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import api from '../services/api';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = ({ navigation }: any) => {
    const { colors, setIsLoggedIn, updateUser } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' });

    /* 
    // Google Auth Config - Temporarily Disabled
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: '172548881799-7rhpaf6urtgb2ueu73os84tdf7f6dk4o.apps.googleusercontent.com',
        androidClientId: '172548881799-7rhpaf6urtgb2ueu73os84tdf7f6dk4o.apps.googleusercontent.com',
        iosClientId: '172548881799-7rhpaf6urtgb2ueu73os84tdf7f6dk4o.apps.googleusercontent.com',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        }
    }, [response]);

    const handleGoogleLogin = async (idToken: string) => {
        setLoading(true);
        try {
            const res = await api.post('/employees/google-login', { idToken });
            if (res.data.success) {
                const userData = res.data.data;
                await AsyncStorage.setItem('userId', userData.id);
                if (updateUser) await updateUser(userData);
                if (setIsLoggedIn) setIsLoggedIn(true);
            }
        } catch (error: any) {
            console.error('Google Login Error:', error);
            setAlertModal({
                visible: true,
                title: 'Gagal Login Google',
                message: error.response?.data?.error || 'Terjadi kesalahan saat login dengan Google',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    */

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setAlertModal({
                visible: true,
                title: 'Data Belum Lengkap',
                message: 'Silakan masukkan email dan kata sandi Anda.',
                type: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/employees/login', {
                email: email.trim(),
                password: password
            });

            if (response.data.success) {
                const userData = response.data.data;

                // Save session info
                await AsyncStorage.setItem('userId', userData.id);

                // Update Context
                if (updateUser) await updateUser(userData);

                if (setIsLoggedIn) setIsLoggedIn(true);
                else navigation.replace('MainApp');
            }
        } catch (error: any) {
            console.log('Login Error:', error);
            const errorMessage = error.response?.data?.error || 'Gagal terhubung ke server. Cek koneksi Anda.';
            setAlertModal({
                visible: true,
                title: 'Gagal Masuk',
                message: errorMessage,
                type: 'error'
            });
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
                    {/* Hiasan lingkaran kecil untuk kesan estetik sesuai referensi */}
                    <View style={[styles.circleDeco, { top: 50, left: 40, backgroundColor: '#FF8F40' }]} />
                    <View style={[styles.circleDeco, { top: 120, right: 60, width: 15, height: 15, backgroundColor: '#FF8F40' }]} />
                    <View style={[styles.circleDeco, { top: 80, right: 120, width: 10, height: 10, backgroundColor: '#FFE0B2' }]} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Spacer for Wave */}
                    <View style={{ height: 140 }} />

                    {/* Floating Card */}
                    <View style={[styles.card, Shadow.lg, { backgroundColor: '#FFF' }]}>
                        <View style={{ alignItems: 'center', marginBottom: 0 }}>
                            <Image
                                source={require('../../assets/logo_apk.png')}
                                style={{ width: 220, height: 140, resizeMode: 'contain' }}
                            />
                        </View>
                        <Text style={[styles.title, { color: colors.text, marginTop: -15 }]}>Masuk</Text>

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
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Kata Sandi</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                                <Lock size={20} color={colors.textTertiary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="********"
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

                        <TouchableOpacity
                            style={styles.forgotPass}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={{ color: colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.sm }}>
                                Lupa kata sandi?
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title="Masuk Sekarang"
                            onPress={handleLogin}
                            loading={loading}
                            rounded
                            size="md"
                            style={{ width: '100%', marginTop: Spacing.md }}
                        />

                        {/* Social Login Mockup */}
                        {/* 
                        <View style={styles.dividerContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>atau</Text>
                            <View style={styles.line} />
                        </View>

                        <TouchableOpacity 
                            style={[styles.socialBtn, Shadow.sm]}
                            onPress={() => promptAsync()}
                            disabled={!request}
                        >
                            <Text style={{ fontWeight: 'bold', color: '#EA4335', fontSize: 18 }}>G</Text>
                            <Text style={styles.socialText}>Masuk dengan Google</Text>
                        </TouchableOpacity>
                        */}
                    </View>

                    {/* Bottom Link */}
                    <View style={styles.bottomLink}>
                        <Text style={{ color: colors.textSecondary }}>Belum punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>Daftar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Alert Modal */}
            <Modal
                visible={alertModal.visible}
                onClose={() => setAlertModal({ ...alertModal, visible: false })}
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
                        onPress={() => setAlertModal({ ...alertModal, visible: false })}
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
        borderBottomLeftRadius: 100, // Membuat lengkungan ekstrem
        borderBottomRightRadius: 0,  // Asymmetric curve
        transform: [{ scaleX: 1.2 }], // Scale untuk melebarkan lengkungan
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
        paddingTop: Spacing.md, // Reduced from xxl
        marginTop: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    formGroup: {
        marginBottom: Spacing.md,
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
        borderRadius: BorderRadius.full, // Pill shape inputs
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
    forgotPass: {
        alignItems: 'flex-end',
        marginBottom: Spacing.lg,
        marginTop: 4,
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
    bottomLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
});

export default LoginScreen;

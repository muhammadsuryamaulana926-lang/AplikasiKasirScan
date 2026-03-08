
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import Button from '../components/ui/Button';
import { Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useApp();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleReset = () => {
        if (!email) {
            Alert.alert("Error", "Mohon masukkan email Anda");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
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

                        {!submitted ? (
                            <>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    Masukkan email yang terdaftar. Kami akan mengirimkan instruksi untuk mereset kata sandi Anda.
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
                                    title="Kirim Instruksi"
                                    onPress={handleReset}
                                    loading={loading}
                                    rounded
                                    size="md"
                                    style={{ width: '100%', marginTop: Spacing.md }}
                                />
                            </>
                        ) : (
                            <View style={styles.successContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
                                    <Mail size={40} color={colors.success} />
                                </View>
                                <Text style={[styles.successTitle, { color: colors.text }]}>Cek Email Anda</Text>
                                <Text style={[styles.successText, { color: colors.textSecondary }]}>
                                    Kami telah mengirimkan instruksi reset kata sandi ke {email}
                                </Text>
                                <Button
                                    title="Kembali ke Login"
                                    onPress={() => navigation.navigate('Login')}
                                    rounded
                                    size="md"
                                    style={{ width: '100%', marginTop: Spacing.xl }}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
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

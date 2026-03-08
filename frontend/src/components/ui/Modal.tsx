import React, { useState, useEffect, useRef } from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
    Keyboard,
    KeyboardAvoidingView,
    Animated,
    Easing,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: WINDOW_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'full';
    type?: 'bottom' | 'center'; // New prop for modal type
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children, size = 'md', type = 'bottom' }) => {
    const { colors } = useApp();
    const insets = useSafeAreaInsets();

    // Internal state for animation handling
    const [isVisible, setIsVisible] = useState(visible);
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            Animated.timing(animValue, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(animValue, {
                toValue: 0,
                duration: 350,
                easing: Easing.in(Easing.exp),
                useNativeDriver: true,
            }).start(() => setIsVisible(false));
        }
    }, [visible]);

    const getMaxHeight = () => {
        const h = Platform.OS === 'ios' ? WINDOW_HEIGHT : SCREEN_HEIGHT;
        switch (size) {
            case 'sm': return h * 0.45;
            case 'lg': return h * 0.85;
            case 'full': return h * 0.95;
            default: return h * 0.65;
        }
    };

    const isCenter = type === 'center';

    // Animation Interpolations
    const backdropOpacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const slideY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_HEIGHT, 0],
    });

    const scale = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
    });

    const animatedContentStyle = isCenter ? {
        opacity: animValue,
        transform: [{ scale }]
    } : {
        transform: [{ translateY: slideY }]
    };

    const renderModalContent = () => (
        <Animated.View style={[
            styles.content,
            {
                backgroundColor: colors.surface,
                maxHeight: getMaxHeight(),
                width: isCenter ? '100%' : '100%',
                maxWidth: isCenter ? 400 : '100%',
                borderRadius: isCenter ? BorderRadius.xl : 0,
                borderTopLeftRadius: BorderRadius.xl,
                borderTopRightRadius: BorderRadius.xl,
                borderBottomLeftRadius: isCenter ? BorderRadius.xl : 0,
                borderBottomRightRadius: isCenter ? BorderRadius.xl : 0,
                // Dead Lock: Kunci padding bawah di Android agar tidak goyang
                paddingBottom: isCenter ? Spacing.lg : (Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 30),
            },
            animatedContentStyle
        ]}>
            {!isCenter && (
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                </View>
            )}

            {title ? (
                <View style={[styles.header, { borderBottomColor: colors.border + '30' }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.closeButton, { backgroundColor: colors.surfaceVariant }]}
                        activeOpacity={0.7}
                    >
                        <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            ) : null}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: isCenter ? Spacing.lg : 150 }]}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                bounces={true}
                overScrollMode="always"
            >
                {children}
            </ScrollView>
        </Animated.View>
    );

    if (!isVisible) return null;

    return (
        <RNModal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Background Dimmer */}
                <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
                    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay, opacity: backdropOpacity }]} />
                </TouchableWithoutFeedback>

                {Platform.OS === 'ios' ? (
                    <KeyboardAvoidingView
                        behavior="padding"
                        style={{
                            flex: 1,
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: isCenter ? 'center' : 'flex-end',
                            padding: isCenter ? Spacing.lg : 0,
                        }}
                        pointerEvents="box-none"
                    >
                        {renderModalContent()}
                    </KeyboardAvoidingView>
                ) : (
                    /* STRATEGI DEAD LOCK ANDROID: Menggunakan Screen Height Statis */
                    <View
                        style={{
                            height: SCREEN_HEIGHT, // Kunci tinggi fisik layar
                            width: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            alignItems: 'center',
                            justifyContent: isCenter ? 'center' : 'flex-end',
                            padding: isCenter ? Spacing.lg : 0,
                        }}
                        pointerEvents="box-none"
                    >
                        {renderModalContent()}
                    </View>
                )}
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        width: '100%',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        overflow: 'hidden',
        // Hapus shadow oren / elevasi yang mungkin muncul
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    handleContainer: {
        width: '100%',
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        // Bioarkan fleksibel
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        flexGrow: 1,
    },
});

export default Modal;

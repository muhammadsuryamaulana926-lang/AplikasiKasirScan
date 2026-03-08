import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useApp } from '../store/AppContext';
import { Spacing, BorderRadius, Shadow } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LocalColors = {
    primary: '#007AFF',
    primaryLight: '#5AC8FA',
    secondary: '#5856D6',
    background: '#FFFFFF',
    cardBackground: '#F2F2F7',
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    incomingMessage: '#E8E8ED',
    outgoingMessage: '#007AFF',
    border: '#C6C6C8',
    lightGray: '#F8F8F8',
};

type Message = {
    id: string;
    from: 'user' | 'bot';
    text: string;
};

// TODO: sesuaikan IP / domain backend chatbot-mu di sini
const CHATBOT_BASE_URL = 'http://192.168.100.103:3000';

const ChatbotScreen: React.FC = () => {
    const { colors } = useApp();
    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 70 + (insets.bottom > 0 ? insets.bottom : 10);
    const FLOAT_BOTTOM = TAB_BAR_HEIGHT + 16;
    const [isIntroLoading, setIsIntroLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsIntroLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            from: 'user',
            text: trimmed,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${CHATBOT_BASE_URL}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: trimmed }),
            });

            const data = await res.json();

            const replyText: string =
                (data?.success && data?.result?.message) ||
                data?.error ||
                'Maaf, aku tidak bisa menjawab sekarang.';

            const botMessage: Message = {
                id: `${Date.now().toString()}-bot`,
                from: 'bot',
                text: replyText,
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const botMessage: Message = {
                id: `${Date.now().toString()}-error`,
                from: 'bot',
                text: 'Gagal menghubungi server chatbot. Pastikan backend chatbot sedang berjalan.',
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.from === 'user';
        return (
            <View
                style={[
                    styles.bubble,
                    {
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        backgroundColor: isUser ? LocalColors.outgoingMessage : LocalColors.incomingMessage,
                        borderTopLeftRadius: isUser ? BorderRadius.lg : BorderRadius.sm,
                        borderTopRightRadius: isUser ? BorderRadius.sm : BorderRadius.lg,
                    },
                    Shadow.sm,
                ]}
            >
                <Text style={[styles.bubbleText, { color: isUser ? '#FFFFFF' : LocalColors.textPrimary }]}>{item.text}</Text>
            </View>
        );
    };

    if (isIntroLoading) {
        return (
            <View style={[styles.introContainer, { backgroundColor: LocalColors.background }]}>
                <View style={styles.introCard}>
                    <Text style={[styles.introTitle, { color: LocalColors.textPrimary }]}>Asisten Kasir AI</Text>
                    <Text style={[styles.introSubtitle, { color: LocalColors.textSecondary }]}>
                        Membantu menjawab pertanyaan seputar penjualan dan stok warung kamu.
                    </Text>
                    <ActivityIndicator size="large" color={LocalColors.primary} style={{ marginTop: Spacing.lg }} />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: LocalColors.cardBackground }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <View style={[styles.headerCard, { paddingTop: Math.max(insets.top + 10, 40) }]}>
                <Text style={styles.headerTitle}>Chatbot Kasir</Text>
                <Text style={styles.headerSubtitle}>
                    Tanyakan apa saja tentang laporan, stok, atau cara pakai aplikasi.
                </Text>
            </View>

            {messages.length === 0 && (
                <View style={styles.welcomeBox}>
                    <Text style={styles.welcomeTitle}>Selamat datang di Asisten Kasir</Text>
                    <Text style={styles.welcomeText}>
                        Contoh yang bisa kamu tanyakan:
                    </Text>
                    <View style={styles.chipsRow}>
                        <TouchableOpacity
                            style={styles.chip}
                            onPress={() => {
                                setInput('Berapa total penjualan hari ini?');
                            }}
                        >
                            <Text style={styles.chipText}>Penjualan hari ini</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.chip}
                            onPress={() => {
                                setInput('Tunjukkan daftar stok yang hampir habis.');
                            }}
                        >
                            <Text style={styles.chipText}>Stok hampir habis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.chip}
                            onPress={() => {
                                setInput('Bagaimana cara menambah produk baru?');
                            }}
                        >
                            <Text style={styles.chipText}>Cara tambah produk</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={[styles.listContent, { paddingBottom: FLOAT_BOTTOM }]}
                showsVerticalScrollIndicator={false}
            />

            <View style={[styles.inputContainer, { backgroundColor: LocalColors.background, paddingBottom: FLOAT_BOTTOM }]}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: LocalColors.border,
                            color: LocalColors.textPrimary,
                        },
                    ]}
                    placeholder="Tanya apa saja ke asisten kasir..."
                    placeholderTextColor={LocalColors.textSecondary}
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: loading || !input.trim() ? LocalColors.incomingMessage : LocalColors.primary,
                        },
                    ]}
                    onPress={sendMessage}
                    disabled={loading || !input.trim()}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.sendText}>Kirim</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerCard: {
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: LocalColors.background,
        ...Shadow.sm,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
        color: LocalColors.textPrimary,
    },
    headerSubtitle: {
        fontSize: 13,
        color: LocalColors.textSecondary,
    },
    welcomeBox: {
        marginHorizontal: Spacing.md,
        marginTop: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: LocalColors.background,
        ...Shadow.sm,
    },
    welcomeTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
        color: LocalColors.textPrimary,
    },
    welcomeText: {
        fontSize: 13,
        color: LocalColors.textSecondary,
        marginBottom: Spacing.sm,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 999,
        backgroundColor: LocalColors.cardBackground,
    },
    chipText: {
        fontSize: 12,
        color: LocalColors.textPrimary,
    },
    introContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    introCard: {
        width: '85%',
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        ...Shadow.lg,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    introSubtitle: {
        fontSize: 13,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
        gap: Spacing.xs,
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xs,
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderColor: LocalColors.border,
    },
    input: {
        flex: 1,
        maxHeight: 120,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
        marginRight: Spacing.sm,
        fontSize: 14,
    },
    sendButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    sendText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ChatbotScreen;


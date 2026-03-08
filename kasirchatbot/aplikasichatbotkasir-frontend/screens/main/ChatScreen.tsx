import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Clipboard,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_CONFIG } from "../../config/api-config";
import { RootStackParamList } from "../../types/navigation";
import {
  formatDateSeparator,
  formatRelativeTime,
  isSameDay,
} from "../../utils/timeUtils";
import AccountSettingsScreen from "./AccountSettingsScreen";
import { useTheme } from "../../contexts/ThemeContext";
import { MessageTextWithLinks } from "../../components/MessageTextWithLinks";

const { width, height } = Dimensions.get("window");
const Colors = {
  primary: "#007AFF",
  primaryLight: "#5AC8FA",
  secondary: "#5856D6",
  background: "#FFFFFF",
  cardBackground: "#F2F2F7",
  textPrimary: "#000000",
  textSecondary: "#8E8E93",
  incomingMessage: "#E8E8ED",
  outgoingMessage: "#007AFF",
  border: "#C6C6C8",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  darkGray: "#1C1C1E",
  lightGray: "#F8F8F8",
};

type MessageType = {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
  isConfirmation?: boolean;
  originalQuestion?: string;
  options?: Array<{text: string, action: string}>;
};

type ChatHistoryType = {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  unread?: boolean;
  messages: MessageType[];
};

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  route: RouteProp<RootStackParamList, "Chat">;
};

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const actionTitle = route.params?.actionTitle;
  const [messages, setMessages] = useState<MessageType[]>(
    actionTitle
      ? [
          {
            id: "1",
            text: actionTitle,
            sender: "bot",
            timestamp: new Date(),
          },
        ]
      : [],
  );
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [showMenu, setShowMenu] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [renderAccountSettings, setRenderAccountSettings] = useState(false);
  const [preloadedUserEmail, setPreloadedUserEmail] = useState<string>("");
  const [preloadedUserName, setPreloadedUserName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryType[]>([]);
  const historyScrollRef = useRef<ScrollView>(null);
  const scrollPositionRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollRestoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollButtonOpacity = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [isRecording, setIsRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loadingDots, setLoadingDots] = useState(0);
  const [dateRefreshKey, setDateRefreshKey] = useState(0);

  const rotatingTexts = [
    "Bagaimana saya bisa membantu Anda?",
    "Ada yang bisa saya bantu?",
    "Silakan tanyakan apapun!",
    "Saya siap membantu Anda!",
  ];

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
      
      if (messages.length === 0 && Platform.OS === 'ios') {
        Animated.timing(welcomeKeyboardAnim, {
          toValue: -e.endCoordinates.height / 2,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
      
      if (messages.length === 0 && Platform.OS === 'ios') {
        Animated.timing(welcomeKeyboardAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [messages.length]);

  const editingTextRef = useRef("");
  const originalTitleRef = useRef("");
  const flatListRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const editInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const welcomeOpacityAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(30)).current;
  const welcomeKeyboardAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const accountSlideAnim = useRef(new Animated.Value(width)).current;
  const accountFadeAnim = useRef(new Animated.Value(0)).current;
  const deleteModalAnim = useRef(new Animated.Value(0)).current;
  const logoutModalAnim = useRef(new Animated.Value(0)).current;
  const inputBottomAnim = useRef(new Animated.Value(0)).current;


  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "good morning!!";
    if (hour < 18) return "good afternoon!!";
    return "good evening!!";
  }

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const sections: Array<{ title: string; data: MessageType[] }> = [];
    let currentSection: { title: string; data: MessageType[] } | null = null;

    messages.forEach((msg, index) => {
      const showDateSeparator =
        index === 0 || !isSameDay(msg.timestamp, messages[index - 1].timestamp);

      if (showDateSeparator) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: formatDateSeparator(msg.timestamp),
          data: [msg],
        };
      } else {
        if (currentSection) currentSection.data.push(msg);
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  }, [messages, dateRefreshKey]);

  useEffect(() => {
    checkLoginStatus();
    checkConnection();
    loadChatHistory();

    // Load profile image
    AsyncStorage.getItem("profileImage").then((image) => {
      if (image) setProfileImage(image);
    });

    // Update date labels setiap menit
    const dateInterval = setInterval(() => {
      setDateRefreshKey(prev => prev + 1);
    }, 60000); // 60 detik

    // Animasi welcome message dengan efek smooth
    if (messages.length === 0) {
      Animated.parallel([
        Animated.timing(welcomeOpacityAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      clearInterval(dateInterval);
    };
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (messages.length > 0) return;

    let charIndex = 0;
    const currentText = rotatingTexts[currentTextIndex];

    const typingInterval = setInterval(() => {
      if (charIndex <= currentText.length) {
        setTypedText(currentText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
        }, 5000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentTextIndex, messages.length]);

  useEffect(() => {
    if (showMenu) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showMenu]);

  useEffect(() => {
    if (showDeleteModal) {
      Animated.spring(deleteModalAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(deleteModalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showDeleteModal]);

  useEffect(() => {
    if (showLogoutModal) {
      Animated.spring(logoutModalAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(logoutModalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showLogoutModal]);

  useEffect(() => {
    if (showAccountSettings) {
      setRenderAccountSettings(true);
      Animated.parallel([
        Animated.timing(accountSlideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(accountFadeAnim, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(accountSlideAnim, {
          toValue: width,
          duration: 350,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(accountFadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderAccountSettings(false);
      });
    }
  }, [showAccountSettings]);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const checkConnection = async () => {
    try {
      setConnectionStatus("checking");
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/health`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      setConnectionStatus(response.ok ? "online" : "offline");
    } catch {
      setConnectionStatus("offline");
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    const currentInput = inputText;
    // Set judul chat dari prompt pertama user HANYA jika belum ada chat ID (chat baru)
    if (!currentChatId && messages.length === 0) {
      setCurrentChatTitle(currentInput);
    }
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const timeoutId = setTimeout(() => abortController.abort(), 60000); // 60 detik timeout
    
    try {
      console.log("🔍 Mengirim ke backend...");
      
      // Ambil userEmail dan userId dari AsyncStorage
      const userEmail = await AsyncStorage.getItem("userEmail");
      const userId = await AsyncStorage.getItem("userId") || "default";
      
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ 
          question: currentInput,
          userId: userId,
          userEmail: userEmail 
        }),
        signal: abortController.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error backend: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        // Cek jika akun dinonaktifkan
        if (data.error && data.error.includes("dinonaktifkan")) {
          Alert.alert(
            "Akun Dinonaktifkan",
            "Akun Anda telah dinonaktifkan oleh administrator. Anda akan diarahkan ke halaman login.",
            [
              {
                text: "OK",
                onPress: async () => {
                  await AsyncStorage.multiRemove([
                    "userToken",
                    "userEmail",
                    "userName",
                  ]);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                },
              },
            ],
          );
          return;
        }
        throw new Error(data.error || "Terjadi kesalahan");
      }
      
      // Handle confirmation response
      if (data.result && typeof data.result === 'object' && data.result.type === 'confirmation') {
        const confirmationMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          text: data.result.message,
          sender: "bot",
          timestamp: new Date(),
          isConfirmation: true,
          originalQuestion: data.result.originalQuestion,
          options: data.result.options
        };
      const updatedMessages = [...messages, userMessage, confirmationMessage];
      setMessages(updatedMessages);
      await autoSaveToHistory(updatedMessages, currentInput);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        return;
      }
      
      // Handle normal response (answer or error)
      const botResponseText = typeof data.result === 'object' ? data.result.message : data.result;
      const source = data.source || "unknown";
      console.log(
        `📦 Response dari ${source}:`,
        typeof botResponseText === 'string' ? botResponseText.substring(0, 100) : String(botResponseText),
      );
      const sourceIndicator = source === "database" ? "📊 " : "🤖 ";
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: `${sourceIndicator}${botResponseText || 'Tidak ada respons'}`,
        sender: "bot",
        timestamp: new Date(),
      };
      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);
      await autoSaveToHistory(updatedMessages, currentInput);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("❌ Error di handleSend:", error);
      
      let errorText = "❌ Maaf, terjadi kesalahan. Mohon periksa:\n1. Koneksi internet\n2. Backend berjalan\n3. Database aktif";
      
      if (error.name === 'AbortError') {
        return;
      }
      
      const errorMessage: MessageType = {
        id: (Date.now() + 2).toString(),
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleConfirmation = async (originalQuestion: string, action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ originalQuestion, action }),
      });
      
      if (!response.ok) {
        throw new Error(`Error backend: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.result) {
        const botResponseText = typeof data.result === 'object' ? data.result.message : data.result;
        const botMessage: MessageType = {
          id: Date.now().toString(),
          text: botResponseText || 'Tidak ada respons',
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        await autoSaveToHistory([...messages, botMessage], originalQuestion);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
      }
    } catch (error) {
      console.error("❌ Error di handleConfirmation:", error);
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        text: "❌ Maaf, terjadi kesalahan saat memproses konfirmasi.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
    if (!isLoading) {
      setLoadingDots(0);
      return;
    }
    
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadChatHistory = async (preserveScroll = false) => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        console.log("No user email found");
        return;
      }
      
      // Jangan load jika user sedang scroll atau baru saja scroll
      const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current;
      if (isScrollingRef.current || timeSinceLastScroll < 2000) {
        console.log("User is scrolling or just scrolled, skip reload");
        return;
      }
      
      let savedScrollPosition = 0;
      if (preserveScroll) {
        savedScrollPosition = scrollPositionRef.current;
      }
      
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/chat/history/${encodeURIComponent(
          userEmail,
        )}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      const data = await response.json();
      if (data.success && data.chatHistory) {
        const parsedHistory = data.chatHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          messages: item.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        
        setChatHistory(parsedHistory);
        
        // Restore scroll position jika preserveScroll true
        if (preserveScroll && savedScrollPosition > 0 && !isScrollingRef.current) {
          if (scrollRestoreTimeoutRef.current) {
            clearTimeout(scrollRestoreTimeoutRef.current);
          }
          
          scrollRestoreTimeoutRef.current = setTimeout(() => {
            if (historyScrollRef.current && !isScrollingRef.current) {
              historyScrollRef.current.scrollTo({
                y: savedScrollPosition,
                animated: false,
              });
            }
          }, 400);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const saveChatHistory = async (history: ChatHistoryType[]) => {
    try {
      // Tidak perlu save ke AsyncStorage lagi, karena sudah di database
      console.log("Chat history updated in state");
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const autoSaveToHistory = async (
    updatedMessages: MessageType[],
    title: string,
  ) => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        console.log("No user email, skipping save");
        return;
      }
      const endpoint = currentChatId
        ? `${API_CONFIG.BACKEND_URL}/api/chat/update`
        : `${API_CONFIG.BACKEND_URL}/api/chat/save`;

      console.log(
        "Saving chat - ID:",
        currentChatId,
        "Messages count:",
        updatedMessages.length,
      );

      const response = await fetch(endpoint, {
        method: currentChatId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          chatId: currentChatId,
          userEmail: userEmail,
          messages: updatedMessages,
          title: currentChatTitle || title,
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (!currentChatId && data.chatId) {
          setCurrentChatId(data.chatId);
          console.log("New chat created with ID:", data.chatId);
        }
        console.log(currentChatId ? "Chat updated" : "Chat saved to database");
        // Reload history tanpa preserve scroll untuk chat baru
        await loadChatHistory(!currentChatId ? false : true);
      }
    } catch (error) {
      console.error("Error auto-saving to history:", error);
    }
  };

  const startNewChat = async () => {
    if (editingChatId) {
      editInputRef.current?.blur();
    }
    setMessages([]);
    setCurrentChatTitle("");
    setCurrentChatId(null);
    setIsLoading(false);
    setShowMenu(false);
    // Force reload history untuk memastikan semua item terlihat
    await loadChatHistory();
  };

  const loadHistory = async (history: ChatHistoryType) => {
    if (editingChatId) {
      editInputRef.current?.blur();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setMessages(history.messages);
    setCurrentChatTitle(history.title);
    setCurrentChatId(history.id);
    setIsLoading(false);
    setShowMenu(false);
    const updatedHistory = chatHistory.map((item) =>
      item.id === history.id ? { ...item, unread: false } : item,
    );
    setChatHistory(updatedHistory);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const scrollToBottomSmooth = () => {
    if (!flatListRef.current) return;
    flatListRef.current.scrollToEnd({ animated: true });
    setShowScrollToBottom(false);
    Animated.timing(scrollButtonOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setString(text);
    setShowCopyToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCopyToast(false));
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.dateSeparatorContainer}>
      <View style={styles.dateSeparator}>
        <Text style={[styles.dateSeparatorText, { backgroundColor: colors.botBubble, color: colors.textSecondary }]}>
          {section.title}
        </Text>
      </View>
    </View>
  );



  // Speech recognition event handlers - DISABLED
  // useSpeechRecognitionEvent("start", () => {
  //   console.log('🎤 Speech recognition started');
  //   setRecognizing(true);
  // });

  // useSpeechRecognitionEvent("end", () => {
  //   console.log('🎤 Speech recognition ended');
  //   setRecognizing(false);
  //   setIsRecording(false);
  // });

  // useSpeechRecognitionEvent("result", (event) => {
  //   console.log('📝 Transcription:', event.results[0]?.transcript);
  //   if (event.results[0]?.transcript) {
  //     setInputText(event.results[0].transcript);
  //   }
  // });

  // useSpeechRecognitionEvent("error", (event) => {
  //   console.error('❌ Speech recognition error:', event.error);
  //   Alert.alert('Error', `Gagal mengenali suara: ${event.error}`);
  //   setIsRecording(false);
  //   setRecognizing(false);
  // });

  // Voice recording functions - DISABLED
  // async function startRecording() {
  //   try {
  //     const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  //     if (!result.granted) {
  //       Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin mikrofon untuk pengenalan suara');
  //       return;
  //     }

      
  //     setIsRecording(true);
  //     setInputText('');
      
  //     await ExpoSpeechRecognitionModule.start({
  //       lang: "id-ID",
  //       interimResults: true,
  //       maxAlternatives: 1,
  //       continuous: false,
  //       requiresOnDeviceRecognition: false,
  //       addsPunctuation: false,
  //       contextualStrings: [],
  //       ...(Platform.OS === "android" && {
  //         androidIntentOptions: {
  //           EXTRA_LANGUAGE_MODEL: "free_form",
  //         },
  //         androidRecognitionServicePackage: "com.google.android.googlequicksearchbox",
  //       }),
  //     });
      
  //     console.log('🎤 Voice recognition started');
  //   } catch (err) {
  //     console.error('Failed to start voice recognition', err);
  //     Alert.alert('Error', 'Gagal memulai pengenalan suara');
  //     setIsRecording(false);
  //   }
  // }

  // async function stopRecording() {
  //   try {
  //     await ExpoSpeechRecognitionModule.stop();
  //     setIsRecording(false);
  //     console.log('🎤 Voice recognition stopped');
  //   } catch (err) {
  //     console.error('Failed to stop voice recognition', err);
  //     setIsRecording(false);
  //   }
  // }

  const renderMessage = ({ item }: { item: MessageType }) => {
    if (item.sender === "system") {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }
    
    return (
      <View>
        <View
          style={[
            styles.messageRow,
            item.sender === "user" ? styles.userRow : styles.botRow,
          ]}
        >
          <TouchableOpacity
            onLongPress={() => copyToClipboard(item.text)}
            activeOpacity={0.7}
            style={[
              styles.messageBubble,
              item.sender === "user" ? { backgroundColor: colors.userBubble } : { backgroundColor: colors.botBubble },
            ]}
          >
            <MessageTextWithLinks
              text={item.text}
              style={[
                styles.messageText,
                item.sender === "user" ? { color: colors.userText } : { color: colors.botText },
              ]}
              onCopy={(text) => copyToClipboard(text)}
            />
            
            {/* Confirmation buttons */}
            {item.isConfirmation && item.options && (
              <View style={styles.confirmationButtons}>
                {item.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.confirmationButton,
                      option.action === 'confirm' ? styles.confirmButton : styles.cancelButton
                    ]}
                    onPress={() => handleConfirmation(item.originalQuestion || '', option.action)}
                  >
                    <Text style={[
                      styles.confirmationButtonText,
                      option.action === 'confirm' ? styles.confirmButtonText : styles.cancelButtonText
                    ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Text
              style={[
                styles.timeText,
                item.sender === "user"
                  ? styles.userTimeText
                  : styles.botTimeText,
              ]}
            >
              {item.timestamp.getHours().toString().padStart(2, "0")}:
              {item.timestamp.getMinutes().toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: ChatHistoryType }) => {
    const isCurrentlyEditing = editingChatId === item.id;
    return (
      <View style={{ position: "relative" }}>
        <TouchableOpacity
          style={[
            styles.historyItem,
            { backgroundColor: colors.background },
            currentChatId === item.id && [styles.historyItemActive, { backgroundColor: colors.botBubble }],
          ]}
          onPress={() => (!isCurrentlyEditing ? loadHistory(item) : null)}
          onLongPress={() => {
            setDeleteItemId(item.id);
            setShowDeleteModal(true);
          }}
          activeOpacity={isCurrentlyEditing ? 1 : 0.7}
        >
          <View style={[styles.historyIcon, { backgroundColor: colors.cardBackground }]}>
            <Ionicons
              name="chatbubble"
              size={20}
              color={item.unread ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={styles.historyContent}>
            <View style={styles.historyHeader}>
              {isCurrentlyEditing ? (
                <TextInput
                  ref={editInputRef}
                  style={[styles.editingInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  defaultValue={item.title}
                  onChangeText={(text) => {
                    editingTextRef.current = text;
                  }}
                  onEndEditing={async () => {
                    const finalText = editingTextRef.current.trim();
                    const originalText = originalTitleRef.current;
                    // Jika kosong, gunakan title asli
                    const textToSave =
                      finalText === "" ? originalText : finalText;
                    // Hanya update jika ada perubahan
                    if (textToSave !== originalText) {
                      try {
                        const response = await fetch(
                          `${API_CONFIG.BACKEND_URL}/api/chat/update-title`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              "ngrok-skip-browser-warning": "true",
                            },
                            body: JSON.stringify({
                              chatId: item.id,
                              newTitle: textToSave,
                            }),
                          },
                        );
                        const data = await response.json();
                        if (data.success) {
                          if (currentChatId === item.id) {
                            setCurrentChatTitle(textToSave);
                          }
                          setChatHistory((prev) =>
                            prev.map((chat) =>
                              chat.id === item.id
                                ? { ...chat, title: textToSave }
                                : chat,
                            ),
                          );
                        }
                      } catch (error) {
                        console.error("Error updating title:", error);
                      }
                    }
                    setEditingChatId(null);
                    setIsEditing(false);
                    editingTextRef.current = "";
                    originalTitleRef.current = "";
                  }}
                  autoFocus={false}
                  returnKeyType="done"
                  multiline={false}
                  keyboardType="default"
                />
              ) : (
                <Text
                  style={[
                    styles.historyItemTitle,
                    item.unread && styles.historyTitleUnread,
                    { color: colors.text }
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.historyRightSection}>
            <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
              {formatRelativeTime(item.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Custom Dropdown - Removed from here */}
      </View>
    );
  };

  // Sidebar history dengan safe area handling
  const MenuSidebar = () => (
    <Animated.View
      style={[styles.menuContainer, { transform: [{ translateX: slideAnim }], backgroundColor: colors.background, borderRightColor: colors.border }]}
    >
      <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.menuLogo}>
          <LinearGradient
            colors={["#007AFF", "#5856D6"]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="smart-toy" size={20} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.menuTitleContainer}>
            <Text style={[styles.menuAppName, { color: colors.text }]}>Chatbot</Text>
            <Text style={[styles.menuAppSubtitle, { color: colors.textSecondary }]}>Assistant</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeMenuButton}
          onPress={() => {
            if (editingChatId) {
              editInputRef.current?.blur();
            }
            setShowMenu(false);
          }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.menuContent}>
        <TouchableOpacity style={[styles.newChatButton, { backgroundColor: colors.primary }]} onPress={startNewChat}>
          <View style={styles.newChatIcon}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.newChatText}>Percakapan Baru</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.historyHeaderTitle, { color: colors.text }]}>Riwayat</Text>
        </View>

        <ScrollView
          ref={historyScrollRef}
          style={{ flex: 1, marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          onTouchStart={() => {
            isScrollingRef.current = true;
            lastScrollTimeRef.current = Date.now();
            if (scrollRestoreTimeoutRef.current) {
              clearTimeout(scrollRestoreTimeoutRef.current);
              scrollRestoreTimeoutRef.current = null;
            }
          }}
          onTouchEnd={() => {
            lastScrollTimeRef.current = Date.now();
            setTimeout(() => {
              isScrollingRef.current = false;
            }, 1000);
          }}
          onScrollBeginDrag={() => {
            isScrollingRef.current = true;
            lastScrollTimeRef.current = Date.now();
            if (scrollRestoreTimeoutRef.current) {
              clearTimeout(scrollRestoreTimeoutRef.current);
              scrollRestoreTimeoutRef.current = null;
            }
          }}
          onScrollEndDrag={() => {
            lastScrollTimeRef.current = Date.now();
            setTimeout(() => {
              isScrollingRef.current = false;
            }, 1000);
          }}
          onMomentumScrollBegin={() => {
            isScrollingRef.current = true;
            lastScrollTimeRef.current = Date.now();
          }}
          onMomentumScrollEnd={() => {
            lastScrollTimeRef.current = Date.now();
            setTimeout(() => {
              isScrollingRef.current = false;
            }, 1000);
          }}
          onScroll={(e) => {
            scrollPositionRef.current = e.nativeEvent.contentOffset.y;
            lastScrollTimeRef.current = Date.now();
          }}
          scrollEventThrottle={16}
        >
          {chatHistory.map((item, index) => (
            <View key={`history-${item.id}`}>
              {renderHistoryItem({ item })}
            </View>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: colors.background }]}>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <View style={styles.deleteModalOverlay}>
          <TouchableOpacity
            style={styles.deleteModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDeleteModal(false)}
          />
          <Animated.View
            style={[
              styles.deleteModalContainer,
              {
                opacity: deleteModalAnim,
                transform: [
                  {
                    scale: deleteModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.deleteModalIcon}>
              <Ionicons name="trash" size={28} color="#FF3B30" />
            </View>
            <Text style={styles.deleteModalTitle}>Hapus Percakapan?</Text>
            <Text style={styles.deleteModalMessage}>
              Percakapan ini akan dihapus secara permanen dan tidak dapat
              dikembalikan.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.deleteModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={async () => {
                  if (!deleteItemId) return;
                  try {
                    const response = await fetch(
                      `${API_CONFIG.BACKEND_URL}/api/chat/delete/${deleteItemId}`,
                      {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          "ngrok-skip-browser-warning": "true",
                        },
                      },
                    );
                    const text = await response.text();
                    const data = JSON.parse(text);
                    if (data.success) {
                      await loadChatHistory();
                      if (currentChatId === deleteItemId) {
                        startNewChat();
                      }
                      setShowDeleteModal(false);
                      setDeleteItemId(null);
                    } else {
                      Alert.alert(
                        "Gagal",
                        data.error || "Gagal menghapus percakapan",
                      );
                    }
                  } catch (error) {
                    Alert.alert("Error", "Terjadi kesalahan");
                  }
                }}
              >
                <Text style={styles.deleteModalDeleteText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <View style={styles.deleteModalOverlay}>
          <TouchableOpacity
            style={styles.deleteModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowLogoutModal(false)}
          />
          <Animated.View
            style={[
              styles.deleteModalContainer,
              {
                opacity: logoutModalAnim,
                transform: [
                  {
                    scale: logoutModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.deleteModalIcon}>
              <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
            </View>
            <Text style={styles.deleteModalTitle}>Keluar Akun?</Text>
            <Text style={styles.deleteModalMessage}>
              Apakah Anda yakin ingin keluar dari akun?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.deleteModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={async () => {
                  await AsyncStorage.removeItem("userToken");
                  await AsyncStorage.removeItem("userEmail");
                  await AsyncStorage.removeItem("userName");
                  setShowLogoutModal(false);
                  setShowAccountSettings(false);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                }}
              >
                <Text style={styles.deleteModalDeleteText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Overlay untuk menu sidebar */}
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
        pointerEvents={showMenu ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => {
            if (editingChatId) {
              editInputRef.current?.blur();
            }
            setShowMenu(false);
          }}
          activeOpacity={1}
        />
      </Animated.View>
      <MenuSidebar />

      {/* Main content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* RESPONSIVE HEADER - Dinamis sesuai status bar */}
        <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                console.log("Menu button clicked");
                Keyboard.dismiss();
                setShowMenu(true);
                console.log("showMenu set to true");
              }}
            >
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Chatbot Assistant</Text>
          </View>
          <TouchableOpacity
            style={styles.accountMenuButton}
            onPress={async () => {
              console.log("Account button clicked");
              Keyboard.dismiss();
              // Preload data sebelum membuka modal
              const [email, name, image] = await Promise.all([
                AsyncStorage.getItem("userEmail"),
                AsyncStorage.getItem("userName"),
                AsyncStorage.getItem("profileImage"),
              ]);
              if (email) setPreloadedUserEmail(email);
              if (name) setPreloadedUserName(name);
              else if (email) setPreloadedUserName(email.split("@")[0]);
              if (image) setProfileImage(image);
              setShowAccountSettings(true);
              console.log("showAccountSettings set to true");
            }}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={[
                  styles.accountAvatarImage,
                  { borderColor: colors.background }
                ]}
              />
            ) : (
              <View style={[styles.accountAvatar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Status koneksi */}
        {connectionStatus !== "online" && (
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                connectionStatus === "offline" && styles.statusOffline,
                connectionStatus === "checking" && styles.statusChecking,
              ]}
            >
              {connectionStatus === "checking" && (
                <Ionicons name="refresh" size={8} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.statusText}>
              {connectionStatus === "offline" ? "Terputus" : "Menghubungkan..."}
            </Text>
            <TouchableOpacity
              onPress={checkConnection}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Welcome container */}
        {messages.length === 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.welcomeContainer,
              {
                opacity: welcomeOpacityAnim,
                transform: [{ translateY: welcomeKeyboardAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoScaleAnim }],
                },
              ]}
            >
              <MaterialIcons name="smart-toy" size={100} color="#007AFF" />
            </Animated.View>
            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Halo, Saya asisten chatbot
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                {typedText}
                <Text style={styles.cursor}>|</Text>
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Chat messages dengan ScrollView */}
        <ScrollView
          ref={flatListRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.chatList,
            { paddingBottom: keyboardHeight > 0 ? 10 : 80 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
          }}
          onScroll={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            const contentHeight = e.nativeEvent.contentSize.height;
            const scrollViewHeight = e.nativeEvent.layoutMeasurement.height;
            const isNearBottom = offsetY + scrollViewHeight >= contentHeight - 200;
            const shouldShow = !isNearBottom && messages.length > 0;
            
            if (shouldShow !== showScrollToBottom) {
              setShowScrollToBottom(shouldShow);
              Animated.timing(scrollButtonOpacity, {
                toValue: shouldShow ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }
          }}
          scrollEventThrottle={16}
        >
          {groupedMessages.map((section, sectionIndex) => (
            <View key={`section-${sectionIndex}`}>
              {renderSectionHeader({ section })}
              {section.data.map((item) => (
                <View key={item.id}>
                  {renderMessage({ item })}
                </View>
              ))}
            </View>
          ))}
          {isLoading && (
            <View style={styles.typingIndicatorInline}>
              <View style={[styles.typingBubble, { backgroundColor: colors.botBubble }]}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, loadingDots >= 1 && styles.typingDotVisible]} />
                  <View style={[styles.typingDot, styles.typingDotMiddle, loadingDots >= 2 && styles.typingDotVisible]} />
                  <View style={[styles.typingDot, loadingDots >= 3 && styles.typingDotVisible]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Scroll to Bottom Button */}
        <Animated.View
          style={[
            styles.scrollToBottomButton,
            {
              bottom: Platform.OS === 'ios' && keyboardHeight > 0 ? keyboardHeight + 50 : 80,
              opacity: scrollButtonOpacity,
              transform: [
                {
                  translateY: scrollButtonOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={showScrollToBottom ? "auto" : "none"}
        >
          <TouchableOpacity
            style={[styles.scrollToBottomButtonInner, { backgroundColor: colors.headerBackground }]}
            onPress={scrollToBottomSmooth}
          >
            <Ionicons name="arrow-down" size={24} color={colors.botText} />
          </TouchableOpacity>
        </Animated.View>

        {/* RESPONSIVE INPUT AREA - Simple approach */}
        <View style={[styles.inputArea, { backgroundColor: colors.background }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.botBubble }]}>
            <TextInput
              ref={textInputRef}
              style={[styles.textInput, { color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ketikkan pertanyaan"
              placeholderTextColor="#8e8e93"
              multiline
              editable={!isLoading}
              onFocus={() => {
                setKeyboardVisible(true);
              }}
              onBlur={() => setKeyboardVisible(false)}
            />
            {inputText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setInputText("")}
                disabled={isLoading}
              >
                <Ionicons name="close-circle" size={24} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (isLoading) {
                handleCancelRequest();
              } else if (inputText.trim()) {
                handleSend();
              }
              // Voice feature disabled
              // else if (isRecording) {
              //   stopRecording();
              // } else {
              //   startRecording();
              // }
            }}
            disabled={isLoading && isRecording}
          >
            {isLoading ? (
              <Ionicons name="close" size={24} color="#FFFFFF" />
            ) : inputText.trim() ? (
              <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={24} color="#FFFFFF" />
            )}
            {/* Voice icon disabled */}
            {/* : isRecording ? (
              <Ionicons name="stop" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            )} */}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Account Settings Overlay */}
      <Animated.View
        style={[styles.accountOverlay, { opacity: accountFadeAnim }]}
        pointerEvents={showAccountSettings ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowAccountSettings(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Account Settings Modal */}
      <Animated.View
        style={[
          styles.accountSettingsModal,
          {
            transform: [{ translateX: accountSlideAnim }],
          },
        ]}
        pointerEvents={showAccountSettings ? "auto" : "none"}
      >
        {(showAccountSettings || renderAccountSettings) && (
          <AccountSettingsScreen
            navigation={navigation}
            onClose={() => setShowAccountSettings(false)}
            preloadedEmail={preloadedUserEmail}
            preloadedName={preloadedUserName}
            onLogout={handleLogout}
          />
        )}
      </Animated.View>

      {/* Copy Toast Notification */}
      {showCopyToast && (
        <Animated.View
          style={[
            styles.copyToast,
            {
              opacity: toastOpacity,
              transform: [
                {
                  translateY: toastOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#0022ff" />
          <Text style={styles.copyToastText}>Pesan tersalin</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
    elevation: 998,
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.73,
    backgroundColor: "#FFFFFF",
    zIndex: 999,
    elevation: 999,
    borderRightWidth: 1,
    borderRightColor: "#F2F2F7",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "visible",
  },
  menuHeader: {
    marginTop: Platform.OS === "ios" ? 64 : 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 15,
    paddingVertical: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuLogo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTitleContainer: {
    flexDirection: "column",
  },
  menuAppName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  menuAppSubtitle: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
  },
  closeMenuButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
    overflow: "visible",
    zIndex: 1,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  newChatIcon: {
    marginRight: 12,
  },
  newChatText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  historyHeaderTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1c1c1c",
    marginBottom: 0,
    marginTop: 4,
    letterSpacing: 1,
  },
  stickyHeader: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    zIndex: 10,
  },
  historyScrollView: {
    flex: 1,
  },
  historyScrollContent: {
    paddingBottom: 20,
  },
  historyItemWrapper: {
    overflow: "visible",
    zIndex: 1,
  },
  historyHeaderContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  editingInput: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    flex: 1,
    marginRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#007AFF",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  historyFlatList: {
    flex: 1,
    overflow: "visible",
  },
  historyList: {
    paddingBottom: 20,
    paddingTop: 0,
    overflow: "visible",
  },
  historyItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderColor: "transparent",
    zIndex: 1,
    padding: 7,
    borderRadius: 10,
    borderWidth: 2,
  },
  historyItemActive: {
    backgroundColor: "#eeeeee",
    borderColor: "transparent",
    borderWidth: 2,
    borderRadius: 10,
    padding: 7,
  },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingRight: 8,
  },
  historyItemTitle: {
    paddingTop: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    alignItems: "center",
  },
  historyTitleUnread: {
    fontWeight: "700",
  },
  historyTime: {
    fontSize: 10,
    color: "#8E8E93",
  },
  historyPreview: {
    fontSize: 14,
    color: "#8E8E93",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  historyRightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  historyMenuButton: {
    padding: 8,
    marginLeft: 4,
  },
  dropdownPortal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  dropdownMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownMenuText: {
    fontSize: 13,
    color: "#FF3B30",
    marginLeft: 6,
  },
  dropdownItemDanger: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 12,
    color: "#000000",
    marginLeft: 6,
  },
  dropdownTextDanger: {
    color: "#FF3B30",
  },
  dateSeparatorContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparator: {
    alignItems: "center",
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  homeIcon: {
    marginRight: 12,
  },
  homeText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  accountButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    marginRight: 12,
  },
  accountText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuButton: {
    padding: 4,
    marginRight: 12,
    marginLeft: 10,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
    marginTop: -4,
  },
  accountMenuButton: {
    padding: 4,
    marginRight: 10,
  },
  accountAvatar: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  accountAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#F2F2F7",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statusOnline: {
    backgroundColor: "#34C759",
  },
  statusOffline: {
    backgroundColor: "#FF3B30",
  },
  statusChecking: {
    backgroundColor: "#FF9500",
  },
  statusText: {
    fontSize: 14,
    color: "#8E8E93",
    marginRight: 8,
  },
  refreshButton: {
    padding: 4,
  },
  welcomeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    zIndex: 0,
  },

  welcomeContainerKeyboard: {
    paddingTop: 40,
    paddingBottom: 20,
  },

  logoContainer: {
    marginBottom: 30, // ✅ JARAK AMAN logo ke title
  },

  logo: {
    width: 120,
    height: 120,
  },

  welcomeTextContainer: {
    alignItems: "center",
    marginTop: -30, // kamu bisa atur juga kalau mau
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  welcomeSubtitle: {
    fontSize: 17,
    textAlign: "center",
    minHeight: 24,
  },
  cursor: {
    color: "#007AFF",
    fontWeight: "300",
  },
  chatList: {
    paddingHorizontal: 17,
    paddingTop: 30,
    paddingBottom: 60,
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#eeeeee",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#000000",
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  botTimeText: {
    color: "#8E8E93",
  },
  typingIndicatorInline: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    marginTop: 0,
  },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingBubble: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  typingDotVisible: {
    backgroundColor: "#8E8E93",
  },
  typingDotMiddle: {
    marginHorizontal: 4,
  },
  inputArea: {
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 0,
    paddingHorizontal: 0,
    maxHeight: 84,
  },
  clearButton: {
    marginLeft: 8,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  accountOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    elevation: 1000,
  },
  accountSettingsModal: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 1,
    backgroundColor: "#FFFFFF",
    zIndex: 1001,
    elevation: 1001,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  deleteModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  deleteModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 20,
    marginHorizontal: 30,
    width: width * 0.85,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  deleteModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
    textAlign: "center",
  },
  deleteModalMessage: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  deleteModalDeleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteModalDeleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollToBottomButton: {
    position: 'absolute',
    alignSelf: 'center',
  },
  scrollToBottomButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  copyToast: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10002,
  },
  copyToastText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
  },
  confirmationButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  confirmationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#000000",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  systemMessageText: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    lineHeight: 18,
  },
  preciseStickyHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
    zIndex: 100,
    elevation: 3,
  },
  preciseStickyText: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

});

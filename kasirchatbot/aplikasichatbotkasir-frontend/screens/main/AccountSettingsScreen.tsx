import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { RootStackParamList } from "../../types/navigation";
import EditProfileScreen from "./EditProfileScreen";
import ModelAIScreen from "./ModelAIScreen";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import TermsConditionsScreen from "./TermsConditionsScreen";
import ThemeSettingsScreen from "./ThemeSettingsScreen";

const { height } = Dimensions.get("window");

type AccountSettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  onClose?: () => void;
  preloadedEmail?: string;
  preloadedName?: string;
  onLogout?: () => void;
};

export default function AccountSettingsScreen({
  navigation,
  onClose,
  preloadedEmail,
  preloadedName,
  onLogout,
}: AccountSettingsScreenProps) {
  const { colors } = useTheme();
  const [userName, setUserName] = useState(preloadedName || "");
  const [userEmail, setUserEmail] = useState(preloadedEmail || "");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const [showModelAI, setShowModelAI] = useState(false);
  const [renderModelAI, setRenderModelAI] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [renderTerms, setRenderTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [renderPrivacy, setRenderPrivacy] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [renderEditProfile, setRenderEditProfile] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [renderTheme, setRenderTheme] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [renderImagePicker, setRenderImagePicker] = useState(false);

  const modelAISlideAnim = useRef(new Animated.Value(height)).current;
  const modelAIFadeAnim = useRef(new Animated.Value(0)).current;
  const termsSlideAnim = useRef(new Animated.Value(height)).current;
  const termsFadeAnim = useRef(new Animated.Value(0)).current;
  const privacySlideAnim = useRef(new Animated.Value(height)).current;
  const privacyFadeAnim = useRef(new Animated.Value(0)).current;
  const editProfileSlideAnim = useRef(new Animated.Value(height)).current;
  const editProfileFadeAnim = useRef(new Animated.Value(0)).current;
  const themeSlideAnim = useRef(new Animated.Value(height)).current;
  const themeFadeAnim = useRef(new Animated.Value(0)).current;
  const imagePickerSlideAnim = useRef(new Animated.Value(height)).current;
  const imagePickerFadeAnim = useRef(new Animated.Value(0)).current;

  // Load user data immediately and synchronously
  if (isInitialMount.current) {
    isInitialMount.current = false;
    if (!preloadedEmail || !preloadedName) {
      AsyncStorage.multiGet(["userEmail", "userName", "profileImage"]).then(
        ([emailPair, namePair, imagePair]) => {
          const email = emailPair[1];
          const name = namePair[1];
          const image = imagePair[1];
          if (email && !preloadedEmail) setUserEmail(email);
          if (name && !preloadedName) setUserName(name);
          else if (email && !name && !preloadedName)
            setUserName(email.split("@")[0]);
          if (image) setProfileImage(image);
        },
      );
    }
  }

  // Load from backend immediately
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email && isMounted) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(
            `${require("../../config/api-config").API_CONFIG.BACKEND_URL}/api/profile/get?email=${email}`,
            { 
              headers: { "ngrok-skip-browser-warning": "true" },
              signal: controller.signal,
            },
          );
          
          clearTimeout(timeoutId);
          const text = await response.text();
          const data = JSON.parse(text);
          if (data.success && data.user && isMounted) {
            if (data.user.name) {
              setUserName(data.user.name);
              await AsyncStorage.setItem("userName", data.user.name);
            }
            if (data.user.profileImage) {
              const imageUrl = `${require("../../config/api-config").API_CONFIG.BACKEND_URL}${data.user.profileImage}`;
              setProfileImage(imageUrl);
              await AsyncStorage.setItem("profileImage", imageUrl);
            } else {
              setProfileImage(null);
              await AsyncStorage.removeItem("profileImage");
            }
          }
        } catch (e) {
          console.log("Load profile error:", e);
        }
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  // Reload data when returning from edit profile
  useEffect(() => {
    if (!showEditProfile) {
      AsyncStorage.getItem("userName").then((name) => {
        if (name) setUserName(name);
      });
    }
  }, [showEditProfile]);

  useEffect(() => {
    if (showModelAI) {
      setRenderModelAI(true);
      Animated.parallel([
        Animated.timing(modelAISlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modelAIFadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modelAISlideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modelAIFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderModelAI(false);
      });
    }
  }, [showModelAI]);

  useEffect(() => {
    if (showTerms) {
      setRenderTerms(true);
      Animated.parallel([
        Animated.timing(termsSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(termsFadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(termsSlideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(termsFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderTerms(false);
      });
    }
  }, [showTerms]);

  useEffect(() => {
    if (showPrivacy) {
      setRenderPrivacy(true);
      Animated.parallel([
        Animated.timing(privacySlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(privacyFadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(privacySlideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(privacyFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderPrivacy(false);
      });
    }
  }, [showPrivacy]);

  useEffect(() => {
    if (showEditProfile) {
      setRenderEditProfile(true);
      Animated.parallel([
        Animated.timing(editProfileSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(editProfileFadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(editProfileSlideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(editProfileFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderEditProfile(false);
      });
    }
  }, [showEditProfile]);

  useEffect(() => {
    if (showTheme) {
      setRenderTheme(true);
      Animated.parallel([
        Animated.timing(themeSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(themeFadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(themeSlideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(themeFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderTheme(false);
      });
    }
  }, [showTheme]);

  useEffect(() => {
    if (showImagePicker) {
      setRenderImagePicker(true);
      Animated.parallel([
        Animated.timing(imagePickerSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(imagePickerFadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(imagePickerSlideAnim, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(imagePickerFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderImagePicker(false);
      });
    }
  }, [showImagePicker]);

  const uploadImageToBackend = async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('profileImage', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: filename,
        type,
      } as any);
      formData.append('email', userEmail);

      const response = await fetch(
        `${require("../../config/api-config").API_CONFIG.BACKEND_URL}/api/profile/upload-image`,
        {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        }
      );

      const text = await response.text();
      console.log('Response:', text);
      const data = JSON.parse(text);
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleImageSource = async (source: "camera" | "gallery") => {
    setShowImagePicker(false);
    
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Izin kamera diperlukan untuk mengambil foto");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        const uploadedUrl = await uploadImageToBackend(imageUri);
        if (uploadedUrl) {
          const fullImageUrl = `${require("../../config/api-config").API_CONFIG.BACKEND_URL}${uploadedUrl}`;
          setProfileImage(fullImageUrl);
          await AsyncStorage.setItem("profileImage", fullImageUrl);
        }
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Izin galeri diperlukan untuk memilih foto");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        const uploadedUrl = await uploadImageToBackend(imageUri);
        if (uploadedUrl) {
          const fullImageUrl = `${require("../../config/api-config").API_CONFIG.BACKEND_URL}${uploadedUrl}`;
          setProfileImage(fullImageUrl);
          await AsyncStorage.setItem("profileImage", fullImageUrl);
        }
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      Alert.alert("Keluar", "Apakah Anda yakin ingin keluar dari akun?", [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userEmail");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]);
    }
  };

  const menuItems = [
    {
      title: "Tema Aplikasi",
      icon: "color-palette-outline",
      color: "#5856D6",
      onPress: () => setShowTheme(true),
    },
  ];

  const aboutItems = [
    {
      title: "Model AI",
      icon: "code-slash-outline",
      color: "#3496c7",
      onPress: () => setShowModelAI(true),
    },
    {
      title: "Syarat Dan Ketentuan",
      icon: "reader-outline",
      color: "#34C759",
      onPress: () => setShowTerms(true),
    },
    {
      title: "Kebijakan Privasi",
      icon: "lock-closed-outline",
      color: "#FF2D55",
      onPress: () => setShowPrivacy(true),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safeAreaContainer, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* RESPONSIVE HEADER - Dinamis sesuai status bar & notch */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (onClose) {
              onClose();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Pengaturan Akun
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View
          style={[styles.profileSection, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={() => setShowImagePicker(true)} activeOpacity={0.8}>
            {profileImage ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: profileImage }} style={styles.avatarImage} key={profileImage} />
                <View style={[styles.addIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="add-circle" size={32} color={colors.primary} />
                </View>
              </View>
            ) : (
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={["#007AFF", "#5AC8FA"]}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={[styles.addIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="add-circle" size={32} color={colors.primary} />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.text }]}>
            {userName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {userEmail}
          </Text>
          <TouchableOpacity
            style={[
              styles.editProfileButton,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => setShowEditProfile(true)}
          >
            <Text style={[styles.editProfileText, { color: colors.primary }]}>
              Edit Profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PENGATURAN
          </Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#C6C6C8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* About App */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TENTANG APLIKASI
          </Text>
          {aboutItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#C6C6C8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View
          style={[styles.appInfoSection, { borderTopColor: colors.border }]}
        >
          <MaterialIcons name="smart-toy" size={50} color="#007AFF" />
          <Text style={[styles.appName, { color: colors.text }]}>
            Chatbot Assistant
          </Text>
          <Text style={styles.appDescription}>
            Nangka Busuk AI Assistant v2.0
          </Text>
          <Text style={styles.appCopyright}>
            © 2024 Chatbot Assistant. All rights reserved.
          </Text>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* SAFE AREA SPACER - Menyesuaikan navigation bar & gesture bar */}
        <View
          style={[
            styles.safeAreaSpacer,
            {
              height:
                Platform.OS === "ios"
                  ? 34 // iOS gesture bar height
                  : 48, // Android navigation bar (standard height)
            },
          ]}
        />
      </ScrollView>

      {/* Model AI Modal Overlay */}
      <Animated.View
        style={[styles.modelAIOverlay, { opacity: modelAIFadeAnim }]}
        pointerEvents={showModelAI ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowModelAI(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Model AI Modal - Responsive positioning */}
      <Animated.View
        style={[
          styles.modelAIModal,
          {
            transform: [{ translateY: modelAISlideAnim }],
          },
        ]}
        pointerEvents={showModelAI ? "auto" : "none"}
      >
        {(showModelAI || renderModelAI) && (
          <ModelAIScreen
            navigation={navigation}
            onClose={() => setShowModelAI(false)}
          />
        )}
      </Animated.View>

      {/* Terms Modal Overlay */}
      <Animated.View
        style={[styles.modelAIOverlay, { opacity: termsFadeAnim }]}
        pointerEvents={showTerms ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowTerms(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Terms Modal */}
      <Animated.View
        style={[
          styles.fullScreenModal,
          { transform: [{ translateY: termsSlideAnim }] },
        ]}
        pointerEvents={showTerms ? "auto" : "none"}
      >
        {(showTerms || renderTerms) && (
          <TermsConditionsScreen
            navigation={navigation}
            onClose={() => setShowTerms(false)}
          />
        )}
      </Animated.View>

      {/* Privacy Modal Overlay */}
      <Animated.View
        style={[styles.modelAIOverlay, { opacity: privacyFadeAnim }]}
        pointerEvents={showPrivacy ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowPrivacy(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Privacy Modal */}
      <Animated.View
        style={[
          styles.fullScreenModal,
          { transform: [{ translateY: privacySlideAnim }] },
        ]}
        pointerEvents={showPrivacy ? "auto" : "none"}
      >
        {(showPrivacy || renderPrivacy) && (
          <PrivacyPolicyScreen
            navigation={navigation}
            onClose={() => setShowPrivacy(false)}
          />
        )}
      </Animated.View>

      {/* Edit Profile Modal Overlay */}
      <Animated.View
        style={[styles.modelAIOverlay, { opacity: editProfileFadeAnim }]}
        pointerEvents={showEditProfile ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowEditProfile(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Edit Profile Modal */}
      <Animated.View
        style={[
          styles.editProfileModal,
          { transform: [{ translateY: editProfileSlideAnim }] },
        ]}
        pointerEvents={showEditProfile ? "auto" : "none"}
      >
        {(showEditProfile || renderEditProfile) && (
          <EditProfileScreen
            navigation={navigation}
            onClose={() => {
              AsyncStorage.getItem("userName").then((n) => n && setUserName(n));
              setShowEditProfile(false);
            }}
          />
        )}
      </Animated.View>

      {/* Theme Modal Overlay */}
      <Animated.View
        style={[styles.modelAIOverlay, { opacity: themeFadeAnim }]}
        pointerEvents={showTheme ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowTheme(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Theme Modal - Responsive positioning */}
      <Animated.View
        style={[
          styles.themeModal,
          {
            transform: [{ translateY: themeSlideAnim }],
          },
        ]}
        pointerEvents={showTheme ? "auto" : "none"}
      >
        {(showTheme || renderTheme) && (
          <ThemeSettingsScreen
            navigation={navigation}
            onClose={() => setShowTheme(false)}
          />
        )}
      </Animated.View>

      {/* Image Picker Modal Overlay */}
      <Animated.View
        style={[styles.modelAIOverlay, { opacity: imagePickerFadeAnim }]}
        pointerEvents={showImagePicker ? "auto" : "none"}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setShowImagePicker(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Image Picker Modal */}
      <Animated.View
        style={[
          styles.imagePickerModal,
          {
            transform: [{ translateY: imagePickerSlideAnim }],
          },
        ]}
        pointerEvents={showImagePicker ? "auto" : "none"}
      >
        {(showImagePicker || renderImagePicker) && (
          <View style={[styles.imagePickerContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.imagePickerHeader, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
              <View style={styles.headerPlaceholder} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>Pilih Foto Profil</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowImagePicker(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imagePickerContent}>
              <TouchableOpacity
                style={[styles.imageSourceCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => handleImageSource("camera")}
                activeOpacity={0.7}
              >
                <View style={[styles.imageSourceIcon, { backgroundColor: "#007AFF" }]}>
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.imageSourceText, { color: colors.text }]}>Kamera</Text>
                <Ionicons name="chevron-forward" size={20} color="#C6C6C8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageSourceCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => handleImageSource("gallery")}
                activeOpacity={0.7}
              >
                <View style={[styles.imageSourceIcon, { backgroundColor: "#34C759" }]}>
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.imageSourceText, { color: colors.text }]}>Galeri</Text>
                <Ionicons name="chevron-forward" size={20} color="#C6C6C8" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingTop: Platform.OS === "android" ? 16 : 0,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  backButton: {
    padding: 4,
    marginLeft: 10, // Sama seperti menuButton di ChatScreen
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  addIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    top: -8,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
    fontWeight: "500",
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    marginTop: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginTop: 8,
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 8,
    textAlign: "center",
  },
  appCopyright: {
    fontSize: 13,
    color: "#C6C6C8",
    textAlign: "center",
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    // Removed hardcoded bottom padding - handled by spacer
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B3010",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    bottom: 20,
    borderColor: "#FF3B30",
  },
  logoutText: {
    fontSize: 17,
    color: "#FF3B30",
    fontWeight: "600",
    marginLeft: 8,
  },
  modelAIOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
  modelAIModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "34%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1001,
    // Removed hardcoded top value - handled inline with safe area
  },
  themeModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "55%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1001,
  },
  imagePickerModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: "60%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1001,
  },
  imagePickerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  imagePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  closeButton: {
    marginTop: 2,
  },
  imagePickerContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  imageSourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  imageSourceIcon: {
    width: 47,
    height: 47,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  imageSourceText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  fullScreenModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1001,
  },
  editProfileModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1001,
  },
  safeAreaSpacer: {
    width: "100%",
    // Height handled inline based on platform
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 4,
    marginLeft: "50%",
    marginRight: 16,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  dropdownText: {
    fontSize: 15,
    color: "#000000",
  },
});

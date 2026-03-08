import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { GoogleSignin } from "@react-native-google-signin/google-signin"; // DISABLED for Expo Go
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_CONFIG } from "../../config/api-config";
import { RootStackParamList } from "../../types/navigation";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);

  // Auto-login sudah dihandle di AppNavigator

  const handleLogin = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");

    //validasi email dan password
    if (!email && !password) {
      setEmailError("Silahkan masukkan email anda");
      setPasswordError("Silahkan masukkan password anda");
      return;
    }

    // Validasi email
    if (!email) {
      setEmailError("Email harus diisi");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Format email tidak valid");
      return;
    }

    // Validasi password
    if (!password) {
      setPasswordError("Password harus diisi");
      return;
    }

    setIsEmailLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        // Cek jika akun dinonaktifkan
        if (data.error && data.error.includes("dinonaktifkan")) {
          Alert.alert(
            "Akun Tidak Aktif",
            "Silakan hubungi admin untuk bantuan lebih lanjut.",
            [{ text: "OK" }],
          );
          return;
        }

        // Tampilkan error umum di password saja
        setPasswordError("Email atau password yang Anda masukkan salah");
        return;
      }

      // Simpan token dan user data
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userEmail", data.user.email);
      await AsyncStorage.setItem("userName", data.user.name);

      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      console.error("Login error:", error);
      setPasswordError(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda",
      );
    } finally {
      setIsEmailLoading(false);
    }
  };

  // DISABLED - Google Sign In useEffect
  // useEffect(() => {
  //   const isExpoGo = Constants.appOwnership === "expo";
  //   if (!isExpoGo && Platform.OS !== "web") {
  //     GoogleSignin.configure({
  //       webClientId:
  //         "343892476833-g175ljg5aeqipsqq9hoq4vop9bge9oev.apps.googleusercontent.com",
  //       forceCodeForRefreshToken: true,
  //     });
  //   }
  // }, []);

  // DISABLED - Google Sign In function
  const handleGoogleSignIn = async () => {
    Alert.alert(
      "Tidak Tersedia",
      "Google Sign In tidak tersedia. Silakan gunakan email dan password untuk login.",
    );
  };
  /*
  const handleGoogleSignIn = async () => {
    const isExpoGo = Constants.appOwnership === "expo";

    if (isExpoGo || Platform.OS === "web") {
      Alert.alert(
        "Tidak Tersedia",
        "Google Sign In hanya tersedia di aplikasi standalone (bukan Expo Go atau web). Silakan gunakan email dan password untuk login.",
      );
      return;
    }

    try {
      setIsGoogleLoading(true);
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert("Error", "Gagal mendapatkan token Google");
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/auth/google-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ idToken }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        if (data.error && data.error.includes("tidak terdaftar")) {
          setShowUnregisteredModal(true);
        } else {
          Alert.alert("Error", data.error || "Gagal login dengan Google");
        }
        return;
      }

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userEmail", data.user.email);
      await AsyncStorage.setItem("userName", data.user.name);

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      if (error.code === "SIGN_IN_CANCELLED") {
        return;
      }
      Alert.alert("Error", "Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setIsGoogleLoading(false);
    }
  };
  */

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo_mm-removebg-preview.png")}
              style={styles.logoImage}
            />
            <Text style={styles.appTitle}>Chatbot Assistant</Text>
            {/* <Text style={styles.appSubtitle}>Nangka Busuk AI Assistant</Text> */}
          </View>

          {/* Message Section 
          <View style={styles.messageSection}>
            <Text style={styles.messageTitle}></Text>
            <Text style={styles.messageText}>
             
            </Text>
          </View>*/}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#8E8E93"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="contoh@gmail.com"
                  placeholderTextColor="#8E8E93"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isEmailLoading}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#8E8E93"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="* * * * * * * *"
                  placeholderTextColor="#8E8E93"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isEmailLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8E8E93"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate("ForgotPassword")}
              disabled={isEmailLoading}
            >
              <Text style={styles.forgotPasswordText}>Lupa password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInButton,
                isEmailLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isEmailLoading}
            >
              {isEmailLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Don't have account */}
            <View style={styles.accountContainer}>
              <Text style={styles.accountText}>Belum punya akun?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUp")}
                disabled={isEmailLoading}
              >
                <Text style={styles.createAccountText}>Buat akun</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            {/* <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Atau</Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* Google Sign In */}
            {/* <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                }}
                style={styles.googleIcon}
              />
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.googleButtonText}>Login dengan Google</Text>
              )}
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Unregistered Email Modal */}
      {showUnregisteredModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Ionicons name="alert-circle" size={48} color="#FF9500" />
            </View>
            <Text style={styles.modalTitle}>Email Belum Terdaftar</Text>
            <Text style={styles.modalMessage}>
              Email Google Anda belum terdaftar. Silakan buat akun terlebih
              dahulu menggunakan email dan password.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowUnregisteredModal(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => {
                  setShowUnregisteredModal(false);
                  navigation.navigate("SignUp");
                }}
              >
                <Text style={styles.modalConfirmText}>Buat Akun</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
  },
  logoImage: {
    width: 86,
    height: 86,
    resizeMode: "contain",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 16,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 4,
  },
  messageSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
    marginTop: 20,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C6C6C8",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    bottom: 17,
    alignSelf: "flex-end",
    marginBottom: 40,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  accountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  accountText: {
    fontSize: 15,
    color: "#8E8E93",
    marginRight: 4,
  },
  createAccountText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    bottom: 30,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: "#007AFF",
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#C6C6C8",
  },
  dividerText: {
    fontSize: 14,
    color: "#8E8E93",
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C6C6C8",
    borderRadius: 12,
    height: 52,
    backgroundColor: "#FFFFFF",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#000000",
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    marginTop: 6,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 30,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default LoginScreen;

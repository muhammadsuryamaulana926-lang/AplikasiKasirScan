import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Library area aman
import { API_CONFIG } from "../../config/api-config";
import { RootStackParamList } from "../../types/navigation";

type SignUpPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SignUpPassword">;
  route: any;
};

const SignUpPasswordScreen: React.FC<SignUpPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { email } = route.params;
  const insets = useSafeAreaInsets(); // Mengambil insets sistem

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setPasswordError("");
    setConfirmPasswordError("");

    if (!password || !confirmPassword) {
      setConfirmPasswordError("Mohon isi semua kolom");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/auth/register/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code: route.params.code,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        setConfirmPasswordError(data.error || "Gagal membuat akun");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      Alert.alert(
        "Berhasil",
        "Pendaftaran berhasil. Silakan login menggunakan akun Anda.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
        ],
      );
    } catch (error) {
      setConfirmPasswordError("Gagal membuat akun. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    // Padding top dinamis untuk notch
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "undefined"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.title}>Keamanan</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Content Section */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordError !== "" && styles.inputError,
                  ]}
                >
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
                    editable={!isLoading}
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Konfirmasi password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    confirmPasswordError !== "" && styles.inputError,
                  ]}
                >
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
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setConfirmPasswordError("");
                    }}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#8E8E93"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>
            </ScrollView>

            {/* Footer Button - Aman dari Nav Bar HP */}
            <View style={[styles.buttonFooter]}>
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signUpButtonText}>Registrasi akun</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    //height: Platform.OS === "ios" ? 20 : 30,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    paddingBottom: 15,
  },
  backButton: {
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    height: 54,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#FF3B30",
    marginTop: 8,
  },
  // Ganti styles buttonFooter Anda dengan ini
  buttonFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: Platform.OS === "ios" ? 15 : 10,

    // Padding bottom akan diatur inline di komponen menggunakan insets
    backgroundColor: "#ffffff", // Ubah ke putih agar menyatu dengan background
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  signUpButton: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#007AFF",
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default SignUpPasswordScreen;

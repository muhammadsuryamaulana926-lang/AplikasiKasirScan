import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Gunakan insets
import { API_CONFIG } from "../../config/api-config";
import { RootStackParamList } from "../../types/navigation";

const { width } = Dimensions.get("window");

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ResetPassword">;
  route: any;
};

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { email } = route.params;
  const insets = useSafeAreaInsets(); // Ambil area aman sistem

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successModalAnim = useState(new Animated.Value(0))[0];

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Mohon isi semua kolom");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            code: route.params.code,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        setErrorMessage(data.error || "Gagal reset password");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      setShowSuccessModal(true);
      Animated.spring(successModalAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setErrorMessage("Koneksi gagal. Mohon periksa internet Anda.");
      setIsLoading(false);
    }
  };

  return (
    // Padding top dinamis dari insets agar header pas di bawah notch
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "undefined"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header - Tetap konsisten dengan layar sebelumnya */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.title}>Atur Ulang Password</Text>
              <View style={styles.placeholder} />
            </View>

            {/* ScrollView agar konten bisa digeser jika keyboard menutupi input */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* New Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password Baru</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errorMessage && styles.inputError,
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
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setErrorMessage("");
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
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errorMessage && styles.inputError,
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
                      setErrorMessage("");
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
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
              </View>
            </ScrollView>

            {/* Footer Button - Menggunakan insets.bottom agar tidak tertutup navigasi HP */}
            <View style={[styles.buttonFooter]}>
              <TouchableOpacity
                style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: successModalAnim,
                transform: [
                  {
                    scale: successModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={28} color="#34C759" />
            </View>
            <Text style={styles.modalTitle}>Berhasil</Text>
            <Text style={styles.modalMessage}>
              Password Anda telah berhasil diubah. Silakan login dengan password baru Anda.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Animated.timing(successModalAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start(() => {
                  setShowSuccessModal(false);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                  });
                });
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
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
    backgroundColor: "#FFFFFF", // Ubah ke putih agar menyatu dengan background
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  resetButton: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#C6C6C8",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
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
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5F7EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ResetPasswordScreen;

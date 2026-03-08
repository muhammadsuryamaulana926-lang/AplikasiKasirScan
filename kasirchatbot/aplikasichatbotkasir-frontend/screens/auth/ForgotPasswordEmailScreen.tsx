import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
// Library kunci agar pas di semua jenis layar HP
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_CONFIG } from "../../config/api-config";
import { RootStackParamList } from "../../types/navigation";

type ForgotPasswordEmailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;
};

const ForgotPasswordEmailScreen: React.FC<ForgotPasswordEmailScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Mendapatkan angka presisi area aman (top untuk notch, bottom untuk nav bar)
  const insets = useSafeAreaInsets();

  const handleSendEmail = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("masukkan email Anda");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("masukkan alamat email yang valid");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/auth/forgot-password/send-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      if (!data.success) {
        setErrorMessage(data.error || "Gagal mengirim kode verifikasi");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      navigation.navigate("VerificationCode", { email, type: "forgot" });
    } catch (error) {
      setErrorMessage("Koneksi gagal. Mohon periksa internet Anda.");
      setIsLoading(false);
    }
  };

  return (
    // View utama menggunakan paddingTop dari insets.top agar header pas di bawah notch/status bar
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "undefined"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* HEADER - Dibuat konsisten di semua HP */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.title}>Lupa Password</Text>
              <View style={styles.placeholder} />
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
              <View style={styles.messageSection}>
                <Text style={styles.messageTitle}>Reset Password</Text>
                <Text style={styles.messageText}>
                  Masukkan email Anda untuk menerima kode verifikasi reset
                  password.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errorMessage ? styles.inputError : null,
                  ]}
                >
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
                      setErrorMessage("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
              </View>
            </View>

            {/* FOOTER BUTTON - Menyesuaikan insets.bottom agar tidak tertutup tombol kembali HP */}
            <View style={[styles.buttonFooter]}>
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendEmail}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Selanjutnya</Text>
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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  messageSection: {
    marginBottom: 32,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    color: "#636366",
    lineHeight: 22,
  },
  inputGroup: {
    width: "100%",
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
  errorText: {
    fontSize: 13,
    color: "#FF3B30",
    marginTop: 8,
  },
  buttonFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: Platform.OS === "ios" ? 15 : 10,

    // Padding bottom akan diatur inline di komponen menggunakan insets
    backgroundColor: "#ffffff", // Ubah ke putih agar menyatu dengan background
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  sendButton: {
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
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ForgotPasswordEmailScreen;

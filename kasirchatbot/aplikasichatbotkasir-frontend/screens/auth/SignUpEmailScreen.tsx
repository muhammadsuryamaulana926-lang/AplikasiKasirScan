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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_CONFIG } from "../../config/api-config";
import { RootStackParamList } from "../../types/navigation";

type SignUpEmailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SignUp">;
};

const SignUpEmailScreen: React.FC<SignUpEmailScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
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
        `${API_CONFIG.BACKEND_URL}/api/auth/register/send-code`,
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
      navigation.navigate("VerificationCode", {
        email,
        type: "signup",
      });
    } catch (error) {
      setErrorMessage("Koneksi gagal. Mohon periksa internet Anda.");
      setIsLoading(false);
    }
  };

  return (
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
              <Text style={styles.title}>Daftar</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Content Section */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errorMessage !== "" && styles.inputError,
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

              <View style={styles.accountContainer}>
                <Text style={styles.accountText}>Sudah punya akun?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  disabled={isLoading}
                >
                  <Text style={styles.loginText}>Masuk</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer Button - Aman dari Nav Bar HP */}
            <View style={[styles.buttonFooter]}>
              <TouchableOpacity
                style={[styles.addButton, isLoading && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonText}>Selanjutnya</Text>
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
    paddingTop: 15,
    flexGrow: 1,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
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
  accountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  accountText: {
    fontSize: 15,
    color: "#8E8E93",
    marginRight: 4,
  },
  loginText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
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
  addButton: {
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
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default SignUpEmailScreen;

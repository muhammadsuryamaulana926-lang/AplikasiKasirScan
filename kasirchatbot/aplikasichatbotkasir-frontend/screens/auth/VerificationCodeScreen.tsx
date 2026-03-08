import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

type VerificationCodeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "VerificationCode">;
  route: any;
};

const VerificationCodeScreen: React.FC<VerificationCodeScreenProps> = ({
  navigation,
  route,
}) => {
  const { email, type } = route.params;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [errorMessage, setErrorMessage] = useState("");
  const inputs = useRef<Array<TextInput | null>>([]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Handle paste - jika text lebih dari 1 karakter
    if (text.length > 1) {
      const pastedCode = text.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (i < 6) {
          newCode[i] = char;
        }
      });
      setCode(newCode);
      setErrorMessage("");
      // Focus ke input terakhir yang diisi atau input ke-6
      const lastIndex = Math.min(pastedCode.length - 1, 5);
      inputs.current[lastIndex]?.focus();
      return;
    }

    // Handle input normal - hanya angka
    if (text && !/^\d$/.test(text)) return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setErrorMessage("");

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    Keyboard.dismiss();
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      setErrorMessage("Kode harus 6 digit");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint =
        type === "signup"
          ? "/api/auth/register/verify-code"
          : "/api/auth/forgot-password/verify-code";

      const response = await fetch(`${API_CONFIG.BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const data = await response.json();

      if (data.success) {
        if (type === "signup") {
          navigation.navigate("SignUpPassword", { email, code: enteredCode });
        } else {
          navigation.navigate("ResetPassword", { email, code: enteredCode });
        }
      } else {
        setErrorMessage(data.error || "Kode verifikasi tidak valid");
      }
    } catch (error) {
      setErrorMessage("Koneksi internet bermasalah");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const endpoint =
        type === "signup"
          ? "/api/auth/register/send-code"
          : "/api/auth/forgot-password/send-code";

      const response = await fetch(`${API_CONFIG.BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setTimer(300);
        Alert.alert("Berhasil", "Kode baru telah dikirim");
      }
    } catch (error) {
      Alert.alert("Error", "Koneksi gagal");
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
              <Text style={styles.title}>
                {type === "signup" ? "Verifikasi" : "Lupa Password"}
              </Text>
              <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.codeHint}>Masukkan kode OTP</Text>
              <Text style={styles.emailSubHint}>
                Kami telah mengirimkan kode ke {email}
              </Text>

              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit !== "" && styles.codeInputActive,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    textAlign="center"
                    editable={!isLoading}
                  />
                ))}
              </View>

              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>
                    Kirim ulang kode dalam {Math.floor(timer / 60)}:
                    {(timer % 60).toString().padStart(2, "0")}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={resendCode} disabled={isLoading}>
                    <Text style={styles.resendText}>Kirim ulang kode</Text>
                  </TouchableOpacity>
                )}
              </View>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </View>

            {/* Footer Button - Aman dari Navigasi HP */}
            <View style={[styles.buttonFooter]}>
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.buttonDisabled]}
                onPress={verifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Verifikasi</Text>
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
  codeHint: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  emailSubHint: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  codeInputActive: {
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  timerText: { fontSize: 14, color: "#8E8E93" },
  resendText: { fontSize: 14, color: "#007AFF", fontWeight: "600" },
  errorText: {
    fontSize: 13,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 20,
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
  sendButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});

export default VerificationCodeScreen;

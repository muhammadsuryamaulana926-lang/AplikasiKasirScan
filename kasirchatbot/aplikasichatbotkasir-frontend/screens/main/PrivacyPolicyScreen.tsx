import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import {
  Alert,
  BackHandler,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../types/navigation";
import { useTheme } from "../../contexts/ThemeContext";

type PrivacyPolicyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  onClose?: () => void;
};

export default function PrivacyPolicyScreen({
  navigation,
  onClose,
}: PrivacyPolicyScreenProps) {
  const { colors } = useTheme();

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (onClose) {
        onClose();
      } else {
        navigation.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation, onClose]);
  const handleRequestData = () => {
    Alert.alert(
      "Permintaan Data",
      "Untuk mengakses, memperbaiki, atau menghapus data Anda, silakan hubungi kami melalui pengaturan akun atau kirim email ke chatbotaiasistent@gmail.com dengan subjek 'Permintaan Data'",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Kirim Email",
          onPress: () =>
            Linking.openURL(
              "mailto:chatbotaiasistent@gmail.com?subject=Permintaan Data",
            ),
        },
      ],
    );
  };

  const sections = [
    {
      title: "1. Tentang Aplikasi",
      content:
        "AI Assistant adalah aplikasi chatbot yang dirancang untuk mempermudah pengambilan dan akses data dari database internal organisasi. Aplikasi ini menggunakan teknologi AI untuk membantu pengguna mendapatkan informasi dengan cepat melalui percakapan natural.",
    },
    {
      title: "2. Pengumpulan Informasi",
      content:
        "AI Assistant mengumpulkan informasi yang Anda berikan saat mendaftar dan menggunakan aplikasi, termasuk nama, email, dan percakapan dengan AI. Kami juga mengumpulkan data teknis seperti jenis perangkat, versi sistem operasi, dan log penggunaan untuk meningkatkan layanan.",
    },
    {
      title: "3. Data yang Dikumpulkan",
      items: [
        "Informasi akun: nama lengkap, alamat email, dan kata sandi terenkripsi",
        "Riwayat percakapan dengan AI Assistant",
        "Data teknis: model perangkat, versi OS (Android/iOS), log aktivitas",
        "Data penggunaan: fitur yang digunakan, durasi sesi, frekuensi penggunaan",
        "Data autentikasi: token Google Sign-In (jika menggunakan login Google)",
        "Preferensi pengguna: tema aplikasi, pengaturan notifikasi",
      ],
    },
    {
      title: "4. Penggunaan Data",
      content:
        "Data Anda digunakan untuk: (1) Menyediakan layanan chatbot AI yang responsif dan akurat, (2) Personalisasi pengalaman berdasarkan riwayat percakapan, (3) Meningkatkan kualitas respons AI melalui analisis, (4) Menjaga keamanan dan mencegah penyalahgunaan, (5) Mengirim notifikasi penting terkait layanan, (6) Mematuhi kewajiban hukum yang berlaku.",
    },
    {
      title: "5. Akses Database Internal",
      content:
        "Aplikasi ini mengakses database internal organisasi untuk mengambil informasi yang Anda minta melalui chatbot. Data dari database internal hanya digunakan untuk menjawab pertanyaan Anda dan tidak disimpan secara permanen di server aplikasi. Akses database dilindungi dengan autentikasi dan enkripsi untuk menjaga keamanan data organisasi.",
    },
    {
      title: "6. Berbagi Data dengan Pihak Ketiga",
      content:
        "Kami tidak menjual atau menyewakan data pribadi Anda. Data hanya dibagikan dengan: (1) Google Gemini AI - untuk memproses dan menghasilkan respons chatbot, (2) Google Sign-In - untuk autentikasi akun (jika Anda menggunakan login Google), (3) Penyedia hosting server - untuk menyimpan data dengan aman, (4) Pihak berwenang - jika diwajibkan oleh hukum atau proses hukum yang sah.",
    },
    {
      title: "7. Data Percakapan dengan AI",
      content:
        "Semua percakapan Anda dengan AI Assistant disimpan untuk memberikan konteks dan meningkatkan kualitas respons. Percakapan dapat digunakan untuk analisis dan peningkatan model AI dengan menerapkan anonimisasi. Anda memiliki kontrol penuh untuk menghapus riwayat percakapan kapan saja melalui menu pengaturan akun.",
    },
    {
      title: "8. Penyimpanan dan Retensi Data",
      content:
        "Data disimpan di server yang aman dengan enkripsi end-to-end. Riwayat percakapan disimpan selama akun Anda aktif atau maksimal 2 tahun sejak percakapan terakhir. Data akun disimpan selama Anda menggunakan layanan. Setelah penghapusan akun, data akan dihapus permanen dalam 30 hari.",
    },
    {
      title: "9. Keamanan Data",
      content:
        "Kami menerapkan langkah keamanan tingkat industri: enkripsi data saat transit dan penyimpanan, autentikasi multi-faktor, kontrol akses ketat, pemantauan keamanan 24/7, dan audit keamanan berkala. Meskipun demikian, tidak ada sistem yang 100% aman, dan kami mendorong Anda untuk menjaga kerahasiaan kredensial akun.",
    },
    {
      title: "10. Teknologi Pelacakan",
      content:
        "Aplikasi menggunakan teknologi seperti session storage dan local storage untuk mengingat preferensi Anda (tema, pengaturan), menyimpan token autentikasi, dan meningkatkan performa aplikasi. Kami tidak menggunakan cookie pihak ketiga untuk iklan.",
    },
    {
      title: "11. Hak Privasi Anda",
      content:
        "Anda memiliki hak untuk: (1) Mengakses semua data pribadi yang kami simpan, (2) Memperbaiki informasi yang tidak akurat atau tidak lengkap, (3) Menghapus akun dan semua data terkait, (4) Mengekspor riwayat percakapan Anda, (5) Membatasi pemrosesan data tertentu, (6) Menarik persetujuan penggunaan data kapan saja.",
    },
    {
      title: "12. Perlindungan Anak",
      content:
        "AI Assistant tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak secara sengaja mengumpulkan informasi pribadi dari anak-anak. Jika Anda adalah orang tua dan mengetahui anak Anda memberikan data kepada kami, silakan hubungi kami untuk penghapusan segera.",
    },
    {
      title: "13. Perubahan Kebijakan Privasi",
      content:
        "Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan material akan diberitahukan melalui notifikasi dalam aplikasi atau email. Tanggal 'Terakhir diperbarui' di bagian atas akan diubah. Penggunaan aplikasi setelah perubahan berarti Anda menerima kebijakan yang diperbarui.",
    },
    {
      title: "14. Hubungi Kami",
      content:
        "Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait kebijakan privasi ini, silakan hubungi kami melalui: Email: chatbotaiasistent@gmail.com atau melalui menu Pengaturan Akun > Bantuan & Dukungan. Kami akan merespons dalam waktu 7-14 hari kerja.",
    },
  ];

  const dataCategories = [
    { name: "Data Pribadi", icon: "person-outline", color: "#007AFF" },
    { name: "Percakapan AI", icon: "chatbubble-outline", color: "#34C759" },
    { name: "Data Teknis", icon: "hardware-chip-outline", color: "#FF9500" },
    { name: "Penggunaan", icon: "analytics-outline", color: "#5856D6" },
  ];

  const userRights = [
    "Akses data Anda",
    "Perbaiki kesalahan",
    "Hapus data",
    "Ekspor data",
    "Tarik persetujuan",
  ];

  const lastUpdated = "20 Januari 2025";

  const handleEmailPress = () => {
    Linking.openURL("mailto:chatbotaiasistent@gmail.com");
  };

  const renderContentWithEmail = (content: string) => {
    const parts = content.split(/(chatbotaiasistent@gmail\.com)/);
    return (
      <Text style={[styles.sectionContent, { color: colors.text }]}>
        {parts.map((part, index) => 
          part === "chatbotaiasistent@gmail.com" ? (
            <Text
              key={index}
              style={{ color: colors.primary, textDecorationLine: "underline" }}
              onPress={handleEmailPress}
            >
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerPlaceholder} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kebijakan Privasi</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (onClose) {
              onClose();
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 20 : 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View style={[styles.lastUpdatedContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={[styles.lastUpdatedText, { color: colors.primary }]}>
            Terakhir diperbarui: {lastUpdated}
          </Text>
        </View>

        {/* Privacy Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Ringkasan Privasi</Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            Kami menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana
            AI Assistant mengumpulkan, menggunakan, dan melindungi data pribadi
            Anda saat menggunakan layanan chatbot berbasis AI kami.
          </Text>

          <View style={styles.dataCategories}>
            {dataCategories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={category.color}
                  />
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* User Rights */}
        <View style={[styles.rightsContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Text style={[styles.rightsTitle, { color: colors.text }]}>Hak Privasi Anda</Text>
          <View style={styles.rightsGrid}>
            {userRights.map((right, index) => (
              <View key={index} style={styles.rightItem}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={[styles.rightText, { color: colors.text }]}>{right}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Sections */}
        <View style={[styles.contentContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          {sections.map((section, index) => (
            <View key={index} style={styles.privacySection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>

              {section.content ? (
                section.content.includes("chatbotaiasistent@gmail.com") ? (
                  renderContentWithEmail(section.content)
                ) : (
                  <Text style={[styles.sectionContent, { color: colors.text }]}>{section.content}</Text>
                )
              ) : null}

              {section.items ? (
                <View style={styles.itemsList}>
                  {section.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.listItem}>
                      <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {index < sections.length - 1 && (
                <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff", // samakan dengan background app
    // paddingBottom: Platform.OS === "android" ? 24 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000000",
  },
  closeButton: {
    paddingHorizontal: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  lastUpdatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  lastUpdatedText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  dataCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
  },
  rightsContainer: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
  },
  rightsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  rightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  rightItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rightText: {
    fontSize: 14,
    marginLeft: 6,
  },
  contentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 0,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F2F2F7",
    overflow: "hidden",
  },
  privacySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemsList: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    marginTop: 8,
    marginRight: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginVertical: 8,
  },
  controlContainer: {
    alignItems: "center",
    backgroundColor: "#F5F9FF",
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E5F0FF",
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
  },
  controlText: {
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 16,
  },
  dataRequestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 12,
    width: "100%",
  },
  dataRequestText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  controlNote: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    fontStyle: "italic",
  },
  complianceContainer: {
    alignItems: "center",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  complianceTitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
  },
  complianceText: {
    fontSize: 12,
    color: "#C6C6C8",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  footerText: {
    fontSize: 12,
    color: "#C6C6C8",
    marginLeft: 8,
  },
});

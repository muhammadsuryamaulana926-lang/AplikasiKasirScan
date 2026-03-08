import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
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

type TermsConditionsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  onClose?: () => void;
};

export default function TermsConditionsScreen({
  navigation,
  onClose,
}: TermsConditionsScreenProps) {
  const { colors } = useTheme();
  const sections = [
    {
      title: "1. Penerimaan Syarat",
      content:
        "Dengan mengakses dan menggunakan aplikasi AI Assistant, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, harap tidak menggunakan aplikasi ini.",
    },
    {
      title: "2. Tentang Aplikasi",
      content:
        "AI Assistant adalah aplikasi chatbot berbasis AI yang dirancang khusus untuk mempermudah pengambilan dan akses data dari database internal organisasi. Aplikasi ini memungkinkan pengguna untuk mendapatkan informasi dengan cepat melalui percakapan natural tanpa perlu memahami query database yang kompleks.",
    },
    {
      title: "3. Penggunaan Aplikasi",
      content:
        "Aplikasi ini ditujukan untuk penggunaan internal organisasi dalam mengakses data dan informasi. Anda dilarang menggunakan aplikasi untuk tujuan ilegal, merugikan pihak lain, atau mengakses data yang bukan menjadi hak akses Anda. Setiap penyalahgunaan akan ditindak sesuai kebijakan organisasi.",
    },
    {
      title: "4. Akun Pengguna",
      content:
        "Anda bertanggung jawab menjaga kerahasiaan email dan password akun Anda. Segala aktivitas yang terjadi di bawah akun Anda menjadi tanggung jawab Anda sepenuhnya. Segera laporkan jika terjadi penggunaan akun tanpa izin.",
    },
    {
      title: "5. Akses Database Internal",
      content:
        "Aplikasi ini memberikan akses ke database internal organisasi melalui chatbot AI. Anda hanya dapat mengakses data sesuai dengan hak akses yang diberikan kepada Anda. Dilarang keras mencoba mengakses, memodifikasi, atau menghapus data yang bukan menjadi wewenang Anda. Setiap aktivitas akses data akan dicatat untuk keperluan audit.",
    },
    {
      title: "6. Konten dan Respons AI",
      content:
        "Respons yang dihasilkan oleh chatbot AI berdasarkan data dari database internal organisasi. Meskipun kami berusaha memberikan informasi yang akurat, kami tidak menjamin keakuratan 100% dari informasi yang diberikan. Anda bertanggung jawab untuk memverifikasi informasi penting sebelum mengambil keputusan berdasarkan respons AI.",
    },
    {
      title: "7. Riwayat Percakapan",
      content:
        "Semua percakapan Anda dengan chatbot akan disimpan dalam riwayat chat. Anda dapat menghapus riwayat percakapan kapan saja melalui menu sidebar. Data percakapan yang dihapus tidak dapat dikembalikan.",
    },
    {
      title: "8. Privasi dan Data Pribadi",
      content:
        "Kami mengumpulkan dan menyimpan data seperti email, nama, dan riwayat percakapan Anda. Data ini digunakan untuk meningkatkan layanan dan pengalaman pengguna. Data yang diambil dari database internal hanya digunakan untuk menjawab pertanyaan Anda dan tidak disimpan secara permanen. Kami tidak akan membagikan data pribadi atau data organisasi kepada pihak ketiga tanpa persetujuan.",
    },
    {
      title: "9. Pembatasan Konten",
      content:
        "Anda dilarang mengirimkan konten yang mengandung ujaran kebencian, pelecehan, ancaman, pornografi, atau melanggar hukum. Kami berhak menangguhkan atau menonaktifkan akun yang melanggar ketentuan ini.",
    },
    {
      title: "10. Hak Kekayaan Intelektual",
      content:
        "Semua hak kekayaan intelektual dalam aplikasi ini, termasuk desain, logo, dan kode program dilindungi undang-undang. Anda tidak diperbolehkan menyalin, memodifikasi, atau mendistribusikan konten aplikasi tanpa izin tertulis.",
    },
    {
      title: "11. Ketersediaan Layanan",
      content:
        "Kami berusaha menjaga aplikasi tetap tersedia 24/7, namun tidak menjamin layanan akan selalu berjalan tanpa gangguan. Kami berhak melakukan pemeliharaan, pembaruan, atau penangguhan layanan sewaktu-waktu.",
    },
    {
      title: "12. Pembatasan Tanggung Jawab",
      content:
        "Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, atau konsekuensial yang timbul dari penggunaan aplikasi, termasuk kehilangan data, kesalahan informasi, atau gangguan layanan.",
    },
    {
      title: "13. Perubahan Syarat dan Ketentuan",
      content:
        "Kami berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui aplikasi. Penggunaan aplikasi setelah perubahan berarti Anda menyetujui syarat yang telah diperbarui.",
    },
    {
      title: "14. Penghentian Akun",
      content:
        "Kami berhak menangguhkan atau menghapus akun Anda jika ditemukan pelanggaran terhadap Syarat dan Ketentuan ini. Anda juga dapat menghapus akun Anda sendiri melalui menu pengaturan akun.",
    },
    {
      title: "15. Hukum yang Berlaku",
      content:
        "Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Segala sengketa akan diselesaikan melalui musyawarah atau pengadilan yang berwenang di Indonesia.",
    },
    {
      title: "16. Kontak dan Dukungan",
      content:
        "Untuk pertanyaan, keluhan, atau bantuan terkait aplikasi, silakan hubungi tim dukungan kami melalui menu pengaturan akun atau email chatbotaiasistent@gmail.com.",
    },
  ];

  const importantPoints = [
    "Aplikasi ini untuk akses data internal organisasi melalui chatbot AI",
    "Hanya akses data sesuai hak akses yang diberikan kepada Anda",
    "Gunakan chatbot dengan bijak dan bertanggung jawab",
    "Jaga kerahasiaan email dan password akun Anda",
    "Verifikasi informasi penting sebelum mengambil keputusan",
    "Riwayat chat disimpan dan dapat dihapus kapan saja",
  ];

  const lastUpdated = "20 Januari 2025";

  const handleEmailPress = () => {
    Linking.openURL("mailto:chatbotaiasistent@gmail.com");
  };

  const renderContentWithEmail = (content: string) => {
    const parts = content.split(/(chatbotaiasistent@gmail\.com)/);
    return (
      <Text style={[styles.termContent, { color: colors.text }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Syarat & Ketentuan</Text>
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        {/* <View style={styles.lastUpdatedContainer}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text style={styles.lastUpdatedText}>Terakhir diperbarui: {lastUpdated}</Text>
        </View> */}

        {/* Terms Content */}
        <View style={styles.contentContainer}>
          {/* Important Points */}
          <View style={[styles.pointsContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Text style={[styles.pointsTitle, { color: colors.text }]}>Poin Penting:</Text>
            {importantPoints.map((point, index) => (
              <View key={index} style={styles.pointItem}>
                <View style={styles.pointBullet}>
                  <Text style={[styles.pointBulletText, { color: colors.text }]}>•</Text>
                </View>
                <Text style={[styles.pointText, { color: colors.text }]}>{point}</Text>
              </View>
            ))}
          </View>

          {/* Terms Sections */}
          <View style={[styles.termsContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            {sections.map((section, index) => (
              <View key={index} style={styles.termSection}>
                <Text style={[styles.termTitle, { color: colors.text }]}>{section.title}</Text>
                {section.content.includes("chatbotaiasistent@gmail.com") ? (
                  renderContentWithEmail(section.content)
                ) : (
                  <Text style={[styles.termContent, { color: colors.text }]}>{section.content}</Text>
                )}
                {index < sections.length - 1 && (
                  <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
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
    backgroundColor: "#ffffff",
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
    backgroundColor: "#F8F8F8",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 6,
  },
  importantNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  introText: {
    fontSize: 15,
    color: "#000000",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  pointsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5F0FF",
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  pointBullet: {
    marginRight: 8,
    marginTop: 2,
  },
  pointBulletText: {
    fontSize: 16,
    color: "#000000",
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
  },
  termsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F2F2F7",
    marginBottom: 24,
    overflow: "hidden",
  },
  termSection: {
    padding: 16,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  termContent: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
    opacity: 0.8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginVertical: 8,
  },
  agreementContainer: {
    alignItems: "center",
    backgroundColor: "#F0FFF4",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5FFEE",
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
  },
  agreementText: {
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  versionText: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#C6C6C8",
    textAlign: "center",
  },
  spacer: {
    height: Platform.OS === "ios" ? 40 : 100,
  },
});

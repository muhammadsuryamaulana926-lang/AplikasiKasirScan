import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
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

const { width } = Dimensions.get("window");

type QuickActionType = {
  id: string;
  title: string;
  icon: string;
  color: string;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors, theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(1)).current;

  console.log("HomeScreen Theme:", theme, "Text Color:", colors.text);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const quickActions: QuickActionType[] = [
    { id: "1", title: "ChatBot", icon: "chat", color: "#5AC8FA" },
  ];

  const handleQuickAction = (action: QuickActionType) => {
    if (action.id === "1") {
      Animated.parallel([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(buttonOpacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        navigation.navigate("Chat");
        buttonScaleAnim.setValue(1);
        buttonOpacityAnim.setValue(1);
      });
    } else {
      navigation.navigate("Chat", { actionTitle: action.title });
    }
  };

  const renderQuickAction = ({ item }: { item: QuickActionType }) => (
    <TouchableOpacity
      style={styles.quickActionItem}
      onPress={() => handleQuickAction(item)}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.quickActionIcon,
          {
            backgroundColor: item.color,
            transform: [{ scale: item.id === "1" ? buttonScaleAnim : 1 }],
            opacity: item.id === "1" ? buttonOpacityAnim : 1,
          },
        ]}
      >
        <MaterialIcons name={item.icon as any} size={24} color="#FFFFFF" />
      </Animated.View>
      <Animated.Text
        style={[
          styles.quickActionText,
          {
            color: colors.text,
            opacity: item.id === "1" ? buttonOpacityAnim : 1,
          },
        ]}
      >
        {item.title}
      </Animated.Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: colors.headerBackground,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Asisten Chat
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View
              style={[
                styles.profileAvatar,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.welcomeSection]}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                marginBottom: 8,
                lineHeight: 34,
                color: "#FFFFFF",
              }}
            >
              halo saya asisten chatbot
            </Text>
            <Text
              style={{
                fontSize: 17,
                marginBottom: 24,
                fontWeight: "500",
                color: "#0A84FF",
              }}
            >
              Bagaimana saya bisa membantu Anda?
            </Text>

            <View style={styles.quickActionsContainer}>
              <FlatList
                data={quickActions}
                renderItem={renderQuickAction}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                style={styles.quickActionsGrid}
                contentContainerStyle={styles.quickActionsContent}
              />
            </View>
          </View>

          <Animated.View
            style={[
              styles.introSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.introHeader}>
              <MaterialIcons
                name="info-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.introTitle, { color: colors.text }]}>
                Pesan Selamat Datang & Perkenalan
              </Text>
            </View>

            <View
              style={[
                styles.introCard,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <Text style={[styles.introText, { color: colors.text }]}>
                Saya adalah asisten cerdas Anda, siap membantu berbagai tugas
                dan menjawab pertanyaan Anda.
              </Text>

              <Text style={[styles.capabilitiesTitle, { color: colors.text }]}>
                Kemampuan Utama:
              </Text>
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={[styles.capabilityText, { color: colors.text }]}>
                  Menjawab pertanyaan dan memberikan informasi
                </Text>
              </View>
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={[styles.capabilityText, { color: colors.text }]}>
                  Membantu tugas harian dan pengingat
                </Text>
              </View>
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={[styles.capabilityText, { color: colors.text }]}>
                  Memberikan rekomendasi dan saran
                </Text>
              </View>
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={[styles.capabilityText, { color: colors.text }]}>
                  Tersedia 24/7 untuk kenyamanan Anda
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.guideSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.guideHeader}>
              <MaterialIcons name="help-outline" size={24} color="#FF9500" />
              <Text style={[styles.guideTitle, { color: colors.text }]}>
                Cara Menggunakan
              </Text>
            </View>

            <View
              style={[
                styles.guideCard,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    Mulai Percakapan
                  </Text>
                  <Text style={styles.stepDescription}>
                    Ketuk tombol ChatBot di atas untuk memulai
                  </Text>
                </View>
              </View>

              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    Ajukan Pertanyaan
                  </Text>
                  <Text style={styles.stepDescription}>
                    Ketik pesan atau pilih pertanyaan cepat
                  </Text>
                </View>
              </View>

              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    Dapatkan Respons Instan
                  </Text>
                  <Text style={styles.stepDescription}>
                    Terima jawaban yang membantu secara real-time
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: 17,
    marginBottom: 24,
    fontWeight: "500",
  },
  quickActionsContainer: {
    alignItems: "center",
  },
  quickActionsGrid: {
    marginHorizontal: -6,
  },
  quickActionsContent: {
    paddingBottom: 8,
    justifyContent: "center",
  },
  quickActionItem: {
    width: (width - 60) / 3,
    alignItems: "center",
    marginHorizontal: 6,
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  introHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  introCard: {
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    padding: 20,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  capabilitiesTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  capabilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  capabilityText: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  guideSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  guideCard: {
    borderRadius: 16,
    padding: 20,
  },
  guideStep: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
});

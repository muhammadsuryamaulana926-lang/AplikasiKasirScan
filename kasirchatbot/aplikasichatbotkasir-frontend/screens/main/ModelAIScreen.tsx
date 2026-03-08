import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../types/navigation";
import { useTheme } from "../../contexts/ThemeContext";

type ModelAIScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  onClose?: () => void;
};

export default function ModelAIScreen({
  navigation,
  onClose,
}: ModelAIScreenProps) {
  const { colors } = useTheme();
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const aiModels = [
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      description: "Multimodal dengan pemahaman kontekstual",
      detailedDescription:
        "Model Google dengan kemampuan multimodal native (teks, gambar, audio, video). Terintegrasi dengan ecosystem Google dan memiliki pemahaman kontekstual yang kuat untuk percakapan panjang dan tugas multitasking.",
      icon: "globe-outline",
      color: "#007AFF",
      version: "Google",
      features: [
        "Native multimodal",
        "Integrasi Google",
        "32K konteks",
        "Pemahaman kontekstual",
      ],
      bestFor: [
        "Tugas multimodal",
        "Research dengan Google",
        "Percakapan panjang",
        "Multitasking",
      ],
    },
  ];

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const toggleExpand = (modelId: string) => {
    setExpandedModel(expandedModel === modelId ? null : modelId);
  };

  const handleSaveSettings = () => {
    Alert.alert(
      "Pengaturan Disimpan",
      "Pengaturan model AI telah berhasil disimpan",
      [{ text: "OK" }],
    );
  };

  const handleResetDefaults = () => {
    Alert.alert(
      "Reset ke Default",
      "Apakah Anda yakin ingin mengembalikan semua pengaturan ke nilai default?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setSelectedModel("gpt-4");
            setExpandedModel(null);
            Alert.alert("Berhasil", "Pengaturan telah direset ke default");
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerPlaceholder} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Model AI</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (onClose) {
              onClose();
            } else {
              navigation.navigate("AccountSettings");
            }
          }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Pilih Model Section */}
        <View style={styles.section}>
          {aiModels.map((model) => (
            <View key={model.id} style={[styles.modelCard, { borderColor: colors.border }]}>
              <View style={[styles.modelItem, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.modelHeader}>
                  <View
                    style={[styles.modelIcon, { backgroundColor: model.color }]}
                  >
                    <Ionicons
                      name={model.icon as any}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.modelInfo}>
                    <View style={styles.modelNameRow}>
                      <Text style={[styles.modelName, { color: colors.text }]}>{model.name}</Text>
                      <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>{model.version}</Text>
                      </View>
                    </View>
                    <Text style={[styles.modelDescription, { color: colors.textSecondary }]}>
                      {model.description}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Details Always Visible */}
              <View style={[styles.detailsContainer, { backgroundColor: colors.inputBackground }]}>
                <Text style={[styles.detailedDescription, { color: colors.text }]}>
                  {model.detailedDescription}
                </Text>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                  <Text style={[styles.featuresTitle, { color: colors.text }]}>Fitur Utama:</Text>
                  <View style={styles.featuresGrid}>
                    {model.features.map((feature, index) => (
                      <View key={index} style={styles.featureBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#34C759"
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Best For Section */}
                <View style={styles.bestForSection}>
                  <Text style={[styles.bestForTitle, { color: colors.text }]}>Cocok Untuk:</Text>
                  <View style={styles.bestForGrid}>
                    {model.bestFor.map((useCase, index) => (
                      <View key={index} style={styles.useCaseBadge}>
                        <Text style={styles.useCaseText}>{useCase}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Model Stats */}
              </View>
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

// Helper functions for ratings
const getSpeedRating = (modelId: string) => {
  const ratings: Record<string, string> = {
    "gpt-3.5-turbo": "Sangat Cepat ⚡",
    "gpt-4": "Cepat",
    "claude-3": "Sedang",
    "gemini-pro": "Cepat",
    "llama-3": "Sangat Cepat ⚡",
    "deepseek-chat": "Cepat",
  };
  return ratings[modelId] || "Sedang";
};

const getCostRating = (modelId: string) => {
  const ratings: Record<string, string> = {
    "gpt-3.5-turbo": "Rendah 💰",
    "gpt-4": "Tinggi",
    "claude-3": "Sedang-Tinggi",
    "gemini-pro": "Sedang",
    "llama-3": "Rendah 💰",
    "deepseek-chat": "Sangat Rendah 💰💰",
  };
  return ratings[modelId] || "Sedang";
};

const getCreativityRating = (modelId: string) => {
  const ratings: Record<string, string> = {
    "gpt-3.5-turbo": "Baik",
    "gpt-4": "Sangat Baik 🎨",
    "claude-3": "Sangat Baik 🎨",
    "gemini-pro": "Baik",
    "llama-3": "Baik",
    "deepseek-chat": "Cukup",
  };
  return ratings[modelId] || "Baik";
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 24,
  },
  saveButton: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  modelCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#F2F2F7",
  },
  modelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  modelItemSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F2F9FF",
  },
  modelHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modelIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  modelName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginRight: 8,
  },
  versionBadge: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  versionText: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "600",
  },
  modelDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  modelRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expandButton: {
    padding: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  detailedDescription: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  bestForSection: {
    marginBottom: 16,
  },
  bestForTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  bestForGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  useCaseBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  useCaseText: {
    fontSize: 12,
    color: "#1565C0",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: "#666666",
  },
  infoSection: {
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 12,
    marginBottom: 4,
  },
  selectedModel: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoNote: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF950010",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FF9500",
  },
  resetText: {
    fontSize: 17,
    color: "#FF9500",
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsSection: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  spacer: {
    height: 80,
  },
});

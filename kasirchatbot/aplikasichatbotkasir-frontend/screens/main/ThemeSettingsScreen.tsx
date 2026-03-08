import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../types/navigation";
import { useTheme } from "../../contexts/ThemeContext";

type ThemeSettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Chat">;
  onClose?: () => void;
};

export default function ThemeSettingsScreen({
  navigation,
  onClose,
}: ThemeSettingsScreenProps) {
  const { theme, toggleTheme, colors } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const themes = [
    {
      id: "light",
      name: "Terang",
      icon: "sunny-outline",
      color: "#007AFF",
    },
    {
      id: "dark",
      name: "Gelap",
      icon: "moon-outline",
      color: "#5856D6",
    },
  ];

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.headerPlaceholder} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tema Aplikasi</Text>
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
        {/* Theme Options */}
        <View style={styles.section}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                selectedTheme === theme.id && styles.themeCardSelected,
                { backgroundColor: colors.cardBackground, borderColor: selectedTheme === theme.id ? colors.primary : colors.border },
              ]}
              onPress={() => {
                setSelectedTheme(theme.id as "light" | "dark");
                toggleTheme(theme.id as "light" | "dark");
              }}
              activeOpacity={0.7}
            >
              <View style={styles.themeHeader}>
                <View
                  style={[styles.themeIcon, { backgroundColor: theme.color }]}
                >
                  <Ionicons
                    name={theme.icon as any}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: colors.text }]}>{theme.name}</Text>
                </View>
                {selectedTheme === theme.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

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
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  themeCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#F2F2F7",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  themeCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F2F9FF",
  },
  themeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  themeIcon: {
    width: 47,
    height:47,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  themeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  themeNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  themeName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  themeDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  checkmark: {
    marginLeft: 12,
  },
  spacer: {
    height: 40,
  },
});

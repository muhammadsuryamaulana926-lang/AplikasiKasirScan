import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: (newTheme: Theme) => void;
  colors: {
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    userBubble: string;
    botBubble: string;
    userText: string;
    botText: string;
    inputBackground: string;
    headerBackground: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem("appTheme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  };

  const toggleTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem("appTheme", newTheme);
  };

  const colors =
    theme === "dark"
      ? {
          background: "#000000",
          cardBackground: "#1C1C1E",
          text: "#FFFFFF",
          textSecondary: "#8E8E93",
          border: "#38383A",
          primary: "#0A84FF",
          userBubble: "#0A84FF",
          botBubble: "#1C1C1E",
          userText: "#FFFFFF",
          botText: "#FFFFFF",
          inputBackground: "#1C1C1E",
          headerBackground: "#000000",
        }
      : {
          background: "#FFFFFF",
          cardBackground: "#F2F2F7",
          text: "#000000",
          textSecondary: "#8E8E93",
          border: "#F2F2F7",
          primary: "#007AFF",
          userBubble: "#007AFF",
          botBubble: "#eeeeee",
          userText: "#FFFFFF",
          botText: "#000000",
          inputBackground: "#FFFFFF",
          headerBackground: "#FFFFFF",
        };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

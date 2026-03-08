import { NavigationContainer } from "@react-navigation/native";
import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../types/navigation";

// Import screens
import ForgotPasswordEmailScreen from "../screens/auth/ForgotPasswordEmailScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import SignUpEmailScreen from "../screens/auth/SignUpEmailScreen";
import SignUpPasswordScreen from "../screens/auth/SignUpPasswordScreen";
import VerificationCodeScreen from "../screens/auth/VerificationCodeScreen";
import AccountSettingsScreen from "../screens/main/AccountSettingsScreen";
import ChatScreen from "../screens/main/ChatScreen";
import WelcomeScreen from "../screens/main/WelcomeScreen";
import LoadingScreen from "../screens/LoadingScreen";

const Stack = createStackNavigator<RootStackParamList>();

import { API_CONFIG } from "../config/api-config";

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<"Login" | "Chat">("Chat");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Sedikit delay supaya ada efek loading halus
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Langsung arahkan ke halaman Chat tanpa paksa login lagi
        setInitialRoute("Chat");
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpEmailScreen} />
        <Stack.Screen name="SignUpPassword" component={SignUpPasswordScreen} />
        <Stack.Screen
          name="VerificationCode"
          component={VerificationCodeScreen}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordEmailScreen}
        />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={ChatScreen} />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: {
                animation: "timing",
                config: {
                  duration: 400,
                },
              },
              close: {
                animation: "timing",
                config: {
                  duration: 400,
                },
              },
            },
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: {
                animation: "timing",
                config: {
                  duration: 400,
                },
              },
              close: {
                animation: "timing",
                config: {
                  duration: 400,
                },
              },
            },
          }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            transitionSpec: {
              open: {
                animation: "timing",
                config: {
                  duration: 400,
                },
              },
              close: {
                animation: "timing",
                config: {
                  duration: 400,
                },
              },
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

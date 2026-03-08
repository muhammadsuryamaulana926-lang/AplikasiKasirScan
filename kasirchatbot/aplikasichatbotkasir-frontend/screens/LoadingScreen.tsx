import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animasi fade in
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animasi spin loading
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeValue }]}>

        {/* Logo */}
        <Image
          source={require("../assets/images/logo_mm-removebg-preview.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Loading Spinner */}
        <Animated.View
          style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  haloText: {
    fontSize: 32,
    color: "#000000",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 8,
    fontFamily:  "Times New Roman",
  },
  subtitleText: {
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    fontWeight: "500",
    fontFamily:  "Times New Roman",
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
  },
  loadingSpinner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderTopColor: "#000000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

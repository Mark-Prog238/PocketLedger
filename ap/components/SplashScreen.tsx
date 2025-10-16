import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export const SplashScreen = ({ onAnimationComplete }: SplashScreenProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Complete splash after 2.5 seconds
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      className="flex-1 justify-center items-center"
      style={{
        backgroundColor: "#1e1b4b",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Background Pattern */}
      <View className="absolute inset-0">
        <View className="absolute top-20 left-10 w-32 h-32 bg-violet-600/20 rounded-full" />
        <View className="absolute top-40 right-16 w-24 h-24 bg-pink-600/20 rounded-full" />
        <View className="absolute bottom-40 left-16 w-20 h-20 bg-blue-600/20 rounded-full" />
        <View className="absolute bottom-20 right-20 w-28 h-28 bg-green-600/20 rounded-full" />
      </View>

      {/* Main Content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        }}
        className="items-center"
      >
        {/* Logo */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="mb-8"
        >
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="text-white text-4xl font-bold mb-4 text-center"
        >
          PocketLedger
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="text-violet-300 text-lg text-center mb-8 px-8"
        >
          Finance, Simplified
        </Animated.Text>

        {/* Loading Indicator */}
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
          className="flex-row items-center space-x-2"
        >
          <View className="w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
          <View
            className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
          <View
            className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"
            style={{ animationDelay: "400ms" }}
          />
        </Animated.View>
      </Animated.View>

      {/* Version */}
      <Animated.Text
        style={{
          opacity: fadeAnim,
          position: "absolute",
          bottom: 40,
        }}
        className="text-gray-400 text-sm"
      >
        Version 1.0.0
      </Animated.Text>
    </View>
  );
};

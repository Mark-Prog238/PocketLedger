import "./global.css";

import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { HomeScreen } from "./components/HomeScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AppContent() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#1e1b4b",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("./assets/logo.png")}
          style={{ width: 80, height: 80, marginBottom: 24 }}
          resizeMode="contain"
        />
        <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <HomeScreen />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#1e1b4b" }}
    >
      <StatusBar style="light" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Ambient background glows */}
        <View
          style={{
            position: "absolute",
            top: -80,
            left: -60,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: "rgba(99,102,241,0.18)",
            shadowColor: "#6366f1",
            shadowOpacity: 0.6,
            shadowRadius: 60,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -60,
            right: -70,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: "rgba(147,51,234,0.16)",
            shadowColor: "#9333ea",
            shadowOpacity: 0.5,
            shadowRadius: 70,
            shadowOffset: { width: 0, height: 0 },
          }}
        />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 28,
          }}
        >
          {/* Header - Pocket Ledger Branding */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <Image
              source={require("./assets/logo.png")}
              style={{ width: 210, height: 77, marginBottom: 12 }}
              resizeMode="cover"
            />
            <Text className="font-bold text-white text-2xl flex items-center justify-center tracking-wide ">
              FINANCE, SIMPLIFIED.
            </Text>
          </View>

          {/* Form */}
          <View style={{ alignSelf: "center", width: "90%", maxWidth: 380 }}>
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

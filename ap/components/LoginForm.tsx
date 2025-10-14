import React, { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { validInputs } from "components/validInputs";
import CustumInput from "components/CustumInputs";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { GlassCard, InputCard, CustomButton } from "./GlassCard";
import { useAuth } from "contexts/AuthContext";
import { PasswordResetForm } from "./PasswordResetPage";

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { login: authLogin } = useAuth();

  const login = async () => {
    if (!validInputs(email, password)) return;
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Login failed");
      }
      const data = await res.json();
      const token: string = data.token;
      const userOverride = data.user
        ? { id: data.user.id, name: data.user.name, email: data.user.email }
        : undefined;
      await authLogin(token, userOverride);
    } catch (err: any) {
      Alert.alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  if (showReset) {
    return <PasswordResetForm onBack={() => setShowReset(false)} />; // 2️⃣
  }
  return (
    <GlassCard>
      {/* Form Header */}
      <Text style={styles.title}>LOGIN</Text>

      {/* Email Input */}
      <InputCard>
        <CustumInput
          label="Your Mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </InputCard>

      {/* Password Input */}
      <InputCard>
        <CustumInput
          label="Your Password"
          value={password}
          onChangeText={setPassword}
          keyboardType="default"
          secureTextEntry
          autoComplete="current-password"
        />
      </InputCard>

      {/* Login Button */}
      <CustomButton onPress={login} disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? "Signing In..." : "LOGIN"}
        </Text>
      </CustomButton>

      {/* Footer Links */}
      <View className="pt-5" style={styles.footerContainer}>
        <Pressable onPress={onToggleMode}>
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.linkText}>Sign up</Text>
          </Text>
        </Pressable>

        <Pressable onPress={() => setShowReset(true)}>
          <Text style={styles.footerText}>Forgot your password?</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

export const styles = StyleSheet.create({
  title: {
    fontFamily: "Inter_700Bold",
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerContainer: {
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: "#d1d5db",
    textAlign: "center",
    fontSize: 12,
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});

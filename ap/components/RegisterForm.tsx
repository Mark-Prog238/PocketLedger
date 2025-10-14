import React, { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  validRegistrationPassword,
  validMail,
} from "../components/validInputs";
import CustumInput from "./CustumInputs";
import { GlassCard, InputCard, CustomButton } from "./GlassCard";
interface RegisterFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!validMail || !validRegistrationPassword) {
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.REGISTER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      Alert.alert("Success", "Registration successful! Please sign in.");
      onToggleMode(); // Switch to login form
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      {/* Form Header */}
      <Text style={styles.title}>SIGN UP</Text>

      {/* Full Name Input */}
      <InputCard>
        <CustumInput
          label="Your Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </InputCard>

      {/* Email Input */}
      <InputCard>
        <CustumInput
          label="Your Email"
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
          secureTextEntry
          autoComplete="new-password"
        />
      </InputCard>

      {/* Confirm Password Input */}
      <InputCard>
        <CustumInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
        />
      </InputCard>

      {/* Sign Up Button */}
      <CustomButton onPress={handleRegister} disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Text>
      </CustomButton>

      {/* Footer Links */}
      <View className="pt-5" style={styles.footerContainer}>
        <Pressable onPress={onToggleMode}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.linkText}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerContainer: {
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    color: "#d1d5db",
    textAlign: "center",
    fontSize: 14,
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
  },
});

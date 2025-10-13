import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import CustumInput from 'components/InputField'
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { GlassCard, InputCard, CustomButton } from './GlassCard';
import {styles} from '../components/LoginForm'



type ResetProps = { onBack: () => void };

export function PasswordResetForm({ onBack }: ResetProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Please enter your email');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.RESET_REQUEST), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Request failed');
      Alert.alert('Check your inbox for the reset link.');
      onBack(); // return to login after success
    } catch (err: any) {
      Alert.alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <Text style={styles.title}>Reset Password</Text>

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

      <CustomButton onPress={requestReset} disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Text>
      </CustomButton>

      <Pressable onPress={onBack} className="mt-4">
        <Text style={styles.footerText}>← Back to login</Text>
      </Pressable>
    </GlassCard>
  );
}
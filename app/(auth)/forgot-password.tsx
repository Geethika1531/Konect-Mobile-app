import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent. Check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-8 bg-[var(--bg-primary)]">
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-[var(--text-primary)] mb-2 tracking-tight text-center">Reset Password</Text>
        <Text className="text-lg text-[var(--text-secondary)] text-center px-4">Enter your email and we'll send you a link to reset your password.</Text>
      </View>

      <View className="mb-8 flex gap-4">
        <TextInput
          className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity 
        onPress={handleReset}
        disabled={loading}
        className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md mb-4"
        style={{ backgroundColor: 'var(--accent-solid)' }}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white text-lg font-bold">Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text className="text-[var(--accent-solid)] font-bold">Back to Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

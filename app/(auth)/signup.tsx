import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useThemeStore } from '../stores/themeStore';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useThemeStore();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Save initial user doc
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        themePreference: theme,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false
      });

      router.replace('/(onboarding)/step-1');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-8 bg-[var(--bg-primary)]">
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Create Account</Text>
        <Text className="text-lg text-[var(--text-secondary)] text-center px-4">Join Konect and find your community today.</Text>
      </View>

      <View className="space-y-4 mb-8 flex gap-4">
        <TextInput
          className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
          placeholder="First Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity 
        onPress={handleSignup}
        disabled={loading}
        className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md mb-4"
        style={{ backgroundColor: 'var(--accent-solid)' }}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white text-lg font-bold">Sign Up</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-[var(--text-secondary)] mr-2">Already have an account?</Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text className="text-[var(--accent-solid)] font-bold">Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

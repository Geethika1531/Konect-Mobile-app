import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useThemeStore } from '../stores/themeStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setTheme } = useThemeStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.themePreference) {
          setTheme(userData.themePreference);
        }
        // Assuming onboarded flag, but for now we route to home
        router.replace('/(app)/(tabs)/discover');
      } else {
        router.replace('/(onboarding)/step-1');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-8">
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Welcome Back</Text>
        <Text className="text-lg text-[var(--text-secondary)] text-center px-4">Log in to continue your journey on Konect.</Text>
      </View>

      <View className="space-y-4 mb-8 flex gap-4">
        <TextInput
          className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 pb-3 pt-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
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
        
        <View className="items-end mt-2">
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text className="text-[var(--accent-solid)] font-semibold">Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleLogin}
        disabled={loading}
        className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md pb-4 pt-4 mb-4"
        style={{ backgroundColor: 'var(--accent-solid)' }}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white text-lg font-bold">Log In</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-[var(--text-secondary)] mr-2">New to Konect?</Text>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text className="text-[var(--accent-solid)] font-bold">Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

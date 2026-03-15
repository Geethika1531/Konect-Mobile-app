import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { useThemeStore } from '../../../stores/themeStore';

export default function CreateCircleScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [eligible, setEligible] = useState<boolean | null>(null);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
      // Feature Flag / Mock Check:
      // Real app checks 'meetups' collection for >= 2 verified meetings.
      // For MVP, we will assume anyone can create a circle to demonstrate functionality.
      setEligible(true);
  };

  const submitCircle = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please provide a name for your circle.');
      return;
    }
    if (!currentUserId || !eligible) return;

    setLoading(true);
    try {
      const circleData = {
        name,
        description,
        createdBy: currentUserId,
        createdAt: Timestamp.now(),
        members: [currentUserId],
        admins: [currentUserId],
        meetupHistory: []
      };

      const docRef = await addDoc(collection(db, 'circles'), circleData);
      
      Alert.alert('Success', 'Circle created!', [
          { text: 'OK', onPress: () => router.replace(`/(app)/circles/${docRef.id}` as any) }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (eligible === null) {
      return (
         <View className="flex-1 bg-[var(--bg-primary)] justify-center items-center">
            <ActivityIndicator size="large" color="var(--accent-solid)" />
         </View>
      );
  }

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <View className="flex-row items-center p-4 border-b border-[var(--border-light)] bg-[var(--card-bg)] pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 px-2">
          <Text className="text-2xl text-[var(--accent-solid)]">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[var(--text-primary)]">Create Circle</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-bold text-[var(--text-primary)] mb-2">Start a Circle</Text>
        <Text className="text-base text-[var(--text-secondary)] mb-8">
            Gather people you've met. A circle represents a persistent group chat and calendar.
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Circle Name</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-lg font-bold"
            placeholder="e.g. Sunday Hikers"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </View>

        <View className="mb-10">
          <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Description (Optional)</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base h-24"
            placeholder="What's this circle about?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical='top'
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity 
          onPress={submitCircle}
          disabled={loading}
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md bg-[var(--accent-solid)]"
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white text-lg font-bold tracking-wider">Create Circle</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import { useOnboardingStore } from '../stores/onboardingStore';
import { Pill } from '../components/Pill';

const SHOW_ME_OPTIONS = ['Women', 'Men', 'Non-binary', 'Everyone'];

export default function Step3Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  
  const [showMe, setShowMe] = useState<string[]>(data.showMe || []);
  const [distance, setDistance] = useState(data.distance || 10);
  const [incognitoMode, setIncognitoMode] = useState(data.incognitoMode || false);
  const [photoBlur, setPhotoBlur] = useState(data.photoBlur || false);
  const [disappearingMode, setDisappearingMode] = useState(data.disappearingMode || false);
  
  const [loading, setLoading] = useState(false);

  const toggleSelection = (item: string) => {
    if (item === 'Everyone') {
      setShowMe(['Everyone']);
      return;
    }
    
    let newList = showMe.filter(i => i !== 'Everyone');
    if (newList.includes(item)) {
      newList = newList.filter(i => i !== item);
    } else {
      newList = [...newList, item];
    }
    setShowMe(newList);
  };

  const uploadFile = async (uri: string, path: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (e) {
      console.error("Upload error:", e);
      throw e;
    }
  };

  const handleComplete = async () => {
    if (showMe.length === 0) {
      Alert.alert('Missing Info', 'Please select who you want to see.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Media
      const uploadedPhotos: string[] = [];
      for (let i = 0; i < data.photos.length; i++) {
        const url = await uploadFile(data.photos[i], `users/${user.uid}/photos/photo_${i}.jpg`);
        uploadedPhotos.push(url);
      }

      let uploadedVoiceNote = '';
      if (data.voiceNote) {
        uploadedVoiceNote = await uploadFile(data.voiceNote, `users/${user.uid}/voiceNote.m4a`);
      }

      // 2. Prepare final data document
      const currentMood = "👋 Just exploring"; 
      const finalData = {
        ...data,
        showMe,
        distance,
        incognitoMode,
        photoBlur,
        disappearingMode,
        photos: uploadedPhotos,
        voiceNote: uploadedVoiceNote,
        onboardingCompleted: true,
        currentMood,
        phoneNumber: data.phoneNumber || '',
        phoneVerified: !!data.phoneNumber,
        trustFlowersReceived: 0,
        trustFlowersGiven: 0,
        badges: [],
        meetupCount: 0,
        meetupHistory: [],
        subscription: {
          tier: 'free',
          meetupsBeforePaywall: 5
        },
        deviceTokens: []
      };

      // 3. Update Firestore
      await updateDoc(doc(db, 'users', user.uid), finalData);

      // 4. Navigate to App Home
      router.replace('/(app)/(tabs)/discover');
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'There was an issue saving your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView className="flex-1 px-6 pt-24 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-[var(--text-primary)] mb-2">Preferences</Text>
        <Text className="text-base text-[var(--text-secondary)] mb-8">Set your discovery preferences and safety guards.</Text>

        {/* Show Me */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-3">Show Me</Text>
          <View className="flex-row flex-wrap">
            {SHOW_ME_OPTIONS.map(opt => (
              <Pill 
                key={opt}
                label={opt}
                selected={showMe.includes(opt)}
                onPress={() => toggleSelection(opt)}
              />
            ))}
          </View>
        </View>

        {/* Distance Range */}
        <View className="mb-8 p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-sm">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base font-bold text-[var(--text-primary)]">Maximum Distance</Text>
            <Text className="text-base font-bold text-[var(--accent-solid)]">{distance} mi</Text>
          </View>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={distance}
            onValueChange={setDistance}
            minimumTrackTintColor="var(--accent-solid)"
            maximumTrackTintColor="var(--border-light)"
            thumbTintColor="var(--accent-solid)"
          />
        </View>

        {/* Safety Toggles */}
        <View className="mb-8 p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-sm">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-4">Safety & Privacy</Text>
          
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-base font-bold text-[var(--text-primary)]">Incognito Mode</Text>
              <Text className="text-xs text-[var(--text-secondary)]">Only be visible to people you have liked.</Text>
            </View>
            <Switch
              value={incognitoMode}
              onValueChange={setIncognitoMode}
              trackColor={{ false: '#E8E8E8', true: '#var(--accent-solid)' }}
              thumbColor={incognitoMode ? '#FFF' : '#FFF'}
            />
          </View>

          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-base font-bold text-[var(--text-primary)]">Photo Blur</Text>
              <Text className="text-xs text-[var(--text-secondary)]">Blur your photos initially. Unblur them per match.</Text>
            </View>
            <Switch
              value={photoBlur}
              onValueChange={setPhotoBlur}
              trackColor={{ false: '#E8E8E8', true: '#var(--accent-solid)' }}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-base font-bold text-[var(--text-primary)]">Disappearing Mode</Text>
              <Text className="text-xs text-[var(--text-secondary)]">Messages disappear 24h after being read.</Text>
            </View>
            <Switch
              value={disappearingMode}
              onValueChange={setDisappearingMode}
              trackColor={{ false: '#E8E8E8', true: '#var(--accent-solid)' }}
            />
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <View className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-light)]">
        <TouchableOpacity 
          onPress={handleComplete}
          disabled={loading}
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md pb-4 pt-4"
          style={{ backgroundColor: 'var(--accent-solid)' }}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white text-lg font-bold">Complete Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

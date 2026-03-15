import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function Step2Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [voiceNote, setVoiceNote] = useState<string | null>(data.voiceNote || null);
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can only select up to 6 photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);

      // Max 15 seconds enforcement
      setTimeout(() => {
        if (isRecording) {
            stopRecording(recording);
        }
      }, 15000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async (activeRecording = recording) => {
    if (!activeRecording) return;
    setIsRecording(false);
    await activeRecording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = activeRecording.getURI();
    setVoiceNote(uri);
    setRecording(null);
  };

  const playSound = async () => {
    if (!voiceNote) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: voiceNote });
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error('Playback error', err);
    }
  };

  const handleNext = () => {
    if (photos.length === 0) {
      Alert.alert('Missing Photo', 'Please upload at least one photo.');
      return;
    }
    
    if (!voiceNote) {
      Alert.alert('Missing Voice Note', 'Please record a short voice intro.');
      return;
    }

    updateData({ photos, voiceNote });
    router.push('/(onboarding)/step-3');
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView className="flex-1 px-6 pt-24 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-[var(--text-primary)] mb-2">Show us you</Text>
        <Text className="text-base text-[var(--text-secondary)] mb-8">Add photos and your voice to bring your profile to life.</Text>

        {/* Photos Section */}
        <View className="mb-10">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-1">Photos (Up to 6)</Text>
          <Text className="text-xs text-[var(--text-secondary)] mb-4">First photo is your main profile picture.</Text>
          
          <View className="flex-row flex-wrap gap-2">
            {photos.map((uri, index) => (
              <View key={index} className="relative w-[30%] aspect-square rounded-2xl overflow-hidden bg-gray-200">
                <Image source={{ uri }} className="w-full h-full" />
                <TouchableOpacity 
                  onPress={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center"
                >
                  <Text className="text-white text-xs">X</Text>
                </TouchableOpacity>
                {index === 0 && (
                  <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
                    <Text className="text-white text-[10px] text-center font-bold">Main</Text>
                  </View>
                )}
              </View>
            ))}
            
            {photos.length < 6 && (
              <TouchableOpacity 
                onPress={pickImage}
                className="w-[30%] aspect-square rounded-2xl border-2 border-dashed border-[var(--border-light)] items-center justify-center bg-[var(--card-bg)]"
              >
                <Text className="text-3xl text-[var(--text-secondary)]">+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Voice Note Section */}
        <View className="mb-10">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-1">Voice Intro</Text>
          <Text className="text-xs text-[var(--text-secondary)] mb-4">Record a short 15-second intro.</Text>

          <View className="p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] items-center shadow-sm">
            {voiceNote && !isRecording ? (
              <View className="items-center w-full">
                <View className="flex-row items-center w-full bg-[var(--bg-primary)] p-4 rounded-xl mb-4">
                  <TouchableOpacity 
                    onPress={playSound}
                    disabled={isPlaying}
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-solid)' }}
                  >
                    <Text className="text-white font-bold">{isPlaying ? '...' : '▶'}</Text>
                  </TouchableOpacity>
                  <View className="flex-1 ml-4 h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                    <View className="h-full bg-[var(--accent-solid)]" style={{ width: isPlaying ? '100%' : '0%' }} />
                  </View>
                </View>
                <TouchableOpacity onPress={() => setVoiceNote(null)}>
                  <Text className="text-red-500 font-semibold">Delete & Rerecord</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={isRecording ? () => stopRecording() : startRecording}
                className={`w-20 h-20 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : ''}`}
                style={!isRecording ? { backgroundColor: 'var(--accent-solid)' } : {}}
              >
                <Text className="text-white text-3xl">{isRecording ? '⏹' : '🎤'}</Text>
              </TouchableOpacity>
            )}
            {isRecording && <Text className="mt-4 text-red-500 font-bold animate-pulse">Recording... (Max 15s)</Text>}
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <View className="p-6 bg-[var(--bg-primary)] border-t border-[var(--border-light)]">
        <TouchableOpacity 
          onPress={handleNext}
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md pb-4 pt-4"
          style={{ backgroundColor: 'var(--accent-solid)' }}
        >
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

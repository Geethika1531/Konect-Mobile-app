import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection, GeoPoint, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db, storage } from '../../lib/firebase';
import { Pill } from '../../components/Pill';

const CATEGORIES = ["coffee", "sports", "study", "games", "food", "arts", "other"];

export default function CreateEventScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('coffee');
  const [date, setDate] = useState(new Date(Date.now() + 3600000 * 24)); // Tomorrow default
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [maxAttendees, setMaxAttendees] = useState(5);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitEvent = async () => {
    if (!title || !locationName) {
      Alert.alert('Missing Fields', 'Title and Location are required.');
      return;
    }

    if (date.getTime() < Date.now() + 1800000) { // 30 mins from now min
        Alert.alert('Invalid Date', 'Event must be scheduled at least 30 minutes in the future.');
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      let imageUrl = '';
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const filename = `event_covers/${Date.now()}_${user.uid}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);

      const eventData = {
        title,
        description,
        category,
        location: {
            name: locationName,
            coordinates: new GeoPoint(12.9716, 77.5946) // Mocking Bangalore as MVP default
        },
        dateTime: Timestamp.fromDate(date),
        maxAttendees,
        attendees: [user.uid],
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        status: 'open',
        imageUrl: imageUrl || null,
        tags
      };

      await addDoc(collection(db, 'events'), eventData);
      
      Alert.alert('Success', 'Event created successfully!', [
          { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <View className="flex-row items-center p-4 border-b border-[var(--border-light)] bg-[var(--card-bg)] pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 px-2">
          <Text className="text-2xl text-[var(--accent-solid)]">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[var(--text-primary)]">Create Micro-Event</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
      
        {/* Cover Image */}
        <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] items-center justify-center mb-6 overflow-hidden">
            {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" style={{resizeMode: 'cover'}} />
            ) : (
                <View className="items-center">
                    <Text className="text-4xl mb-2">📸</Text>
                    <Text className="text-[var(--text-secondary)] font-medium">Add Cover Image (Optional)</Text>
                </View>
            )}
        </TouchableOpacity>

        {/* Title */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Title</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 pb-3 pt-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-lg font-bold"
            placeholder="e.g. Chai at CCD"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        {/* Category */}
        <View className="mb-6">
            <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Category</Text>
            <View className="flex-row flex-wrap">
                {CATEGORIES.map(cat => (
                    <Pill 
                        key={cat}
                        label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                        selected={category === cat}
                        onPress={() => setCategory(cat)}
                    />
                ))}
            </View>
        </View>
        
        {/* Date and Time */}
        <View className="mb-6">
            <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Date & Time</Text>
            <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                className="w-full bg-[var(--card-bg)] px-4 py-4 rounded-2xl border border-[var(--border-light)] shadow-sm flex-row items-center"
            >
                <Text className="text-[var(--text-primary)] text-base font-medium">
                    {date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="datetime"
                    is24Hour={false}
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Location</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
            placeholder="e.g. Current Location / Cafe Name"
            placeholderTextColor="#9CA3AF"
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Max Attendees */}
        <View className="mb-6 flex-row items-center justify-between bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-light)] shadow-sm">
            <Text className="text-base font-bold text-[var(--text-primary)]">Max Attendees</Text>
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => setMaxAttendees(Math.max(2, maxAttendees - 1))} className="w-8 h-8 rounded-full bg-[var(--bg-primary)] items-center justify-center">
                    <Text className="text-xl font-bold text-[var(--text-secondary)]">-</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-[var(--accent-solid)] w-10 text-center">{maxAttendees}</Text>
                <TouchableOpacity onPress={() => setMaxAttendees(Math.min(20, maxAttendees + 1))} className="w-8 h-8 rounded-full bg-[var(--bg-primary)] items-center justify-center">
                    <Text className="text-xl font-bold text-[var(--text-secondary)]">+</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Description</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base h-24"
            placeholder="What's the plan?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical='top'
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Tags */}
        <View className="mb-10">
          <Text className="text-sm font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest opacity-60">Tags (Comma Separated)</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
            placeholder="e.g. coffee, chill, casual"
            placeholderTextColor="#9CA3AF"
            value={tagsInput}
            onChangeText={setTagsInput}
          />
        </View>

        <TouchableOpacity 
          onPress={submitEvent}
          disabled={loading}
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md mb-20"
          style={{ backgroundColor: 'var(--accent-solid)' }}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white text-lg font-bold tracking-wider">Publish Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

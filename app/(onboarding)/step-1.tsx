import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../stores/onboardingStore';
import { Pill } from '../components/Pill';

const GENDER_OPTIONS = ['Woman', 'Man', 'Non-binary', 'Transgender', 'Agender', 'Genderqueer', 'Other'];
const PRONOUN_OPTIONS = ['she/her', 'he/him', 'they/them', 'ze/zir', 'Other'];
const ORIENTATION_OPTIONS = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Queer', 'Asexual', 'Other'];
const INTENT_OPTIONS = ['Dating', 'Friends', 'Networking', 'Not sure yet'];

export default function Step1Screen() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  
  // Local state for step 1
  const [name, setName] = useState(data.name || '');
  const [age, setAge] = useState(data.age || '');
  const [genderIdentity, setGenderIdentity] = useState<string[]>(data.genderIdentity || []);
  const [pronouns, setPronouns] = useState<string[]>(data.pronouns || []);
  const [sexualOrientation, setSexualOrientation] = useState<string[]>(data.sexualOrientation || []);
  const [intent, setIntent] = useState(data.intent || '');
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || '');

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void, maxSelect: number = 3) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      if (list.length < maxSelect) {
        setList([...list, item]);
      } else {
        Alert.alert('Limit Reached', `You can select up to ${maxSelect} options.`);
      }
    }
  };

  const handleNext = () => {
    if (!name || !age || !intent || !phoneNumber || genderIdentity.length === 0 || pronouns.length === 0 || sexualOrientation.length === 0) {
      Alert.alert('Missing Info', 'Please fill out all sections inclusive of your phone number to continue.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      Alert.alert('Age Requirement', 'You must be at least 18 years old to use Konect.');
      return;
    }

    // In a production app, trigger SMS verification here via Firebase Phone Auth.
    // Proceeding straight to storage for MVP requirements.

    updateData({
      name,
      age: ageNum.toString(),
      genderIdentity,
      pronouns,
      sexualOrientation,
      intent,
      phoneNumber
    });

    router.push('/(onboarding)/step-2');
  };

  const renderSection = (
    title: string, 
    options: string[], 
    selected: string | string[], 
    onSelect: (val: string) => void,
    subtitle?: string
  ) => (
    <View className="mb-6">
      <Text className="text-lg font-bold text-[var(--text-primary)] mb-1">{title}</Text>
      {subtitle && <Text className="text-sm text-[var(--text-secondary)] mb-3">{subtitle}</Text>}
      <View className="flex-row flex-wrap">
        {options.map(opt => (
          <Pill 
            key={opt}
            label={opt}
            selected={Array.isArray(selected) ? selected.includes(opt) : selected === opt}
            onPress={() => onSelect(opt)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView className="flex-1 px-6 pt-24 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-[var(--text-primary)] mb-2">Who are you?</Text>
        <Text className="text-base text-[var(--text-secondary)] mb-8">Let's start with the basics.</Text>

        <View className="mb-6">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-2">First Name</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
            placeholder="Your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-2">Age</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
            placeholder="Your age"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            maxLength={3}
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-[var(--text-primary)] mb-2">Phone Number</Text>
          <Text className="text-sm text-[var(--text-secondary)] mb-3">Verification bypassed for MVP review.</Text>
          <TextInput
            className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-3 rounded-2xl border border-[var(--border-light)] shadow-sm text-base"
            placeholder="+91 Your Phone Number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {renderSection(
          'Gender Identity', 
          GENDER_OPTIONS, 
          genderIdentity, 
          (val) => toggleSelection(val, genderIdentity, setGenderIdentity),
          'Select up to 3'
        )}

        {renderSection(
          'Pronouns', 
          PRONOUN_OPTIONS, 
          pronouns, 
          (val) => toggleSelection(val, pronouns, setPronouns),
          'Select up to 3'
        )}

        {renderSection(
          'Sexual Orientation', 
          ORIENTATION_OPTIONS, 
          sexualOrientation, 
          (val) => toggleSelection(val, sexualOrientation, setSexualOrientation),
          'Select up to 3'
        )}

        {renderSection(
          'What are you looking for?', 
          INTENT_OPTIONS, 
          intent, 
          setIntent,
          'Select one'
        )}

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

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface UserCardProps {
  id: string;
  name: string;
  age: string;
  pronouns: string[];
  currentMood: string;
  photoUrl: string;
  distance: string;
  onSayHi: (userId: string, userName: string) => void;
}

export const UserCard = ({ id, name, age, pronouns, currentMood, photoUrl, distance, onSayHi }: UserCardProps) => {
  return (
    <View className="bg-[var(--card-bg)] rounded-3xl mb-6 overflow-hidden border border-[var(--border-light)] shadow-sm">
      <Image source={{ uri: photoUrl || 'https://via.placeholder.com/400' }} className="w-full h-96 bg-gray-200" style={{ resizeMode: 'cover' }} />
      <View className="p-5">
        <View className="flex-row justify-between items-end mb-2">
          <View>
            <Text className="text-2xl font-bold text-[var(--text-primary)]">{name}, {age}</Text>
            {pronouns && pronouns.length > 0 && (
              <Text className="text-sm text-[var(--text-secondary)] font-medium mt-1">{pronouns.join(' • ')}</Text>
            )}
          </View>
          <Text className="text-sm font-bold text-[var(--accent-solid)]">{distance}</Text>
        </View>
        
        {currentMood ? (
          <View className="bg-[var(--bg-primary)] self-start px-4 py-2 rounded-full mb-5 mt-2">
            <Text className="text-[var(--text-primary)] font-medium">{currentMood}</Text>
          </View>
        ) : <View className="mb-4" />}

        <TouchableOpacity 
          onPress={() => onSayHi(id, name)}
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md"
          style={{ backgroundColor: 'var(--accent-solid)' }}
        >
          <Text className="text-white text-lg font-bold text-center">Say Hi 👋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

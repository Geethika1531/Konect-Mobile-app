import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

const MOODS = [
  "👋 Just exploring",
  "💬 Need to talk",
  "☕ Grab a coffee",
  "🎉 Ready to party",
  "🧘‍♀️ Zen mode",
  "🎮 Looking to game"
];

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelect: (mood: string | null) => void;
}

export const MoodSelector = ({ selectedMood, onSelect }: MoodSelectorProps) => {
  return (
    <View className="mb-4 py-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        <TouchableOpacity
          onPress={() => onSelect(null)}
          className={`px-4 py-2 rounded-full border mr-2 ${!selectedMood ? 'border-transparent' : 'bg-[var(--card-bg)] border-[var(--border-light)]'}`}
          style={!selectedMood ? { backgroundColor: 'var(--accent-solid)' } : {}}
        >
          <Text className={!selectedMood ? 'text-white font-bold' : 'text-[var(--text-secondary)]'}>All</Text>
        </TouchableOpacity>
        
        {MOODS.map(mood => (
          <TouchableOpacity
            key={mood}
            onPress={() => onSelect(mood === selectedMood ? null : mood)}
            className={`px-4 py-2 rounded-full border mr-2 ${mood === selectedMood ? 'border-transparent' : 'bg-[var(--card-bg)] border-[var(--border-light)]'}`}
            style={mood === selectedMood ? { backgroundColor: 'var(--accent-solid)' } : {}}
          >
            <Text className={mood === selectedMood ? 'text-white font-bold' : 'text-[var(--text-secondary)]'}>{mood}</Text>
          </TouchableOpacity>
        ))}
        <View className="w-8" />
      </ScrollView>
    </View>
  );
};

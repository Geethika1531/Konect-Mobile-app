import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../../stores/themeStore';

export default function CircleCalendarScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useThemeStore();

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-[var(--text-primary)] mb-6">Calendar</Text>
        
        {/* Placeholder for Calendar MVP */}
        <View className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-light)] shadow-sm mb-6 items-center justify-center py-12">
            <Text className="text-5xl mb-4">📅</Text>
            <Text className="text-[var(--text-primary)] text-xl font-bold text-center mb-2">No Upcoming Meetups</Text>
            <Text className="text-[var(--text-secondary)] text-center text-base">
                Propose a new date to meet up with this circle!
            </Text>
        </View>

        <TouchableOpacity 
          className="w-full py-4 rounded-full flex-row justify-center items-center shadow-md mb-8"
          style={{ backgroundColor: 'var(--accent-solid)' }}
        >
          <Text className="text-white text-lg font-bold tracking-wider">Suggest Meetup Date</Text>
        </TouchableOpacity>

        <Text className="text-xl font-bold text-[var(--text-primary)] mb-4">Past Meetups</Text>
        <View className="items-center justify-center py-6 opacity-60">
             <Text className="text-[var(--text-secondary)] text-center">History will appear here after you meet.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

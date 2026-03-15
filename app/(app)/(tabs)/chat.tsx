import React from 'react';
import { View, Text } from 'react-native';

export default function ChatScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-[var(--bg-primary)]">
      <Text className="text-xl text-[var(--text-primary)] font-bold">Your Chats</Text>
    </View>
  );
}

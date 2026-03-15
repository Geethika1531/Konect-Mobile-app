import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface PillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const Pill = ({ label, selected, onPress }: PillProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border m-1 ${
        selected ? 'border-transparent' : 'border-[var(--border-light)] bg-[var(--card-bg)]'
      }`}
      style={selected ? { backgroundColor: 'var(--accent-solid)' } : {}}
      activeOpacity={0.7}
    >
      <Text className={`${selected ? 'text-white font-bold' : 'text-[var(--text-secondary)]'} text-center`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

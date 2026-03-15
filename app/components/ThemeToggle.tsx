import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Text } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    setTimeout(() => toggleTheme(), 150);
  };

  const icon = theme === 'neutral' ? '🤍' : '🏳️‍🌈';

  return (
    <TouchableOpacity 
      onPress={handleToggle} 
      className="p-2 rounded-full bg-[var(--card-bg)] shadow-sm items-center justify-center border border-[var(--border-light)]"
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text className="text-2xl">{icon}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

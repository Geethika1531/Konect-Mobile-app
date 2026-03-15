import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { themes } from '../theme';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  // Ensure type match for styling
  const themeVariables: Record<string, string> = themes[theme] as Record<string, string>;

  return (
    <View style={[styles.container, themeVariables]} className="bg-[var(--bg-primary)]">
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

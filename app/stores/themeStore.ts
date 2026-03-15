import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemeType = 'neutral' | 'lgbtq';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'neutral',
  setTheme: async (theme) => {
    set({ theme });
    await SecureStore.setItemAsync('theme', theme);
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'neutral' ? 'lgbtq' : 'neutral';
    get().setTheme(newTheme);
  },
  loadTheme: async () => {
    try {
      const saved = await SecureStore.getItemAsync('theme');
      if (saved === 'neutral' || saved === 'lgbtq') {
        set({ theme: saved as ThemeType });
      }
    } catch (e) {
      console.error('Failed to load theme:', e);
    }
  },
}));

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

type Theme = 'light' | 'dark';

interface Colors {
  bg: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  headerBg: string;
  inputBg: string;
  statusBar: 'dark' | 'light';
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  colors: Colors;
}

const lightColors = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  headerBg: '#FFFFFF',
  inputBg: '#F3F4F6',
  statusBar: 'dark' as const,
};

const darkColors = {
  bg: '#000000',
  card: '#1C1C1E',
  cardBorder: '#38383A',
  text: '#F2F2F7',
  textSecondary: '#AEAEB2',
  textMuted: '#636366',
  headerBg: '#1C1C1E',
  inputBg: '#2C2C2E',
  statusBar: 'light' as const,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  colors: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

// Safe AsyncStorage wrapper that won't crash in Expo Go
let AsyncStorageModule: any = null;
async function getAsyncStorage() {
  if (AsyncStorageModule) return AsyncStorageModule;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    AsyncStorageModule = mod.default;
    return AsyncStorageModule;
  } catch {
    return null;
  }
}

export function ThemeProviderCustom({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    getAsyncStorage().then((storage) => {
      if (storage) {
        storage.getItem('app_theme').then((val: string | null) => {
          if (val === 'dark' || val === 'light') setThemeState(val);
        }).catch(() => {});
      }
    });
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    getAsyncStorage().then((storage) => {
      if (storage) storage.setItem('app_theme', t).catch(() => {});
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

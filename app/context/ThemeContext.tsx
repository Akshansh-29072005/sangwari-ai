import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  colors: typeof lightColors;
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

export function ThemeProviderCustom({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then((val) => {
      if (val === 'dark' || val === 'light') setThemeState(val);
    });
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    AsyncStorage.setItem('app_theme', t);
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

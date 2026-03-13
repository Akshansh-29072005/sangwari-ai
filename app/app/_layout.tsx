import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { ThemeProviderCustom, useTheme } from '../context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
  const { isDark, colors } = useTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }}}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="schemes" />
      </Stack>
      <StatusBar style={colors.statusBar} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <InnerLayout />
    </ThemeProviderCustom>
  );
}

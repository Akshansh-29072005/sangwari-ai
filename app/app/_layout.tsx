import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { ThemeProviderCustom, useTheme } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { NotificationService } from '../services/NotificationService';
import { useEffect, useRef } from 'react';
import { NotificationToast, NotificationToastRef } from '../components/ui/NotificationToast';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InnerLayout() {
  const { isDark, colors } = useTheme();
  const toastRef = useRef<NotificationToastRef>(null);

  useEffect(() => {
    NotificationService.setToastRef(toastRef.current);
    NotificationService.init();
    NotificationService.startPolling(30000); // 30 second poll
    return () => {
      NotificationService.stopPolling();
      NotificationService.setToastRef(null);
    };
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="schemes" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <NotificationToast ref={toastRef} />
      <StatusBar style={colors.statusBar} />
    </ThemeProvider>
  );
}


export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <I18nProvider>
        <InnerLayout />
      </I18nProvider>
    </ThemeProviderCustom>
  );
}

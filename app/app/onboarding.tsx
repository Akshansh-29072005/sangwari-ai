import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* App Icon */}
        <Image
          source={require('../assets/images/icon.png')}
          style={{ width: 100, height: 100, borderRadius: 24, marginBottom: 28 }}
        />
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12, textAlign: 'center', letterSpacing: -0.5 }}>
          {t('welcome')}
        </Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 }}>
          {t('welcome_desc')}
        </Text>
      </View>
      <TouchableOpacity
        style={{ backgroundColor: '#2563EB', width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', elevation: 4, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 16 }}
        onPress={() => router.push('/auth')}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 17 }}>{t('get_started')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

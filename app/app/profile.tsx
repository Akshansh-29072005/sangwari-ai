import { View, Text, ScrollView, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText, ChevronRight, Settings, HelpCircle, LogOut, ShieldAlert, Camera } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const { isHindi, toggleLang, t } = useI18n();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      // TODO: Call userRoutes.uploadProfilePic(result.assets[0].uri)
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a profile picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      t('change_photo'),
      '',
      [
        { text: '📷 Camera', onPress: takePhoto },
        { text: '🖼️ Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{t('account_settings')}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile Card with Photo Upload */}
        <View style={{ backgroundColor: colors.card, margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder, marginTop: 24 }}>
          <TouchableOpacity
            style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}
            onPress={handleChangePhoto}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={{ width: 96, height: 96, borderRadius: 48 }} />
            ) : (
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#2563EB', fontSize: 28, fontWeight: '700' }}>AK</Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2563EB', padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.card }}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Amit Kumar</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>+91 98765 43210</Text>
          <TouchableOpacity onPress={handleChangePhoto} style={{ marginTop: 10, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }}>
            <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '600' }}>{t('change_photo')}</Text>
          </TouchableOpacity>
        </View>

        {/* Documents Upload */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('my_documents')}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, lineHeight: 18 }}>{t('doc_desc')}</Text>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={20} color="#2563EB" />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>{t('pan_card')}</Text>
            </View>
            <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: isDark ? '#6EE7B7' : '#065F46', fontSize: 11, fontWeight: '700' }}>{t('uploaded')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder, borderStyle: 'dashed' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Upload size={20} color={colors.textMuted} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.textSecondary }}>{t('driving_license')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, borderStyle: 'dashed' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Upload size={20} color={colors.textMuted} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.textSecondary }}>{t('income_cert')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('preferences')}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Settings size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>{t('dark_mode')}</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#D1D5DB', true: '#2563EB' }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>{t('hindi_lang')}</Text>
            </View>
            <Switch value={isHindi} onValueChange={toggleLang} trackColor={{ false: '#D1D5DB', true: '#2563EB' }} />
          </View>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldAlert size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>{t('change_mpin')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HelpCircle size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>{t('faq_support')}</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={{ marginHorizontal: 16, padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? '#5C1E1E' : '#FECACA', backgroundColor: isDark ? '#3B1010' : '#FEF2F2' }}
          onPress={() => router.replace('/auth')}
        >
          <LogOut size={20} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>{t('logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

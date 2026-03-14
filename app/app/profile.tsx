import { View, Text, ScrollView, TouchableOpacity, Switch, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText, ChevronRight, Settings, HelpCircle, LogOut, ShieldAlert, Camera, MapPin, Briefcase } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const { isHindi, toggleLang, t } = useI18n();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  const fetchProfile = async () => {
    try {
      // Fetching profile from backend API pulling from PostgreSQL
      const { data, error } = await apiFetch('/user/profile');
      if (data?.success && data?.data) {
        setUser(data.data);
      } else {
        console.error('Failed to fetch profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await apiFetch('/user/documents');
      if (data?.success && data?.data) {
        setUserDocs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleDocumentUpload = async (docType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      setLoading(true);

      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' } as any);
      formData.append('type', docType);

      const token = await AsyncStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE_URL}/user/documents/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.success) {
        Alert.alert('✅ Success', `"${asset.name}" uploaded successfully!`);
        fetchDocuments();
      } else {
        Alert.alert('Upload Failed', data.message || 'Something went wrong');
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicToServer = async (localUri: string, filename: string, mimeType: string) => {
    try {
      const formData = new FormData();
      formData.append('file', { uri: localUri, name: filename, type: mimeType } as any);
      const token = await AsyncStorage.getItem('auth_token');
      const resp = await fetch(`${API_BASE_URL}/user/profile-pic`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.success) {
        setProfileImage(localUri); // Show immediately locally
        // Refresh user profile to get updated URL
        fetchProfile();
      } else {
        Alert.alert('Upload Failed', data.message || 'Could not save profile picture');
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message);
    }
  };

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
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || 'profile.jpg';
      await uploadProfilePicToServer(asset.uri, filename, 'image/jpeg');
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
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() || 'profile.jpg';
      await uploadProfilePicToServer(asset.uri, filename, 'image/jpeg');
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
            {profileImage || user?.profile_pic_url ? (
              <Image
                source={{ uri: profileImage || (user?.profile_pic_url ? `${API_BASE_URL}${user.profile_pic_url}` : undefined) }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#2563EB', fontSize: 28, fontWeight: '700' }}>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AK'}
                </Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2563EB', padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.card }}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
            {loading ? 'Loading...' : user?.name || 'Unknown User'}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
            {user?.phone || ''}
          </Text>
          <TouchableOpacity onPress={handleChangePhoto} style={{ marginTop: 10, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }}>
            <Text style={{ color: '#2563EB', fontSize: 12, fontWeight: '600' }}>{t('change_photo')}</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Citizen Data Overview (From dataset) */}
        {!loading && user && (
          <View style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Citizen Profile</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MapPin size={20} color={colors.textSecondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Address & District</Text>
                <Text style={{ fontWeight: '500', color: colors.text, marginTop: 2 }}>{user.address}, {user.village_or_city}, {user.district}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Briefcase size={20} color={colors.textSecondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Occupation</Text>
                <Text style={{ fontWeight: '500', color: colors.text, marginTop: 2 }}>{user.occupation}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <FileText size={20} color={colors.textSecondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Annual Income</Text>
                <Text style={{ fontWeight: '500', color: colors.text, marginTop: 2 }}>₹{user.annual_income}</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldAlert size={20} color={colors.textSecondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>Aadhaar Info</Text>
                <Text style={{ fontWeight: '500', color: colors.text, marginTop: 2 }}>DOB: {user.dob} | Age: {user.age} | {user.gender}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Documents Upload */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('my_documents')}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, lineHeight: 18 }}>{t('doc_desc')}</Text>

          {[
            { id: 'pan_card', label: t('pan_card') },
            { id: 'driving_license', label: t('driving_license') },
            { id: 'income_certificate', label: t('income_cert') }
          ].map(docOption => {
            const isUploaded = userDocs.some((d: any) => d.Type === docOption.id);
            return (
              <TouchableOpacity key={docOption.id} onPress={() => !isUploaded && handleDocumentUpload(docOption.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder, borderStyle: isUploaded ? 'solid' : 'dashed' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isUploaded ? <FileText size={20} color="#2563EB" /> : <Upload size={20} color={colors.textMuted} />}
                  <Text style={{ marginLeft: 12, fontWeight: '500', color: isUploaded ? colors.text : colors.textSecondary }}>{docOption.label}</Text>
                </View>
                {isUploaded ? (
                  <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ color: isDark ? '#6EE7B7' : '#065F46', fontSize: 11, fontWeight: '700' }}>{t('uploaded')}</Text>
                  </View>
                ) : (
                  <ChevronRight size={20} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            )
          })}
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

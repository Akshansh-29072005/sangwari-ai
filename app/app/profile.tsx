import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, FileText, ChevronRight, Settings, HelpCircle, LogOut, ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [isHindi, setIsHindi] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Account & Settings</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile Card */}
        <View style={{ backgroundColor: colors.card, margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder, marginTop: 24 }}>
          <TouchableOpacity style={{ width: 96, height: 96, backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
            <Text style={{ color: '#2563EB', fontSize: 28, fontWeight: '700' }}>AK</Text>
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2563EB', padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.card }}>
              <Upload size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Amit Kumar</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>+91 98765 43210</Text>
        </View>

        {/* Documents Upload Section */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>My Documents</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, lineHeight: 18 }}>Upload documents once to auto-fill scheme application forms instantly.</Text>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={20} color="#2563EB" />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>PAN Card</Text>
            </View>
            <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: isDark ? '#6EE7B7' : '#065F46', fontSize: 11, fontWeight: '700' }}>Uploaded</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder, borderStyle: 'dashed' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Upload size={20} color={colors.textMuted} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.textSecondary }}>Driving License</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, borderStyle: 'dashed' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Upload size={20} color={colors.textMuted} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.textSecondary }}>Income Certificate</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={{ backgroundColor: colors.card, marginHorizontal: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Preferences</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Settings size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#D1D5DB', true: '#2563EB' }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>हिंदी Language</Text>
            </View>
            <Switch value={isHindi} onValueChange={setIsHindi} trackColor={{ false: '#D1D5DB', true: '#2563EB' }} />
          </View>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldAlert size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>Change MPIN</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HelpCircle size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: colors.text }}>FAQ & Support</Text>
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
          <Text style={{ color: '#DC2626', fontWeight: '700', marginLeft: 8, fontSize: 15 }}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

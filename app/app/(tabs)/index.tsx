import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mic, FileText, CheckCircle2, Clock, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const registeredSchemes = [
  { id: '1', name: 'Kisan Samman Nidhi', status: 'Active', since: 'Jan 2024' },
  { id: '2', name: 'Ayushman Bharat', status: 'Active', since: 'Mar 2024' },
  { id: '3', name: 'PM Ujjwala Yojana', status: 'Active', since: 'Aug 2023' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [showRegistered, setShowRegistered] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.headerBg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.3, marginLeft: 10 }}>Sangwari AI</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', padding: 8, borderRadius: 999 }}
          onPress={() => router.push('/profile')}
        >
          <User size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Content — Non-Scrollable */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20, justifyContent: 'space-between' }}>

        {/* Top Section */}
        <View>
          {/* Schemes Summary Grid */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>My Schemes Dashboard</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, flex: 1, marginRight: 8, borderWidth: 1, borderColor: colors.cardBorder, height: 120, justifyContent: 'space-between' }}
              onPress={() => router.push('/schemes')}
            >
              <FileText size={28} color="#2563EB" />
              <View>
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>12</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 2 }}>Eligible Schemes</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, flex: 1, marginLeft: 8, borderWidth: 1, borderColor: colors.cardBorder, height: 120, justifyContent: 'space-between' }}
              onPress={() => setShowRegistered(true)}
            >
              <CheckCircle2 size={28} color="#16A34A" />
              <View>
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>3</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 2 }}>Registered</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Application Status Timeline */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 14 }}>Application Status</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 40, height: 40, backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <CheckCircle2 size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Kisan Samman Nidhi</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Approved • Transfer Pending</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, backgroundColor: isDark ? '#422006' : '#FEF3C7', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Clock size={20} color="#CA8A04" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>PM Awas Yojana</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Document Verification in Progress</Text>
              </View>
            </View>
          </View>

          {/* Grievance Tracking */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 14 }}>Grievance Tracking</Text>
            <View style={{ backgroundColor: isDark ? '#3B1010' : '#FEF2F2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: isDark ? '#5C1E1E' : '#FECACA' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontWeight: '600', color: isDark ? '#FCA5A5' : '#991B1B' }}>#GRV-2024-892</Text>
                <View style={{ backgroundColor: isDark ? '#5C1E1E' : '#FECACA', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FCA5A5' : '#7F1D1D' }}>Escalated: L2</Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>
                <Text style={{ fontWeight: '500' }}>Dept:</Text> Water Resources
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>
                <Text style={{ fontWeight: '500' }}>Officer:</Text> Suresh K.
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
                <Text style={{ fontWeight: '500' }}>Stage:</Text> Field Inspection
              </Text>
              <Text style={{ fontSize: 11, color: isDark ? '#FCA5A5' : '#B91C1C', fontWeight: '600' }}>ETA: 2 Days remaining</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingBottom: 80, marginTop: 16 }}>
          <Text style={{ color: colors.textMuted, fontWeight: '500', fontSize: 13 }}>Sangwari AI v1.0.0</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Developed for Citizens</Text>
        </View>
      </View>

      {/* Floating Complaint & Voice Assistant Section */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.headerBg, borderTopWidth: 1, borderTopColor: colors.cardBorder, padding: 16, paddingBottom: 32, flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextInput
          style={{ flex: 1, backgroundColor: colors.inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, minHeight: 50, maxHeight: 128, color: colors.text, marginRight: 12, fontSize: 15 }}
          placeholder="Ask a question or file a complaint..."
          placeholderTextColor={colors.textMuted}
          multiline
        />
        <TouchableOpacity style={{ backgroundColor: '#2563EB', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#2563EB', shadowOpacity: 0.4, shadowRadius: 8 }}>
          <Mic size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Registered Schemes Modal */}
      <Modal visible={showRegistered} animationType="slide" transparent>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowRegistered(false)}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Registered Schemes</Text>
              <TouchableOpacity onPress={() => setShowRegistered(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={registeredSchemes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 6 }} />
                      <Text style={{ fontSize: 13, color: '#16A34A', fontWeight: '600' }}>{item.status}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>Since {item.since}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

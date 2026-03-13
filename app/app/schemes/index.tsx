import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SchemesListScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  const schemes = [
    { id: '1', name: 'Kisan Samman Nidhi', desc: 'Financial support for farmers', match: '98%' },
    { id: '2', name: 'Mitanin Yojana', desc: 'Health worker support program', match: '85%' },
    { id: '3', name: 'PM Awas Yojana', desc: 'Housing for rural & urban poor', match: '70%' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Eligible Schemes</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Search size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginLeft: 12, fontSize: 15 }}>Search schemes...</Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Recommended for You</Text>

        {schemes.map((s, index) => (
          <TouchableOpacity
            key={index}
            style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: colors.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            onPress={() => router.push(`/schemes/${s.id}`)}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{s.name}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>{s.desc}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#6EE7B7' : '#065F46', marginLeft: 4 }}>Match: {s.match}</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

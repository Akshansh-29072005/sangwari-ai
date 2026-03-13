import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2, UploadCloud, Info, FileText } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SchemeApplicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark, colors } = useTheme();

  const dynamicFormSchema = [
    { field: 'applicant_name', label: 'Full Name', type: 'text', autoFilled: true, value: 'Amit Kumar' },
    { field: 'aadhaar', label: 'Aadhaar Number', type: 'text', autoFilled: false, value: '' },
    { field: 'pan_card', label: 'PAN Card Copy', type: 'document', autoFilled: true, value: 'pan_card_doc.pdf' },
    { field: 'income_cert', label: 'Income Certificate', type: 'document', autoFilled: false, value: '' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Apply for Scheme</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>

        <View style={{ backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF', borderWidth: 1, borderColor: isDark ? '#2563EB' : '#BFDBFE', padding: 16, borderRadius: 12, marginBottom: 20, flexDirection: 'row' }}>
          <Info size={20} color="#2563EB" style={{ marginRight: 12, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: isDark ? '#93C5FD' : '#1E3A8A', marginBottom: 4 }}>Auto-Fill Active</Text>
            <Text style={{ fontSize: 13, color: isDark ? '#BFDBFE' : '#1E40AF', lineHeight: 18 }}>Fields marked in green have been automatically populated from your Profile documents.</Text>
          </View>
        </View>

        {dynamicFormSchema.map((item, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 4 }}>{item.label}</Text>
              {item.autoFilled && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                  <CheckCircle2 size={12} color="#16A34A" />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#6EE7B7' : '#065F46', marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Auto-Filled</Text>
                </View>
              )}
            </View>

            {item.type === 'text' && (
              <TextInput
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: item.autoFilled ? (isDark ? '#065F46' : '#86EFAC') : colors.cardBorder,
                  color: item.autoFilled ? colors.textSecondary : colors.text,
                  fontSize: 15,
                }}
                value={item.value}
                editable={!item.autoFilled}
                placeholder={`Enter ${item.label}`}
                placeholderTextColor={colors.textMuted}
              />
            )}

            {item.type === 'document' && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  backgroundColor: item.autoFilled ? (isDark ? '#064E3B' : '#F0FDF4') : colors.card,
                  borderColor: item.autoFilled ? (isDark ? '#065F46' : '#86EFAC') : colors.cardBorder,
                }}
              >
                {item.autoFilled ? (
                  <>
                    <FileText size={20} color="#16A34A" />
                    <Text style={{ marginLeft: 8, fontWeight: '500', color: isDark ? '#6EE7B7' : '#065F46' }}>{item.value}</Text>
                  </>
                ) : (
                  <>
                    <UploadCloud size={20} color={colors.textMuted} />
                    <Text style={{ marginLeft: 8, fontWeight: '500', color: colors.textSecondary }}>Upload Document</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={{ backgroundColor: '#2563EB', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, marginTop: 8 }}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 17 }}>Submit Application</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

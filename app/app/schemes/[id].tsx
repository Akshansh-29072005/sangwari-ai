import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2, UploadCloud, Info, FileText, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch } from '../../api/api';
import { NotificationService } from '../../services/NotificationService';
import { useState, useEffect } from 'react';

export default function SchemeApplicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();

  const [schemaFields, setSchemaFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // To simulate autofill from Citizen profile
  const [citizenProfile, setCitizenProfile] = useState<any>(null);

  useEffect(() => {
    fetchSchemeAndProfile();
  }, [id]);

  const fetchSchemeAndProfile = async () => {
    setLoading(true);
    try {
      // Fetch Scheme Details for parsing form_fields
      const { data: schemeData, error: schemeError } = await apiFetch(`/schemes/${id}`);
      if (schemeError || !schemeData?.success) throw new Error(schemeError || 'Failed to load scheme');
      
      const scheme = schemeData.data;
      let parsedFields = [];
      try {
        parsedFields = JSON.parse(scheme.form_fields);
      } catch (e) {
        console.warn('Could not parse form_fields');
      }

      // Fetch Profile for Autofill
      const { data: profileData } = await apiFetch('/user/profile');
      const profile = profileData?.success && profileData.data ? profileData.data : {};
      
      // Compute the runtime form schema where fields match Citizen Master keys
      const autofillMap: Record<string, string> = {
        aadhar_number:  profile.aadhar_number  || '',
        full_name:      profile.name            || '',
        annual_income:  profile.annual_income   ? String(profile.annual_income) : '',
        village_or_city: profile.village_or_city || '',
        district:       profile.district        || '',
        pan_number:     profile.pan_number      || '',
        pan_card:       profile.pan_number      || '',
        ration_card:    profile.ration_card_number || '',
        ration_card_no: profile.ration_card_number || '',
        driving_license: profile.driving_license_number || '',
        dl_number:      profile.driving_license_number || '',
      };

      const runtimeSchema = parsedFields.map((field: any) => {
        const autoValue = autofillMap[field.name];
        return {
          ...field,
          value: autoValue || '',
          autoFilled: !!autoValue,
        };
      });

      setSchemaFields(runtimeSchema);
      setCitizenProfile(profile);

      // Initialize form state
      const initialData: any = {};
      runtimeSchema.forEach((f: any) => initialData[f.name] = f.value);
      setFormData(initialData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation check
    for (const field of schemaFields) {
      if (field.required && !formData[field.name]?.toString().trim()) {
        alert(field.label + ' is required');
        return;
      }
    }

    try {
      const { data, error } = await apiFetch(`/schemes/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ form_data: formData }),
      });

      if (data?.success) {
        NotificationService.show({
          title: '✅ Application Submitted Successfully!',
          message: 'Your application has been received and will be reviewed shortly.',
          type: 'success'
        });
        router.replace('/(tabs)');
      } else {
        alert('❌ Submission Failed\n' + (error || 'Please try again.'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity style={{ marginTop: 24, padding: 12, backgroundColor: '#2563EB', borderRadius: 8 }} onPress={() => router.back()}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.headerBg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, paddingTop: 48 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{t('apply_scheme')}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>

        <View style={{ backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF', borderWidth: 1, borderColor: isDark ? '#2563EB' : '#BFDBFE', padding: 16, borderRadius: 12, marginBottom: 20, flexDirection: 'row' }}>
          <Info size={20} color="#2563EB" style={{ marginRight: 12, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: isDark ? '#93C5FD' : '#1E3A8A', marginBottom: 4 }}>{t('autofill_active')}</Text>
            <Text style={{ fontSize: 13, color: isDark ? '#BFDBFE' : '#1E40AF', lineHeight: 18 }}>{t('autofill_desc')}</Text>
          </View>
        </View>

        {schemaFields.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>No form fields defined for this scheme.</Text>
        ) : (
          schemaFields.map((item, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 4 }}>
                  {item.label} {item.required ? <Text style={{ color: '#EF4444' }}>*</Text> : ''}
                </Text>
                {item.autoFilled && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                    <CheckCircle2 size={12} color="#16A34A" />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#6EE7B7' : '#065F46', marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('auto_filled')}</Text>
                  </View>
                )}
              </View>

              {(item.type === 'text' || item.type === 'number') && (
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
                  value={formData[item.name]?.toString() || ''}
                  onChangeText={(val) => handleTextChange(item.name, val)}
                  editable={!item.autoFilled}
                  placeholder={`Enter ${item.label}`}
                  placeholderTextColor={colors.textMuted}
                  keyboardType={item.type === 'number' ? 'numeric' : 'default'}
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
                    <Text style={{ marginLeft: 8, fontWeight: '500', color: colors.textSecondary }}>{t('upload_document')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            </View>
          ))
        )}

        <TouchableOpacity
          style={{ backgroundColor: schemaFields.length === 0 ? colors.cardBorder : '#2563EB', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4, shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 8, marginTop: 8 }}
          onPress={handleSubmit}
          disabled={schemaFields.length === 0}
        >
          <Text style={{ color: schemaFields.length === 0 ? colors.textMuted : 'white', fontWeight: '600', fontSize: 17 }}>{t('submit_application')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

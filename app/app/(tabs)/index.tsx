import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, Pressable, Image, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mic, Send, FileText, CheckCircle2, Clock, X, MessageCircle, AlertTriangle, Search, Volume2, Bell } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const registeredSchemes = [
  { id: '1', name: 'Kisan Samman Nidhi', status: 'Active', since: 'Jan 2024' },
  { id: '2', name: 'Ayushman Bharat', status: 'Active', since: 'Mar 2024' },
  { id: '3', name: 'PM Ujjwala Yojana', status: 'Active', since: 'Aug 2023' },
];

type VoiceState = 'idle' | 'listening' | 'processing' | 'responding';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const [showRegistered, setShowRegistered] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Voice assistant state
  const [showVoice, setShowVoice] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [detectedIntent, setDetectedIntent] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const hasText = complaintText.trim().length > 0;

  // Pulse animation for listening state
  useEffect(() => {
    if (voiceState === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceState]);

  const handleSendComplaint = () => {
    if (!hasText) return;
    // TODO: Call complaintRoutes.fileComplaint(...)
    alert(`Complaint sent: "${complaintText}"`);
    setComplaintText('');
  };

  const openVoiceAssistant = () => {
    setShowVoice(true);
    setVoiceState('listening');
    setTranscription('');
    setAiResponse('');
    setDetectedIntent('');

    // Simulate listening → transcription → processing → response
    setTimeout(() => {
      setTranscription('Mujhe pension scheme chahiye');
      setVoiceState('processing');

      setTimeout(() => {
        setDetectedIntent('scheme_discovery');
        setAiResponse('I found 3 pension schemes you may qualify for. Would you like me to show them?');
        setVoiceState('responding');
      }, 1500);
    }, 2500);
  };

  const closeVoiceAssistant = () => {
    setShowVoice(false);
    setVoiceState('idle');
    setTranscription('');
    setAiResponse('');
    setDetectedIntent('');
  };

  const getIntentLabel = (intent: string) => {
    const map: Record<string, { label: string; color: string; icon: string }> = {
      scheme_discovery: { label: 'Scheme Discovery', color: '#2563EB', icon: '🔍' },
      complaint: { label: 'Complaint Filing', color: '#DC2626', icon: '📝' },
      status_check: { label: 'Status Check', color: '#CA8A04', icon: '📊' },
      general: { label: 'General Help', color: '#16A34A', icon: '💬' },
    };
    return map[intent] || map['general'];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.headerBg, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, zIndex: 10, position: 'relative' }}>
        <Image source={require('../../assets/images/icon.png')} style={{ width: 36, height: 36, borderRadius: 18, zIndex: 2 }} />
        <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>Sangwari AI</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', padding: 8, borderRadius: 999, zIndex: 2, marginRight: 8 }} onPress={() => router.push('/notifications')}>
          <Bell size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', padding: 8, borderRadius: 999, zIndex: 2 }} onPress={() => router.push('/profile')}>
          <User size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">

          {/* Schemes Summary Grid */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 }}>{t('my_schemes')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ backgroundColor: colors.card, borderRadius: 16, padding: 14, flex: 1, marginRight: 8, borderWidth: 1, borderColor: colors.cardBorder, height: 110, justifyContent: 'space-between' }} onPress={() => router.push('/schemes')}>
              <FileText size={26} color="#2563EB" />
              <View>
                <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>12</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 }}>{t('eligible_schemes')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: colors.card, borderRadius: 16, padding: 14, flex: 1, marginLeft: 8, borderWidth: 1, borderColor: colors.cardBorder, height: 110, justifyContent: 'space-between' }} onPress={() => setShowRegistered(true)}>
              <CheckCircle2 size={26} color="#16A34A" />
              <View>
                <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>3</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 }}>{t('registered')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Application Status */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('application_status')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 36, height: 36, backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <CheckCircle2 size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Kisan Samman Nidhi</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Approved • Transfer Pending</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, backgroundColor: isDark ? '#422006' : '#FEF3C7', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Clock size={18} color="#CA8A04" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>PM Awas Yojana</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Document Verification in Progress</Text>
              </View>
            </View>
          </View>

          {/* Grievance Tracking */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('grievance_tracking')}</Text>
            <View style={{ backgroundColor: isDark ? '#3B1010' : '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: isDark ? '#5C1E1E' : '#FECACA' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', color: isDark ? '#FCA5A5' : '#991B1B', fontSize: 13 }}>#GRV-2024-892</Text>
                <View style={{ backgroundColor: isDark ? '#5C1E1E' : '#FECACA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#FCA5A5' : '#7F1D1D' }}>Escalated: L2</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 1 }}><Text style={{ fontWeight: '500' }}>Dept:</Text> Water Resources</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 1 }}><Text style={{ fontWeight: '500' }}>Officer:</Text> Suresh K.</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}><Text style={{ fontWeight: '500' }}>Stage:</Text> Field Inspection</Text>
              <Text style={{ fontSize: 10, color: isDark ? '#FCA5A5' : '#B91C1C', fontWeight: '600' }}>ETA: 2 Days remaining</Text>
            </View>
          </View>

          {/* Smart Input Bar — Mic ↔ Send toggle */}
          <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'flex-end' }}>
            <TextInput
              ref={inputRef}
              style={{ flex: 1, backgroundColor: isDark ? colors.inputBg : '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, minHeight: 48, maxHeight: 100, color: colors.text, marginRight: 12, fontSize: 15, borderWidth: 1, borderColor: isDark ? colors.cardBorder : '#D1D5DB' }}
              placeholder={t('ask_question')}
              placeholderTextColor={colors.textMuted}
              multiline
              value={complaintText}
              onChangeText={setComplaintText}
            />
            {hasText ? (
              <TouchableOpacity
                style={{ backgroundColor: '#16A34A', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#16A34A', shadowOpacity: 0.4, shadowRadius: 8 }}
                onPress={handleSendComplaint}
              >
                <Send size={22} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: '#2563EB', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#2563EB', shadowOpacity: 0.4, shadowRadius: 8 }}
                onPress={openVoiceAssistant}
              >
                <Mic size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '500', fontSize: 12 }}>Sangwari AI v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Registered Schemes Modal */}
      <Modal visible={showRegistered} animationType="slide" transparent>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowRegistered(false)}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{t('registered_schemes')}</Text>
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

      {/* Voice Assistant Fullscreen Overlay — Google Assistant Style */}
      <Modal visible={showVoice} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.97)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Close Button */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8 }}>
              <TouchableOpacity
                style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', padding: 10, borderRadius: 999 }}
                onPress={closeVoiceAssistant}
              >
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Center Content */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>

              {/* Listening State */}
              {voiceState === 'listening' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 40, textAlign: 'center' }}>{t('listening')}</Text>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 }}>
                      <Mic size={48} color="white" />
                    </View>
                  </Animated.View>
                  <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 40, textAlign: 'center' }}>{t('speak_now')}</Text>
                </View>
              )}

              {/* Processing State */}
              {voiceState === 'processing' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 12, textAlign: 'center' }}>{t('understanding')}</Text>
                  <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, marginBottom: 30, maxWidth: '100%' }}>
                    <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center', fontStyle: 'italic' }}>"{transcription}"</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {[0, 1, 2].map(i => (
                      <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', opacity: 0.4 + (i * 0.2) }} />
                    ))}
                  </View>
                </View>
              )}

              {/* Responding State */}
              {voiceState === 'responding' && (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  {/* Transcription */}
                  <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, marginBottom: 16, alignSelf: 'flex-end', maxWidth: '85%' }}>
                    <Text style={{ fontSize: 15, color: colors.textSecondary, fontStyle: 'italic' }}>"{transcription}"</Text>
                  </View>

                  {/* Intent Badge */}
                  {detectedIntent && (
                    <View style={{ backgroundColor: getIntentLabel(detectedIntent).color + '18', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, marginRight: 6 }}>{getIntentLabel(detectedIntent).icon}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: getIntentLabel(detectedIntent).color }}>{getIntentLabel(detectedIntent).label}</Text>
                    </View>
                  )}

                  {/* AI Response Bubble */}
                  <View style={{ backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16, borderBottomLeftRadius: 4, alignSelf: 'flex-start', maxWidth: '85%', marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, color: 'white', lineHeight: 22 }}>{aiResponse}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 30 }}>
                    <Volume2 size={14} color={colors.textMuted} />
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 4 }}>Sangwari AI</Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                      onPress={() => { closeVoiceAssistant(); router.push('/schemes'); }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>{t('show_schemes')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder }}
                      onPress={openVoiceAssistant}
                    >
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('ask_again')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Branding */}
            <View style={{ alignItems: 'center', paddingBottom: 20 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '500' }}>Powered by Sangwari AI</Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

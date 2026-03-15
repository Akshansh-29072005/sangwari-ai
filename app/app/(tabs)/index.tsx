import { View, Text, TouchableOpacity, TextInput, Modal, FlatList, Pressable, Image, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mic, Send, FileText, CheckCircle2, Clock, X, MessageCircle, AlertTriangle, Search, Volume2, Bell } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { apiFetch, API_BASE_URL } from '../../api/api';
import { NotificationService } from '../../services/NotificationService';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');



type VoiceState = 'idle' | 'listening' | 'processing' | 'responding';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { t, lang } = useI18n();
  const [showRegistered, setShowRegistered] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const inputRef = useRef<TextInput>(null);
  
  // Data from backend
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ eligible: 0, registered: 0 });
  const [registeredSchemesData, setRegisteredSchemesData] = useState<any[]>([]);
  const [complaintsData, setComplaintsData] = useState<any[]>([]);

  // Voice assistant state
  const [showVoice, setShowVoice] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [detectedIntent, setDetectedIntent] = useState('');
  const [detectedScheme, setDetectedScheme] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
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

  // Fetch true user data and applications
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Profile
        const { data: profileResp } = await apiFetch('/user/profile');
        if (profileResp?.success && profileResp?.data) {
          setUser(profileResp.data);
        }

        // Fetch Applications
        const { data: appsResp } = await apiFetch('/applications');
        if (appsResp?.success && appsResp?.data) {
          const apps = appsResp.data;
          setStats(prev => ({ ...prev, registered: apps.length }));
          
          setRegisteredSchemesData(apps.map((app: any) => {
            const id = app.id || app.ID;
            const title = app.scheme?.title || app.Scheme?.Title || 'Unknown Scheme';
            const status = app.status || app.Status || 'Active';
            const sla = app.estimated_resolution_days || app.EstimatedResolutionDays || 15;
            const createdAt = app.created_at || app.CreatedAt;
            
            return {
              id,
              name: title,
              status,
              estimatedDays: sla,
              since: createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'
            };
          }));
        }

        // Fetch Eligible Schemes Count
        const { data: eligibleResp } = await apiFetch('/schemes/eligible');
        if (eligibleResp?.success && Array.isArray(eligibleResp?.data)) {
          const eligibleCount = eligibleResp.data.filter((s: any) => s.eligible).length;
          setStats(prev => ({ ...prev, eligible: eligibleCount }));
        }

        // Fetch Complaints
        const { data: compResp } = await apiFetch('/complaints');
        if (compResp?.success && compResp?.data) {
          setComplaintsData(compResp.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);


  const handleSendComplaint = async () => {
    if (!hasText) return;
    const text = complaintText.trim();
    setComplaintText('');
    try {
      const { data, error } = await apiFetch('/complaints/file', {
        method: 'POST',
        body: JSON.stringify({
          title: text.length > 80 ? text.substring(0, 80) : text,
          description: text,
          category: 'General',
        }),
      });
      if (data?.success) {
        // Refresh grievances list
        const { data: compResp } = await apiFetch('/complaints');
        if (compResp?.success && compResp?.data) setComplaintsData(compResp.data);
        
        // Premium Success Feedback
        NotificationService.show({
          title: '✅ Complaint Filed',
          message: 'Your grievance has been submitted. We will get back to you shortly.',
          type: 'success'
        });
      } else {
        Alert.alert('Failed to Submit', error || 'Could not file your complaint.');
        setComplaintText(text); // restore text
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // No longer using Voice listeners

  const openVoiceAssistant = async () => {
    setShowVoice(true);
    setVoiceState('listening');
    setTranscription('');
    setAiResponse('');
    setDetectedIntent('');

    try {
      // 1. Request Permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sangwari AI needs microphone access.');
        setVoiceState('idle');
        return;
      }

      // 2. Configure and Start Recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Recording Error', e.message || 'Failed to start microphone.');
      setVoiceState('idle');
    }
  };

  const stopListening = async () => {
    if (!recording) return;

    try {
      setVoiceState('processing');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        handleAudioSubmit(uri);
      } else {
        setVoiceState('idle');
      }
    } catch (e) {
      console.error(e);
      setVoiceState('idle');
    }
  };

  const handleAudioSubmit = async (uri: string) => {
    setVoiceState('processing');

    try {
      const formData = new FormData();
      // @ts-ignore - React Native FormData expects URI
      formData.append('audio', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'audio/m4a',
        name: 'voice.m4a',
      });
      formData.append('language', lang);

      // Fetch token for authenticated request
      const token = await AsyncStorage.getItem('auth_token');

      // Use API_BASE_URL from central config
      const response = await fetch(`${API_BASE_URL}/voice/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // Note: Do NOT set Content-Type header for FormData, 
        // the browser/RN will set it with the correct boundary
        body: formData,
      });

      const result = await response.json();

      if (result?.success && result?.data) {
        const { reply, intent, transcription: text, scheme } = result.data;
        setTranscription(text);
        setAiResponse(reply);
        setDetectedIntent(intent);
        setDetectedScheme(scheme);
        setVoiceState('responding');

        // Play voice response
        Speech.speak(reply, {
          language: lang === 'hi' ? 'hi-IN' : 'en-US',
          pitch: 1.0,
          rate: 1.0,
        });
      } else {
        const errorMsg = result?.message || result?.error || 'Failed to process audio.';
        Alert.alert('AI Layer Error', errorMsg);
        setVoiceState('idle');
      }
    } catch (err: any) {
      console.error('Voice process error:', err);
      Alert.alert('Voice Error', err.message || 'Network or processing failed');
      setVoiceState('idle');
    }
  };

  const closeVoiceAssistant = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    Speech.stop();
    setShowVoice(false);
    setVoiceState('idle');
    setTranscription('');
    setAiResponse('');
    setDetectedIntent('');
    setDetectedScheme(null);
  };

  const getIntentLabel = (intent: string) => {
    const map: Record<string, { label: string; color: string; icon: string }> = {
      scheme_discovery: { label: 'Scheme Discovery', color: '#2563EB', icon: '🔍' },
      scheme_help: { label: 'Scheme Help', color: '#2563EB', icon: '🔍' },
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
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Sangwari AI'}
          </Text>
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
                <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>{stats.eligible}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 }}>{t('eligible_schemes')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: colors.card, borderRadius: 16, padding: 14, flex: 1, marginLeft: 8, borderWidth: 1, borderColor: colors.cardBorder, height: 110, justifyContent: 'space-between' }} onPress={() => setShowRegistered(true)}>
              <CheckCircle2 size={26} color="#16A34A" />
              <View>
                <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>{stats.registered}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 }}>{t('registered')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Application Status */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('application_status')}</Text>
            {registeredSchemesData.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No applications submitted yet.</Text>
            ) : (
              registeredSchemesData.slice(0, 3).map((app, idx) => (
                <View key={app.id || idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ width: 36, height: 36, backgroundColor: isDark ? (app.status === 'approved' ? '#1E3A5F' : '#422006') : (app.status === 'approved' ? '#DBEAFE' : '#FEF3C7'), borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    {app.status === 'approved' ? <CheckCircle2 size={18} color="#2563EB" /> : <Clock size={18} color="#CA8A04" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{app.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize' }}>
                      {app.status} • Est: {app.estimatedDays} days
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Grievance Tracking */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('grievance_tracking')}</Text>
            {complaintsData.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No grievances filed yet.</Text>
            ) : (
              complaintsData.slice(0, 3).map((comp: any, idx: number) => {
                const id = comp.id || comp.ID;
                const title = comp.title || comp.Title;
                const status = comp.status || comp.Status;
                const dept = comp.department || comp.Department;
                const cat = comp.category || comp.Category;
                const createdAt = comp.created_at || comp.CreatedAt;
                const sla = comp.estimated_resolution_days || comp.EstimatedResolutionDays;
                
                return (
                  <View key={id || idx} style={{ backgroundColor: isDark ? '#3B1010' : '#FEF2F2', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: isDark ? '#5C1E1E' : '#FECACA', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '600', color: isDark ? '#FCA5A5' : '#991B1B', fontSize: 13, flex: 1 }} numberOfLines={1}>{title || `Grievance #${String(id || '').substring(0,8)}`}</Text>
                      <View style={{ backgroundColor: isDark ? '#5C1E1E' : '#FECACA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#FCA5A5' : '#7F1D1D', textTransform: 'capitalize' }}>{status}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 1 }}><Text style={{ fontWeight: '500' }}>Dept:</Text> {dept || 'Pending Assignment'}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 1 }}><Text style={{ fontWeight: '500' }}>Category:</Text> {cat || 'General'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ fontSize: 10, color: isDark ? '#FCA5A5' : '#B91C1C', fontWeight: '600' }}>Filed: {createdAt ? new Date(createdAt).toLocaleDateString() : 'Invalid Date'}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>Est: {sla || '7-10'} days</Text>
                    </View>
                  </View>
                );
              })
            )}
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
              data={registeredSchemesData}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>No schemes registered yet.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 6 }} />
                      <Text style={{ fontSize: 13, color: '#16A34A', fontWeight: '600' }}>{item.status}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>Est: {item.estimatedDays} days</Text>
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
                    <TouchableOpacity onPress={stopListening}>
                      <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 }}>
                        <Mic size={48} color="white" />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                  <Text style={{ fontSize: 16, color: colors.text, marginTop: 40, textAlign: 'center', fontWeight: '500' }}>{transcription || t('speak_now')}</Text>
                  
                  <TouchableOpacity 
                    className="mt-12 bg-gray-200 px-8 py-3 rounded-full"
                    onPress={stopListening}
                    style={{ backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6', marginTop: 40 }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 16 }}>
                    <Volume2 size={14} color={colors.textMuted} />
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 4 }}>Sangwari AI</Text>
                  </View>

                  {/* Identified Scheme Card */}
                  {detectedScheme && (
                    <View style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#2563EB', width: '100%', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB', marginBottom: 4 }}>FOUND RELEVANT SCHEME</Text>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{detectedScheme.name}</Text>
                      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }} numberOfLines={2}>{detectedScheme.description_hi || detectedScheme.description}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                      onPress={() => { 
                        closeVoiceAssistant(); 
                        if (detectedScheme) {
                          // Could push to scheme details if route existed, for now schemes list
                          router.push('/schemes'); 
                        } else {
                          router.push('/schemes'); 
                        }
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                        {detectedScheme ? 'View Scheme Details' : t('show_schemes')}
                      </Text>
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

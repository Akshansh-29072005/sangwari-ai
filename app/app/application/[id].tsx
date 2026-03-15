import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CheckCircle2, FileText, AlertCircle, Calendar, GraduationCap, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/context/ThemeContext';
import { apiFetch } from '@/api/api';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const { data } = await apiFetch(`/applications`);
      if (data?.success && data?.data) {
        // Find the specific application from the list for now
        const found = data.data.find((a: any) => String(a.id) === String(id));
        setApp(found);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (!app) {
    return (
      <View className="flex-1 items-center justify-center p-10" style={{ backgroundColor: colors.bg }}>
        <Typography variant="h3" style={{ color: colors.text }}>Application not found</Typography>
      </View>
    );
  }

  const progress = app.status === 'approved' ? 100 : app.status === 'rejected' ? 100 : 30;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: 'Application Details', 
          headerShadowVisible: false, 
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.text
        }} 
      />
      
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Card */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View className="rounded-3xl p-6 mb-6 shadow-sm border items-center" style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}>
             <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
               <Icon icon={GraduationCap} color="#007AFF" size={32} />
             </View>
             <Typography variant="h2" weight="bold" className="text-center mb-2" style={{ color: colors.text }}>
               {app.scheme?.title || 'Scheme Application'}
             </Typography>
             <View className="flex-row items-center mb-4">
               <Icon icon={Calendar} size={16} color={colors.textSecondary} />
               <Typography variant="body" className="ml-2" style={{ color: colors.textSecondary }}>
                 Applied on {new Date(app.created_at).toLocaleDateString()}
               </Typography>
             </View>
             
             {/* Progress Bar */}
             <View className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
               <View className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
             </View>
             <View className="w-full flex-row justify-between items-center px-1">
               <Typography variant="caption" style={{ color: colors.textMuted }}>Status: {app.status}</Typography>
               <Typography variant="caption" style={{ color: colors.textMuted }}>{progress}% Complete</Typography>
             </View>
          </View>
        </Animated.View>

        {/* AI Insight Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View className="rounded-2xl p-4 mb-8 border flex-row items-start" style={{ backgroundColor: isDark ? '#1C3D1C' : '#F0FDF4', borderColor: isDark ? '#1E4620' : '#DCFCE7' }}>
             <View className="mt-1">
               <Icon icon={Clock} color={isDark ? '#4ADE80' : '#16A34A'} size={18} />
             </View>
             <View className="flex-1 ml-3">
               <Typography variant="body" weight="bold" style={{ color: isDark ? '#4ADE80' : '#16A34A' }}>AI Tracking Insight</Typography>
               <Typography variant="caption" className="mt-1" style={{ color: isDark ? '#D1FAE5' : '#166534' }}>
                 Based on historic data, your application is expected to be resolved within <Typography weight="bold">{app.estimated_resolution_days || 15} days</Typography>. Our agents are currently reviewing your documents.
               </Typography>
             </View>
          </View>
        </Animated.View>

        <Typography variant="h3" weight="semibold" className="mb-4 ml-2" style={{ color: colors.text }}>Application Data</Typography>
        
        <View className="rounded-3xl p-5 mb-8 shadow-sm border" style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}>
           <View className="flex-row items-center mb-4">
             <Icon icon={FileText} color={colors.textSecondary} size={18} />
             <Typography variant="body" weight="semibold" className="ml-3" style={{ color: colors.text }}>Form Details</Typography>
           </View>
           <Typography variant="caption" style={{ color: colors.textSecondary }}>
             {app.form_data ? "Form data successfully verified and stored securely." : "Standard form data received."}
           </Typography>
        </View>

        <Typography variant="caption" className="text-center px-4" style={{ color: colors.textMuted }}>
          Tracking ID: {app.id || app.ID} • Sangwari AI Real-time Status System
        </Typography>

      </ScrollView>
    </SafeAreaView>
  );
}


import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CheckCircle2, Circle, Clock, Building, MapPin, FileText, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/context/ThemeContext';
import { apiFetch } from '@/api/api';

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const { data } = await apiFetch(`/complaints`);
      if (data?.success && data?.data) {
        // Find the specific complaint from the list
        const found = data.data.find((c: any) => String(c.id) === String(id));
        setComplaint(found);
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

  if (!complaint) {
    return (
      <View className="flex-1 items-center justify-center p-10" style={{ backgroundColor: colors.bg }}>
        <Typography variant="h3" style={{ color: colors.text }}>Complaint not found</Typography>
      </View>
    );
  }

  const createdAt = complaint.created_at || complaint.CreatedAt;
  const dept = complaint.department || complaint.Department;
  const sla = complaint.estimated_resolution_days || complaint.EstimatedResolutionDays;

  const TIMELINE = [
    { id: 1, title: 'Complaint Submitted', date: createdAt ? new Date(createdAt).toLocaleDateString() : 'Pending', status: 'completed', icon: CheckCircle2, color: '#34C759' },
    { id: 2, title: 'Department Assigned', date: dept || 'Pending', status: dept ? 'completed' : 'current', icon: Building, color: dept ? '#34C759' : '#007AFF' },
    { id: 3, title: 'Investigation', date: 'In Progress', status: dept ? 'current' : 'upcoming', icon: Clock, color: dept ? '#007AFF' : '#C7C7CC' },
    { id: 4, title: 'Resolved', date: 'Pending', status: 'upcoming', icon: CheckCircle2, color: '#C7C7CC' },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: 'Grievance Tracking', 
          headerShadowVisible: false, 
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.text
        }} 
      />
      
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Details Card */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View className="rounded-3xl p-5 mb-6 shadow-sm border" style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}>
             <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                  <Icon icon={FileText} color="#AF52DE" size={20} />
                </View>
                <View className="flex-1">
                  <Typography variant="h3" weight="bold" style={{ color: colors.text }}>{complaint.title}</Typography>
                  <Typography variant="caption" style={{ color: colors.textMuted }}>Ref: {String(id).substring(0, 12)}</Typography>
                </View>
                <View className="px-3 py-1 bg-blue-50 rounded-full">
                  <Typography variant="caption" weight="bold" className="text-[#007AFF] uppercase">{complaint.status}</Typography>
                </View>
             </View>
             
             <Typography variant="body" className="mb-4" style={{ color: colors.textSecondary }}>
               {complaint.description}
             </Typography>

             <View className="flex-row items-center mb-2">
               <Icon icon={Building} size={16} color={colors.textMuted} />
               <Typography variant="body" className="ml-2 flex-1" style={{ color: colors.textSecondary }}>
                 <Typography weight="semibold">Dept:</Typography> {complaint.department || 'Pending Assignment'}
               </Typography>
             </View>
             
             <View className="flex-row items-center">
               <Icon icon={MapPin} size={16} color={colors.textMuted} />
               <Typography variant="body" className="ml-2 flex-1" style={{ color: colors.textSecondary }}>
                 <Typography weight="semibold">Category:</Typography> {complaint.category}
               </Typography>
             </View>
          </View>
        </Animated.View>

        {/* AI Insight Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View className="rounded-2xl p-4 mb-8 border flex-row items-start" style={{ backgroundColor: isDark ? '#3B1010' : '#FEF2F2', borderColor: isDark ? '#5C1E1E' : '#FECACA' }}>
             <View className="mt-1">
               <Icon icon={AlertTriangle} color={isDark ? '#FCA5A5' : '#B91C1C'} size={18} />
             </View>
             <View className="flex-1 ml-3">
               <Typography variant="body" weight="bold" style={{ color: isDark ? '#FCA5A5' : '#B91C1C' }}>Resolution Prediction</Typography>
               <Typography variant="caption" className="mt-1" style={{ color: isDark ? '#FCA5A5' : '#7F1D1D' }}>
                 Our SLA Engine predicts resolution in <Typography weight="bold">{complaint.estimated_resolution_days || '7-10'} days</Typography>. This matches typical turnaround for {complaint.department || 'this category'}.
               </Typography>
             </View>
          </View>
        </Animated.View>

        {/* Timeline */}
        <Typography variant="h3" weight="semibold" className="mb-6 ml-2" style={{ color: colors.text }}>Progress Timeline</Typography>
        
        <View className="ml-2">
          {TIMELINE.map((step, index) => (
             <Animated.View key={step.id} entering={FadeInDown.delay(index * 150).duration(500)}>
                <View className="flex-row mb-6">
                   {/* Left Icon and Line */}
                   <View className="items-center mr-4">
                     <View className={`w-8 h-8 rounded-full items-center justify-center z-10 ${step.status === 'upcoming' ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : (isDark ? 'bg-gray-700' : 'bg-white shadow-sm')}`}>
                       <Icon icon={step.icon} color={step.color} size={18} />
                     </View>
                     {/* Line connecting nodes */}
                     {index < TIMELINE.length - 1 && (
                       <View className={`w-0.5 flex-1 -my-1 z-0 ${step.status === 'completed' ? '#34C759' : (isDark ? '#38383A' : '#E5E7EB')}`} style={{ backgroundColor: step.status === 'completed' ? '#34C759' : (isDark ? '#38383A' : '#E5E7EB') }} />
                     )}
                   </View>
                   
                   {/* Right Content */}
                   <View className={`flex-1 pt-1 pb-4 ${step.status === 'upcoming' ? 'opacity-40' : ''}`}>
                      <Typography variant="body" weight={step.status === 'current' ? 'bold' : 'semibold'} className="mb-1" style={{ color: colors.text }}>
                        {step.title}
                      </Typography>
                      <Typography variant="caption" style={{ color: colors.textSecondary }}>
                        {step.date}
                      </Typography>
                   </View>
                </View>
             </Animated.View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}


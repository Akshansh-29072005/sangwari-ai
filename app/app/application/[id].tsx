import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CheckCircle2, FileText, AlertCircle, Calendar, GraduationCap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';

const DOCUMENTS = [
  { id: 1, name: 'Aadhaar Card', status: 'verified', icon: CheckCircle2, color: '#34C759' },
  { id: 2, name: 'Domicile Certificate', status: 'verified', icon: CheckCircle2, color: '#34C759' },
  { id: 3, name: 'Income Certificate', status: 'pending', icon: AlertCircle, color: '#FF9500' },
  { id: 4, name: '10th Marksheet', status: 'verified', icon: CheckCircle2, color: '#34C759' },
];

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <Stack.Screen options={{ title: `Application ${id}`, headerShadowVisible: false, headerStyle: { backgroundColor: '#F2F2F7' } }} />
      
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Card */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 items-center">
             <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
               <Icon icon={GraduationCap} color="#007AFF" size={32} />
             </View>
             <Typography variant="h2" weight="bold" className="text-center mb-2">State Free Laptop Scheme</Typography>
             <View className="flex-row items-center mb-2">
               <Icon icon={Calendar} size={16} color="#8E8E93" />
               <Typography variant="body" className="text-secondary ml-2">Applied on Jan 12, 2026</Typography>
             </View>
             
             <View className="mt-4 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 flex-row items-center">
               <Icon icon={AlertCircle} size={16} color="#FF9500" />
               <Typography variant="body" weight="semibold" className="text-orange-600 ml-2">Action Required</Typography>
             </View>
          </View>
        </Animated.View>

        {/* Documents Section */}
        <Typography variant="h3" weight="semibold" className="mb-4 ml-2">Uploaded Documents</Typography>
        
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-gray-100">
          {DOCUMENTS.map((doc, index) => (
             <Animated.View key={doc.id} entering={FadeInDown.delay(index * 100).duration(500)}>
                <View className={`flex-row items-center justify-between ${index < DOCUMENTS.length - 1 ? 'border-b border-gray-100 mb-4 pb-4' : ''}`}>
                   <View className="flex-row items-center">
                     <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3">
                       <Icon icon={FileText} color="#000" size={18} />
                     </View>
                     <View>
                        <Typography variant="body" weight="semibold">{doc.name}</Typography>
                        <Typography variant="caption" className="text-secondary uppercase text-[10px] mt-0.5">
                          {doc.status === 'verified' ? 'Verified securely' : 'Needs attention'}
                        </Typography>
                     </View>
                   </View>
                   <Icon icon={doc.icon} color={doc.color} size={20} />
                </View>
             </Animated.View>
          ))}
        </View>

        <Typography variant="caption" className="text-center text-secondary px-4">
          If any document is marked as pending, please visit the nearest service center for physical verification.
        </Typography>

      </ScrollView>
    </SafeAreaView>
  );
}

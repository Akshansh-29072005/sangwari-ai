import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { CheckCircle2, Circle, Clock, Building, MapPin, User, FileText } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';

const TIMELINE = [
  { id: 1, title: 'Complaint Submitted', date: 'March 14, 09:00 AM', status: 'completed', icon: CheckCircle2, color: '#34C759' },
  { id: 2, title: 'Assigned to Ward Officer', date: 'March 14, 11:30 AM', status: 'completed', icon: User, color: '#34C759' },
  { id: 3, title: 'Under Review', date: 'In Progress', status: 'current', icon: Clock, color: '#007AFF' },
  { id: 4, title: 'Action Taken', date: 'Pending', status: 'upcoming', icon: Circle, color: '#C7C7CC' },
  { id: 5, title: 'Resolved', date: 'Pending', status: 'upcoming', icon: Circle, color: '#C7C7CC' },
];

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <Stack.Screen options={{ title: `Complaint ${id}`, headerShadowVisible: false, headerStyle: { backgroundColor: '#F2F2F7' } }} />
      
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Details Card */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-gray-100">
             <View className="flex-row items-center mb-4">
               <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                 <Icon icon={FileText} color="#AF52DE" size={20} />
               </View>
               <View className="flex-1">
                 <Typography variant="h3" weight="bold">Water Supply Issue</Typography>
                 <Typography variant="caption" className="text-secondary">{id}</Typography>
               </View>
               <View className="px-3 py-1 bg-blue-50 rounded-full">
                 <Typography variant="caption" weight="bold" className="text-[#007AFF]">Review</Typography>
               </View>
             </View>
             
             <View className="flex-row items-center mt-2 mb-2">
               <Icon icon={MapPin} size={16} color="#8E8E93" />
               <Typography variant="body" className="text-secondary ml-2 flex-1">Sector 4, Main Road area</Typography>
             </View>
             
             <View className="flex-row items-center">
               <Icon icon={Building} size={16} color="#8E8E93" />
               <Typography variant="body" className="text-secondary ml-2 flex-1">Public Works Dept (PWD)</Typography>
             </View>
          </View>
        </Animated.View>

        {/* Timeline */}
        <Typography variant="h3" weight="semibold" className="mb-6 ml-2">Progress Timeline</Typography>
        
        <View className="ml-2">
          {TIMELINE.map((step, index) => (
             <Animated.View key={step.id} entering={FadeInDown.delay(index * 150).duration(500)}>
                <View className="flex-row mb-6">
                   {/* Left Icon and Line */}
                   <View className="items-center mr-4">
                     <View className={`w-8 h-8 rounded-full items-center justify-center z-10 ${step.status === 'upcoming' ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                       <Icon icon={step.icon} color={step.color} size={18} />
                     </View>
                     {/* Line connecting nodes */}
                     {index < TIMELINE.length - 1 && (
                       <View className={`w-0.5 flex-1 -my-1 z-0 ${step.status === 'completed' ? 'bg-[#34C759]' : 'bg-gray-200'}`} />
                     )}
                   </View>
                   
                   {/* Right Content */}
                   <View className={`flex-1 pt-1 pb-4 ${step.status === 'upcoming' ? 'opacity-50' : ''}`}>
                      <Typography variant="body" weight={step.status === 'current' ? 'bold' : 'semibold'} className="mb-1">
                        {step.title}
                      </Typography>
                      <Typography variant="caption" className="text-secondary">
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

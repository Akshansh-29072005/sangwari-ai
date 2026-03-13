import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Bell, ShieldAlert, CheckCircle, FileText, ChevronLeft, Send } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { GlassCard } from '@/components/ui/GlassCard';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Application Approved! 🎉', message: 'Your State Free Laptop Scheme application has been approved. Check details.', time: '2 mins ago', type: 'success', icon: CheckCircle, color: '#34C759', route: '/application/1' },
  { id: '2', title: 'Complaint Assigned', message: 'Your complaint regarding water supply (#CMP-492) is now under review.', time: '1 hour ago', type: 'info', icon: FileText, color: '#007AFF', route: '/complaint/CMP-492' },
  { id: '3', title: 'Important Update', message: 'The deadline for PM Awas Yojana is approaching in 3 days.', time: 'Yesterday', type: 'alert', icon: ShieldAlert, color: '#FF9500', route: undefined },
];

export default function NotificationsScreen() {
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId = 'your-project-id'; // To replace with actual project ID if needed
        // token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        // Fallback for demo
      }
    }
    return token;
  }

  async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sangwari AI Update 🌟",
        body: "Your complaint status has been updated to 'Resolved'.",
        data: { data: 'goes here' },
      },
      trigger: null, // Send immediately
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <Stack.Screen options={{ title: 'Notifications', headerShadowVisible: false, headerStyle: { backgroundColor: '#F2F2F7' } }} />
      
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
        
        <Pressable 
          onPress={sendTestNotification}
          className="bg-[#007AFF]/10 p-4 rounded-2xl flex-row items-center justify-between mb-6 border border-[#007AFF]/20"
        >
          <View className="flex-1">
            <Typography variant="body" weight="semibold" className="text-[#007AFF] mb-1">
              Test Push Notifications
            </Typography>
            <Typography variant="caption" className="text-[#007AFF]/80">
              Tap here to simulate receiving a live push notification from Sangwari AI.
            </Typography>
          </View>
          <View className="bg-[#007AFF] w-10 h-10 rounded-full items-center justify-center ml-3 shadow-sm">
            <Icon icon={Send} color="#FFF" size={18} />
          </View>
        </Pressable>

        <Typography variant="caption" weight="semibold" className="mb-3 ml-2 uppercase tracking-wider text-secondary">
          Recent Alerts
        </Typography>

        {MOCK_NOTIFICATIONS.map((notif, index) => (
          <Animated.View key={notif.id} entering={FadeInDown.delay(index * 100).duration(500)}>
            {/* Using a simple Pressable link for now instead of router pushing logic without navigation hook */}
            <View className="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-gray-100 flex-row">
               <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${notif.color}15` }}>
                  <Icon icon={notif.icon} color={notif.color} size={24} />
               </View>
               <View className="flex-1 justify-center">
                 <View className="flex-row justify-between items-start mb-1">
                   <Typography variant="body" weight="bold" className="flex-1 mr-2">{notif.title}</Typography>
                   <Typography variant="caption" className="text-gray-400 text-xs">{notif.time}</Typography>
                 </View>
                 <Typography variant="caption" className="text-gray-600 leading-snug">{notif.message}</Typography>
               </View>
            </View>
          </Animated.View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ShieldAlert, CheckCircle, FileText, Bell, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/context/ThemeContext';
import { getNotifications, markNotificationAsRead, Notification } from '@/api/routes/notifications';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { notifications: data } = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const { notifications: data } = await getNotifications();
    setNotifications(data);
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'alert': return ShieldAlert;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return '#34C759';
      case 'alert': return '#FF9500';
      case 'info': return '#007AFF';
      case 'error': return '#FF3B30';
      default: return colors.textSecondary;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Stack.Screen 
        options={{ 
          title: 'Notifications', 
          headerShadowVisible: false, 
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.text
        }} 
      />
      
      <ScrollView 
        className="flex-1 px-4 pt-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        <Typography variant="caption" weight="semibold" className="mb-4 ml-2 uppercase tracking-wider" style={{ color: colors.textSecondary }}>
          {notifications.length > 0 ? 'Recent Alerts' : ''}
        </Typography>

        {loading && notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator color={colors.text} />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Typography variant="body" style={{ color: colors.textMuted }}>No notifications yet</Typography>
          </View>
        ) : (
          notifications.map((notif, index) => (
            <Animated.View key={notif.id} entering={FadeInDown.delay(index * 100).duration(500)}>
              <Pressable 
                onPress={() => !notif.is_read && handleMarkAsRead(notif.id)}
                className="rounded-3xl p-4 mb-3 shadow-sm border flex-row"
                style={{ 
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  opacity: notif.is_read ? 0.7 : 1
                }}
              >
                 <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${getColor(notif.type)}15` }}>
                    <Icon icon={getIcon(notif.type)} color={getColor(notif.type)} size={24} />
                 </View>
                 <View className="flex-1 justify-center">
                   <View className="flex-row justify-between items-start mb-1">
                     <Typography variant="body" weight="bold" className="flex-1 mr-2" style={{ color: colors.text }}>
                        {notif.title}
                     </Typography>
                     <Typography variant="caption" style={{ color: colors.textMuted }}>
                        {formatTime(notif.created_at)}
                     </Typography>
                   </View>
                   <Typography variant="caption" className="leading-snug" style={{ color: colors.textSecondary }}>
                      {notif.message}
                   </Typography>
                   {!notif.is_read && (
                     <View className="w-2 h-2 rounded-full absolute -top-1 -right-1" style={{ backgroundColor: '#007AFF' }} />
                   )}
                 </View>
              </Pressable>
            </Animated.View>
          ))
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}


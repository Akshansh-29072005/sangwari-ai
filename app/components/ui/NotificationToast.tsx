import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { Bell, Info, CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'alert' | 'error';
  onPress?: () => void;
}

export interface NotificationToastRef {
  show: (props: NotificationToastProps) => void;
  hide: () => void;
}

export const NotificationToast = forwardRef<NotificationToastRef>((_, ref) => {
  const [data, setData] = useState<NotificationToastProps | null>(null);
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(-200);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' }
      );
      await sound.playAsync();
    } catch (e) {
      // Fallback or silence
    }
  };

  const show = (props: NotificationToastProps) => {
    setData(props);
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    
    // Premium Feedback: Haptics & Sound
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSound();

    // Auto hide after 5 seconds
    setTimeout(() => {
      hide();
    }, 5000);
  };


  const hide = () => {
    translateY.value = withTiming(-200, { duration: 300 }, () => {
      runOnJS(setData)(null);
    });
  };

  useImperativeHandle(ref, () => ({
    show,
    hide
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!data) return null;

  const getIcon = () => {
    switch (data.type) {
      case 'success': return { icon: CheckCircle2, color: '#34C759' };
      case 'alert': return { icon: AlertCircle, color: '#FF9500' };
      case 'error': return { icon: AlertCircle, color: '#FF3B30' };
      default: return { icon: Info, color: '#007AFF' };
    }
  };

  const { icon, color } = getIcon();

  return (
    <Animated.View style={[styles.container, animatedStyle]} className="px-4">
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          data.onPress?.();
          hide();
        }}
        className="rounded-3xl p-4 flex-row items-center border"
        style={{ 
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${color}15` }}>
          <Icon icon={icon} color={color} size={24} />
        </View>
        
        <View className="flex-1 mr-2">
          <Typography variant="body" weight="bold" style={{ color: colors.text, fontSize: 16 }}>{data.title}</Typography>
          <Typography variant="caption" numberOfLines={2} style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{data.message}</Typography>
        </View>

        <TouchableOpacity onPress={hide} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Icon icon={X} color={colors.textMuted} size={14} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});

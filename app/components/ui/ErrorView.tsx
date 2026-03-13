import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { AlertTriangle, RefreshCcw } from 'lucide-react-native';

import { Typography } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';

export interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  style?: ViewStyle;
}

export function ErrorView({ 
  title = 'Something went wrong', 
  message = "We're having trouble connecting to Sangwari AI right now. Please try again.", 
  onRetry,
  className = '',
  style
}: ErrorViewProps) {
  return (
    <View className={`flex-1 items-center justify-center p-6 ${className}`} style={style}>
      <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
        <Icon icon={AlertTriangle} color="#FF3B30" size={32} />
      </View>
      
      <Typography variant="h3" weight="bold" className="text-center mb-2">
        {title}
      </Typography>
      
      <Typography variant="body" className="text-center text-secondary mb-6 px-4">
        {message}
      </Typography>
      
      {onRetry && (
        <Pressable 
          onPress={onRetry}
          className="flex-row items-center justify-center bg-gray-100 rounded-full px-6 py-3"
        >
          <Icon icon={RefreshCcw} size={16} color="#000" />
          <Typography variant="body" weight="semibold" className="ml-2">
            Try Again
          </Typography>
        </Pressable>
      )}
    </View>
  );
}

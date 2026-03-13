import React from 'react';
import { LucideIcon } from 'lucide-react-native';

export interface IconProps {
  icon: LucideIcon;
  color?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, color = '#1C1C1E', size = 22 }) => {
  return <IconComponent color={color} size={size} strokeWidth={1.5} />;
};

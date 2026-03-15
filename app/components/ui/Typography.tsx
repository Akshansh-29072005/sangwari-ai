import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  children: React.ReactNode;
}

const VARIANTS = {
  h1: { fontSize: 32, lineHeight: 40 },
  h2: { fontSize: 24, lineHeight: 32 },
  h3: { fontSize: 20, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
};

const WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight = 'normal',
  className = '',
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        VARIANTS[variant],
        { fontWeight: WEIGHTS[weight] as any, color: '#1C1C1E' },
        style,
      ]}
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
};

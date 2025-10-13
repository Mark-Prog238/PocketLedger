import React from 'react';
import { View, Text } from 'react-native';

interface ShieldLogoProps {
  size?: number;
  color?: string;
}

export function ShieldLogo({ size = 64, color = '#94a3b8' }: ShieldLogoProps) {
  return (
    <View 
      style={{
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 8,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text 
        style={{
          color: color,
          fontSize: size * 0.4,
          fontWeight: 'bold',
        }}
      >
        ✓
      </Text>
    </View>
  );
}

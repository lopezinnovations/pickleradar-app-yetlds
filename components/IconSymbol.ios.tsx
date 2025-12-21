
import React from 'react';
import { SymbolView } from 'expo-symbols';
import { colors } from '@/styles/commonStyles';

interface IconSymbolProps {
  ios_icon_name?: string;
  android_material_icon_name?: string;
  size?: number;
  color?: string;
}

export function IconSymbol({ 
  ios_icon_name, 
  android_material_icon_name, 
  size = 24, 
  color = colors.text 
}: IconSymbolProps) {
  const iconName = ios_icon_name || android_material_icon_name || 'house';

  return (
    <SymbolView
      name={iconName}
      size={size}
      tintColor={color}
      type="monochrome"
      weight="regular"
    />
  );
}

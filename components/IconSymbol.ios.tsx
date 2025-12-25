
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
  // Map common icon names to iOS SF Symbols
  const iconMap: { [key: string]: string } = {
    'mail': 'envelope.fill',
    'mail_outline': 'envelope',
    'email': 'envelope.fill',
    'message': 'message.fill',
  };

  let iconName = ios_icon_name || android_material_icon_name || 'house';
  
  // Check if we need to map the icon name
  if (iconMap[iconName]) {
    iconName = iconMap[iconName];
  }

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

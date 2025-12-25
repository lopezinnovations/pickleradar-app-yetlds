
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const iconMap: { [key: string]: string } = {
    'home': '🏠',
    'map': '📍',
    'map.fill': '🗺️',
    'map-pin': '📍',
    'map.circle.fill': '🗺️',
    'people': '👥',
    'person': '👤',
    'person.fill': '👤',
    'person.2.fill': '👥',
    'person.2.slash': '🚫',
    'person.crop.circle': '👤',
    'person.crop.circle.fill': '👤',
    'person.badge.minus': '👤➖',
    'person.badge.plus': '👤➕',
    'person.crop.circle.badge.questionmark': '❓',
    'person_remove': '👤➖',
    'person_add': '👤➕',
    'person_search': '🔍',
    'location.fill': '📍',
    'location_on': '📍',
    'checkmark.circle.fill': '✅',
    'check_circle': '✅',
    'checkmark': '✓',
    'check': '✓',
    'chevron.right': '›',
    'chevron.left': '‹',
    'chevron_right': '›',
    'chevron_left': '‹',
    'chevron.down': '⌄',
    'chevron.up': '⌃',
    'expand_more': '⌄',
    'expand_less': '⌃',
    'arrow.clockwise': '🔄',
    'refresh': '🔄',
    'bell.fill': '🔔',
    'notifications': '🔔',
    'lock.shield.fill': '🔒',
    'shield': '🔒',
    'exclamationmark.triangle.fill': '⚠️',
    'warning': '⚠️',
    'phone.fill': '📞',
    'phone': '📞',
    'people_outline': '👥',
    'settings': '⚙️',
    'gear': '⚙️',
    'gearshape.fill': '⚙️',
    'gearshape': '⚙️',
    'trash': '🗑️',
    'delete': '🗑️',
    'trash.fill': '🗑️',
    'delete_forever': '🗑️',
    'rectangle.portrait.and.arrow.right': '🚪',
    'logout': '🚪',
    'checkmark.shield.fill': '🛡️',
    'verified_user': '🛡️',
    'account_circle': '👤',
    'info.circle.fill': 'ℹ️',
    'info': 'ℹ️',
    'clock.fill': '⏰',
    'schedule': '⏰',
    'xmark.circle.fill': '❌',
    'cancel': '❌',
    'chart.bar.fill': '📊',
    'bar_chart': '📊',
    'line.3.horizontal.decrease.circle': '▼',
    'filter_list': '▼',
    'slider.horizontal.2': '⚙',
    'tune': '⚙',
    'magnifyingglass': '🔍',
    'search': '🔍',
    'plus.circle.fill': '➕',
    'add_circle': '➕',
    'minus.circle.fill': '➖',
    'remove_circle': '➖',
    'camera.fill': '📷',
    'photo_camera': '📷',
    'envelope': '✉️',
    'envelope.fill': '✉️',
    'mail': '✉️',
    'mail_outline': '✉️',
    'email': '✉️',
    'message': '💬',
    'xmark.circle': '❌',
    'clear': '❌',
  };

  const iconName = ios_icon_name || android_material_icon_name || 'home';
  const icon = iconMap[iconName] || '•';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.icon, { fontSize: size * 0.8, color }]}>
        {icon}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});


import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface SkillLevelBarsProps {
  averageSkillLevel: number; // 1-4 representing Beginner to Expert
  size?: number;
  color?: string;
}

export const SkillLevelBars: React.FC<SkillLevelBarsProps> = ({ 
  averageSkillLevel, 
  size = 16,
  color = colors.primary 
}) => {
  const barCount = Math.round(averageSkillLevel);
  const bars = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => {
        const isActive = bar <= barCount;
        const barHeight = (bar / 4) * size;
        
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                width: size / 5,
                height: barHeight,
                backgroundColor: isActive ? color : colors.border,
                marginLeft: index > 0 ? 2 : 0,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
  },
  bar: {
    borderRadius: 1,
  },
});

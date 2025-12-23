
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface SkillLevelBarsProps {
  averageSkillLevel: number; // 0-3 representing average skill (0 = no players, 1 = Beginner, 2 = Intermediate, 3 = Advanced)
  size?: number;
  color?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced'; // For profile display
}

export const SkillLevelBars: React.FC<SkillLevelBarsProps> = ({ 
  averageSkillLevel, 
  size = 16,
  color = colors.primary,
  skillLevel
}) => {
  // If skillLevel is provided (for profile), use that for width calculation
  let fillPercentage = 0;
  
  if (skillLevel) {
    // Beginner: 33%, Intermediate: 66%, Advanced: 100%
    switch (skillLevel) {
      case 'Beginner':
        fillPercentage = 0.33;
        break;
      case 'Intermediate':
        fillPercentage = 0.66;
        break;
      case 'Advanced':
        fillPercentage = 1.0;
        break;
    }
    
    return (
      <View style={[styles.progressContainer, { height: size }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${fillPercentage * 100}%`,
              backgroundColor: color,
              height: size,
            }
          ]} 
        />
      </View>
    );
  }
  
  // Otherwise, use the bar display for court average skill level
  const normalizedLevel = Math.min(Math.max(averageSkillLevel, 0), 3);
  const barCount = Math.round((normalizedLevel / 3) * 4);
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
  progressContainer: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 8,
  },
});

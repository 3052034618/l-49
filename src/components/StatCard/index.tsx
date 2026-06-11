import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  suffix = '',
  color = '#165dff',
  trend,
  trendValue,
  icon
}) => {
  return (
    <View className={styles.card} style={{ borderTopColor: color }}>
      {icon && <View className={styles.icon}>{icon}</View>}
      <View className={styles.label}>{label}</View>
      <View className={styles.valueRow}>
        <Text className={styles.value} style={{ color }}>{value}</Text>
        {suffix && <Text className={styles.suffix}>{suffix}</Text>}
      </View>
      {trend && trendValue && (
        <View className={`${styles.trend} ${
          trend === 'up' ? styles.trendUp :
          trend === 'down' ? styles.trendDown : styles.trendFlat
        }`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'flat' && '→'}
          {trendValue}
        </View>
      )}
    </View>
  );
};

export default StatCard;

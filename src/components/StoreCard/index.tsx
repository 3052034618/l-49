import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { Store } from '@/types';
import { getStatusText, getStatusColor, formatCurrency } from '@/utils';
import { useApp } from '@/store/app';

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
  onCheckin?: () => void;
  onCheckout?: () => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onClick, onCheckin, onCheckout }) => {
  const { shelfTasks, rectifications, salesRecords } = useApp();

  const metrics = useMemo(() => {
    const storeTasks = shelfTasks.filter(t => t.storeId === store.id);
    const photoDone = storeTasks.filter(t => t.status !== 'pending').length;
    const outOfStock = storeTasks.filter(t => t.isOutOfStock).length;
    const pendingRect = rectifications.filter(
      r => r.storeId === store.id && r.status !== 'approved' && r.status !== 'completed'
    ).length;
    const todaySales = salesRecords
      .filter(s => s.storeId === store.id)
      .reduce((a, b) => a + b.totalAmount, 0);
    return { photoDone, outOfStock, pendingRect, todaySales, totalTasks: storeTasks.length };
  }, [shelfTasks, rectifications, salesRecords, store.id]);

  const progress = store.taskCount > 0 ? Math.round((store.completedTaskCount / store.taskCount) * 100) : 0;
  const statusColor = getStatusColor(store.status);

  const handleCheckin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckin?.();
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckout?.();
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.storeName}>
          <Text>{store.name}</Text>
          <View className={styles.statusTag} style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
            {getStatusText(store.status)}
          </View>
        </View>
        <View className={styles.distance}>{store.distance}</View>
      </View>

      <View className={styles.address}>
        <Text className={styles.addressIcon}>📍</Text>
        <Text className={styles.addressText}>{store.address}</Text>
      </View>

      {store.checkinTime && (
        <View className={styles.timeInfo}>
          <Text className={styles.timeLabel}>签到: {store.checkinTime}</Text>
          {store.checkoutTime && <Text className={styles.timeLabel}>离开: {store.checkoutTime}</Text>}
        </View>
      )}

      <View className={styles.progressSection}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressLabel}>任务进度</Text>
          <Text className={styles.progressText}>{store.completedTaskCount}/{store.taskCount}</Text>
        </View>
        <View className={styles.progressBar}>
          <View
            className={`${styles.progressFill} ${
              progress >= 80 ? styles.progressHigh :
              progress >= 40 ? styles.progressMid : styles.progressLow
            }`}
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <View className={styles.metricsGrid}>
        <View className={styles.metricItem}>
          <Text className={styles.metricValue} style={{ color: '#165dff' }}>{metrics.photoDone}</Text>
          <Text className={styles.metricLabel}>📷 已拍照</Text>
        </View>
        <View className={styles.metricItem}>
          <Text className={styles.metricValue} style={{ color: '#f53f3f' }}>{metrics.outOfStock}</Text>
          <Text className={styles.metricLabel}>⚠️ 缺货</Text>
        </View>
        <View className={styles.metricItem}>
          <Text className={styles.metricValue} style={{ color: '#ff7d00' }}>{metrics.pendingRect}</Text>
          <Text className={styles.metricLabel}>🛠️ 待整改</Text>
        </View>
        <View className={styles.metricItem}>
          <Text className={styles.metricValue} style={{ color: '#00b42a' }}>¥{metrics.todaySales >= 1000 ? (metrics.todaySales / 1000).toFixed(1) + 'k' : Math.round(metrics.todaySales)}</Text>
          <Text className={styles.metricLabel}>💰 销量</Text>
        </View>
      </View>

      {store.status === 'pending' && (
        <View className={styles.actionBtn} onClick={handleCheckin}>
          <Text>定位签到</Text>
        </View>
      )}

      {store.status === 'checkin' && (
        <View className={styles.actionRow}>
          <View className={styles.secondaryBtn} onClick={onClick}>
            <Text>继续巡查</Text>
          </View>
          <View className={styles.actionBtn} onClick={handleCheckout}>
            <Text>签退离开</Text>
          </View>
        </View>
      )}

      {store.status === 'completed' && (
        <View className={styles.completedTag}>
          <Text>✓ 已完成</Text>
        </View>
      )}
    </View>
  );
};

export default StoreCard;

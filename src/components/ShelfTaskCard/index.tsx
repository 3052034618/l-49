import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import type { ShelfTask } from '@/types';
import { getStatusText, getStatusColor, getScoreColor } from '@/utils';

interface ShelfTaskCardProps {
  task: ShelfTask;
  onClick?: () => void;
}

const ShelfTaskCard: React.FC<ShelfTaskCardProps> = ({ task, onClick }) => {
  const statusColor = getStatusColor(task.status);
  const scoreColor = task.score > 0 ? getScoreColor(task.score) : '#86909c';

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.taskInfo}>
          <View className={styles.categoryTag}>{task.category}</View>
          <Text className={styles.taskName}>{task.name}</Text>
        </View>
        <View className={styles.statusTag} style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
          {getStatusText(task.status)}
        </View>
      </View>

      <View className={styles.position}>
        <Text className={styles.positionIcon}>📍</Text>
        <Text className={styles.positionText}>{task.position}</Text>
      </View>

      {task.photos.length > 0 && (
        <View className={styles.photoRow}>
          {task.photos.slice(0, 4).map((photo, idx) => (
            <Image
              key={idx}
              src={photo}
              className={styles.photo}
              mode="aspectFill"
            />
          ))}
          {task.photos.length > 4 && (
            <View className={styles.morePhoto}>
              <Text>+{task.photos.length - 4}</Text>
            </View>
          )}
          {task.photos.length === 0 && (
            <View className={styles.emptyPhoto}>
              <Text className={styles.emptyIcon}>📷</Text>
              <Text className={styles.emptyText}>暂无照片</Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <View className={`${styles.dot} ${task.isOutOfStock ? styles.dotRed : styles.dotGreen}`} />
          <Text className={styles.infoLabel}>
            {task.isOutOfStock ? '缺货' : '库存正常'}
          </Text>
        </View>

        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>物料: </Text>
          <Text className={styles.infoValue}>
            {task.materials.filter(m => m.placed).length}/{task.materials.length}
          </Text>
        </View>

        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>评分: </Text>
          <Text className={styles.scoreValue} style={{ color: scoreColor }}>
            {task.score > 0 ? task.score : '--'}
          </Text>
        </View>
      </View>

      {task.auditComment && (
        <View className={styles.auditBox}>
          <Text className={styles.auditLabel}>主管意见：</Text>
          <Text className={styles.auditText}>{task.auditComment}</Text>
        </View>
      )}

      {task.status === 'pending' && (
        <View className={styles.actionBtn}>
          <Text>开始巡查</Text>
        </View>
      )}

      {task.status === 'rejected' && (
        <View className={`${styles.actionBtn} ${styles.retryBtn}`}>
          <Text>重新提交</Text>
        </View>
      )}

      {task.status === 'submitted' && (
        <View className={styles.submittedInfo}>
          <Text>✓ 已提交，等待主管审核</Text>
        </View>
      )}
    </View>
  );
};

export default ShelfTaskCard;

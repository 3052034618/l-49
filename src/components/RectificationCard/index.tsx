import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import type { RectificationItem } from '@/types';
import { getStatusText, getStatusColor, getPriorityText, getPriorityColor } from '@/utils';

interface RectificationCardProps {
  item: RectificationItem;
  onClick?: () => void;
  onFeedback?: () => void;
}

const RectificationCard: React.FC<RectificationCardProps> = ({ item, onClick, onFeedback }) => {
  const statusColor = getStatusColor(item.status);
  const priorityColor = getPriorityColor(item.priority);

  const handleFeedback = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFeedback?.();
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.tagRow}>
          <View
            className={styles.priorityTag}
            style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}
          >
            {getPriorityText(item.priority)}
          </View>
          <View
            className={styles.statusTag}
            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
          >
            {getStatusText(item.status)}
          </View>
        </View>
        <Text className={styles.deadline}>⏰ {item.deadline}</Text>
      </View>

      <View className={styles.title}>{item.title}</View>

      <View className={styles.storeInfo}>
        <Text className={styles.storeName}>{item.storeName}</Text>
        <Text className={styles.shelfName}> · {item.shelfName}</Text>
      </View>

      <View className={styles.description}>
        {item.description}
      </View>

      {item.photos.length > 0 && (
        <View className={styles.photoRow}>
          {item.photos.slice(0, 3).map((photo, idx) => (
            <Image
              key={idx}
              src={photo}
              className={styles.photo}
              mode="aspectFill"
            />
          ))}
        </View>
      )}

      {item.rejectComment && (
        <View className={styles.rejectBox}>
          <Text className={styles.rejectLabel}>❌ 退回原因：</Text>
          <Text className={styles.rejectText}>{item.rejectComment}</Text>
        </View>
      )}

      {item.feedback && (
        <View className={styles.feedbackBox}>
          <Text className={styles.feedbackLabel}>📝 我的反馈：</Text>
          <Text className={styles.feedbackText}>{item.feedback}</Text>
          {item.auditComment && (
            <View className={styles.auditBox}>
              <Text className={styles.auditLabel}>主管审核：</Text>
              <Text
                className={styles.auditText}
                style={{ color: item.auditResult === 'pass' ? '#00b42a' : '#f53f3f' }}
              >
                {item.auditResult === 'pass' ? '✓ 通过' : '✗ 未通过'} - {item.auditComment}
              </Text>
            </View>
          )}
        </View>
      )}

      {(item.status === 'pending' || item.status === 'rejected') && (
        <View className={styles.actionBtn} onClick={handleFeedback}>
          <Text>提交整改反馈</Text>
        </View>
      )}

      {item.status === 'processing' && !item.feedback && (
        <View className={styles.actionBtn} onClick={handleFeedback}>
          <Text>提交整改反馈</Text>
        </View>
      )}

      {item.status === 'completed' && !item.auditResult && (
        <View className={styles.submittedInfo}>
          <Text>⏳ 等待主管审核</Text>
        </View>
      )}
    </View>
  );
};

export default RectificationCard;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';

import styles from './index.module.scss';
import { useApp } from '@/store/app';
import RectificationCard from '@/components/RectificationCard';
import type { RectificationItem } from '@/types';

type FilterType = 'all' | 'pending' | 'processing' | 'completed' | 'approved' | 'rejected';
type ModalType = 'create' | 'detail' | 'feedback' | null;

const RectificationPage: React.FC = () => {
  const { stores, currentStoreId, rectifications, addRectification, updateRectification, shelfTasks } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [currentItem, setCurrentItem] = useState<RectificationItem | null>(null);

  const [form, setForm] = useState({
    storeId: currentStoreId,
    shelfTaskId: '',
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    deadline: '2026-06-12 18:00',
    photos: [] as string[]
  });

  const [feedback, setFeedback] = useState({
    text: '',
    photos: [] as string[]
  });

  const currentStore = useMemo(() => stores.find(s => s.id === currentStoreId), [stores, currentStoreId]);
  const storeTasks = useMemo(() => shelfTasks.filter(t => t.storeId === currentStoreId), [shelfTasks, currentStoreId]);

  const counts = useMemo(() => ({
    all: rectifications.length,
    pending: rectifications.filter(r => r.status === 'pending').length,
    processing: rectifications.filter(r => r.status === 'processing').length,
    completed: rectifications.filter(r => r.status === 'completed').length,
    approved: rectifications.filter(r => r.status === 'approved').length,
    rejected: rectifications.filter(r => r.status === 'rejected').length
  }), [rectifications]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return rectifications;
    return rectifications.filter(r => r.status === filter);
  }, [rectifications, filter]);

  const openCreate = () => {
    setForm({
      storeId: currentStoreId,
      shelfTaskId: storeTasks[0]?.id || '',
      title: '',
      description: '',
      priority: 'medium',
      deadline: '2026-06-12 18:00',
      photos: []
    });
    setModalType('create');
  };

  const openDetail = (item: RectificationItem) => {
    setCurrentItem(item);
    setModalType('detail');
  };

  const openFeedback = (item: RectificationItem) => {
    setCurrentItem(item);
    setFeedback({ text: item.feedback || '', photos: item.feedbackPhotos || [] });
    setModalType('feedback');
  };

  const takePhoto = async (type: 'form' | 'feedback') => {
    try {
      const res = await Taro.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });
      const paths = res.tempFilePaths;
      if (type === 'form') {
        setForm(prev => ({ ...prev, photos: [...prev.photos, ...paths].slice(0, 9) }));
      } else {
        setFeedback(prev => ({ ...prev, photos: [...prev.photos, ...paths].slice(0, 9) }));
      }
    } catch (e) {
      console.error('[Rectification] 拍照失败:', e);
      const demoPhoto = `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/400`;
      if (type === 'form') {
        setForm(prev => ({ ...prev, photos: [...prev.photos, demoPhoto].slice(0, 9) }));
      } else {
        setFeedback(prev => ({ ...prev, photos: [...prev.photos, demoPhoto].slice(0, 9) }));
      }
    }
  };

  const removePhoto = (type: 'form' | 'feedback', idx: number) => {
    if (type === 'form') {
      setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
    } else {
      setFeedback(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
    }
  };

  const submitCreate = () => {
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入整改标题', icon: 'none' });
      return;
    }
    if (!form.description.trim()) {
      Taro.showToast({ title: '请输入问题描述', icon: 'none' });
      return;
    }
    const store = stores.find(s => s.id === form.storeId);
    const task = shelfTasks.find(t => t.id === form.shelfTaskId);
    const newItem: RectificationItem = {
      id: `r${Date.now()}`,
      storeId: form.storeId,
      storeName: store?.name || '',
      shelfName: task?.name || '其他问题',
      title: form.title,
      description: form.description,
      photos: form.photos,
      status: 'pending',
      priority: form.priority,
      deadline: form.deadline,
      createdAt: new Date().toLocaleString('zh-CN')
    };
    addRectification(newItem);
    setModalType(null);
    Taro.showToast({ title: '创建成功', icon: 'success' });
    console.log('[Rectification] 创建整改事项:', newItem);
  };

  const submitFeedback = () => {
    if (!currentItem) return;
    if (!feedback.text.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    const updated: RectificationItem = {
      ...currentItem,
      status: 'completed',
      feedback: feedback.text,
      feedbackPhotos: feedback.photos,
      completedAt: new Date().toLocaleString('zh-CN')
    };
    updateRectification(updated);
    setModalType(null);
    Taro.showToast({ title: '反馈已提交', icon: 'success' });
    console.log('[Rectification] 提交整改反馈:', updated);
  };

  const stats = useMemo(() => [
    { label: '待处理', value: counts.pending, color: '#ff7d00' },
    { label: '处理中', value: counts.processing, color: '#165dff' },
    { label: '已完成', value: counts.completed, color: '#86909c' },
    { label: '已通过', value: counts.approved, color: '#00b42a' }
  ], [counts]);

  return (
    <ScrollView scrollY className={styles.page} refresherEnabled>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>问题整改 🛠️</Text>
        <Text className={styles.pageSubtitle}>记录问题，追踪整改，闭环管理</Text>
      </View>

      <View className={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.label} className={styles.statItem} style={{ borderTop: `6rpx solid ${stat.color}` }}>
            <Text className={styles.statValue} style={{ color: stat.color }}>{stat.value}</Text>
            <Text className={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.tabBar}>
        {[
          { key: 'all', label: `全部(${counts.all})` },
          { key: 'pending', label: `待处理(${counts.pending})` },
          { key: 'processing', label: `处理中(${counts.processing})` },
          { key: 'completed', label: `待审核(${counts.completed})` },
          { key: 'approved', label: `已通过(${counts.approved})` },
          { key: 'rejected', label: `已退回(${counts.rejected})` }
        ].map(tab => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${filter === tab.key ? styles.active : ''}`}
            onClick={() => setFilter(tab.key as FilterType)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.listContainer}>
        <View className={styles.sectionTitle}>
          <Text>📋 整改事项列表</Text>
          <Text style={{ fontSize: 24, color: '#86909c' }}>共 {filteredItems.length} 条</Text>
        </View>
        {filteredItems.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✨</Text>
            <Text className={styles.emptyText}>暂无整改事项</Text>
            <View className={styles.emptyBtn} onClick={openCreate}>
              <Text>+ 创建第一条</Text>
            </View>
          </View>
        ) : (
          filteredItems.map(item => (
            <RectificationCard
              key={item.id}
              item={item}
              onClick={() => openDetail(item)}
              onFeedback={() => openFeedback(item)}
            />
          ))
        )}
      </View>

      <View className={styles.fab} onClick={openCreate}>
        <Text>+</Text>
      </View>

      {modalType === 'create' && (
        <View className={styles.modalMask} onClick={() => setModalType(null)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>创建整改事项</Text>
              <Text className={styles.modalClose} onClick={() => setModalType(null)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>🏪 门店信息</Text>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>所属门店 <Text className={styles.required}>*</Text></Text>
                  <View className={styles.formInput}>
                    <Text>{currentStore?.name || '请选择门店'}</Text>
                  </View>
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>关联货架任务</Text>
                  <View className={styles.formInput}>
                    <Text>{storeTasks.find(t => t.id === form.shelfTaskId)?.name || '未关联（其他问题）'}</Text>
                  </View>
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📝 问题描述</Text>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>整改标题 <Text className={styles.required}>*</Text></Text>
                  <Input
                    className={styles.formInput}
                    placeholder="请简要描述问题，如：堆头陈列不规范"
                    value={form.title}
                    onInput={e => setForm(prev => ({ ...prev, title: e.detail.value }))}
                    maxlength={50}
                  />
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>详细描述 <Text className={styles.required}>*</Text></Text>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="请详细描述问题情况，方便整改跟进..."
                    value={form.description}
                    onInput={e => setForm(prev => ({ ...prev, description: e.detail.value }))}
                    maxlength={500}
                  />
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>问题照片 ({form.photos.length}/9)</Text>
                  <View className={styles.photoGrid}>
                    {form.photos.map((photo, idx) => (
                      <View key={idx} className={styles.photoItem}>
                        <Image src={photo} className={styles.photoImg} mode="aspectFill" />
                        <View className={styles.photoRemove} onClick={() => removePhoto('form', idx)}>×</View>
                      </View>
                    ))}
                    {form.photos.length < 9 && (
                      <View className={styles.photoAdd} onClick={() => takePhoto('form')}>
                        <Text className={styles.addIcon}>📷</Text>
                        <Text className={styles.addText}>拍照上传</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>⚙️ 优先级 & 截止时间</Text>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>优先级</Text>
                  <View className={styles.priorityGroup}>
                    {[
                      { key: 'high', label: '高', desc: '今日完成', color: '#f53f3f', bg: '#ffece8' },
                      { key: 'medium', label: '中', desc: '24小时内', color: '#ff7d00', bg: '#fff7e8' },
                      { key: 'low', label: '低', desc: '3天内完成', color: '#165dff', bg: '#e8f3ff' }
                    ].map(p => (
                      <View
                        key={p.key}
                        className={`${styles.priorityItem} ${form.priority === p.key ? styles.active : ''}`}
                        style={{
                          backgroundColor: form.priority === p.key ? p.bg : undefined,
                          borderColor: form.priority === p.key ? p.color : 'transparent',
                          color: form.priority === p.key ? p.color : '#4e5969'
                        }}
                        onClick={() => setForm(prev => ({ ...prev, priority: p.key as any }))}
                      >
                        <Text className={styles.pLabel} style={{ color: form.priority === p.key ? p.color : '#4e5969' }}>
                          {p.label}优先级
                        </Text>
                        <Text className={styles.pDesc}>{p.desc}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>整改截止时间</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="请选择截止时间"
                    value={form.deadline}
                    onInput={e => setForm(prev => ({ ...prev, deadline: e.detail.value }))}
                  />
                </View>
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.submitBtn} onClick={submitCreate}>
                <Text>创建整改事项</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {modalType === 'feedback' && currentItem && (
        <View className={styles.modalMask} onClick={() => setModalType(null)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>提交整改反馈</Text>
              <Text className={styles.modalClose} onClick={() => setModalType(null)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📝 整改反馈</Text>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>反馈内容 <Text className={styles.required}>*</Text></Text>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="请详细描述整改情况，包括处理方式、完成时间等..."
                    value={feedback.text}
                    onInput={e => setFeedback(prev => ({ ...prev, text: e.detail.value }))}
                    maxlength={500}
                  />
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>整改后照片 ({feedback.photos.length}/9)</Text>
                  <View className={styles.photoGrid}>
                    {feedback.photos.map((photo, idx) => (
                      <View key={idx} className={styles.photoItem}>
                        <Image src={photo} className={styles.photoImg} mode="aspectFill" />
                        <View className={styles.photoRemove} onClick={() => removePhoto('feedback', idx)}>×</View>
                      </View>
                    ))}
                    {feedback.photos.length < 9 && (
                      <View className={styles.photoAdd} onClick={() => takePhoto('feedback')}>
                        <Text className={styles.addIcon}>📷</Text>
                        <Text className={styles.addText}>拍照上传</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>🔍 原始问题回顾</Text>
                <View className={styles.detailSection}>
                  <Text className={styles.sectionLabel}>整改标题</Text>
                  <View className={styles.sectionContent}>{currentItem.title}</View>
                </View>
                <View className={styles.detailSection}>
                  <Text className={styles.sectionLabel}>问题描述</Text>
                  <View className={styles.sectionContent}>{currentItem.description}</View>
                </View>
                {currentItem.photos.length > 0 && (
                  <View className={styles.detailSection}>
                    <Text className={styles.sectionLabel}>问题照片</Text>
                    <View className={styles.photoList}>
                      {currentItem.photos.map((p, i) => (
                        <Image key={i} src={p} className={styles.photo} mode="aspectFill" />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.submitBtn} onClick={submitFeedback}>
                <Text>提交整改反馈</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {modalType === 'detail' && currentItem && (
        <View className={styles.modalMask} onClick={() => setModalType(null)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>整改详情</Text>
              <Text className={styles.modalClose} onClick={() => setModalType(null)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.detailHeader}>
                <Text className={styles.detailTitle}>{currentItem.title}</Text>
                <View className={styles.detailMeta}>
                  <Text className={styles.metaItem}>⏰ 截止: {currentItem.deadline}</Text>
                  <Text className={styles.metaItem}>📅 创建: {currentItem.createdAt}</Text>
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📋 问题信息</Text>
                <View className={styles.detailSection}>
                  <Text className={styles.sectionLabel}>门店</Text>
                  <View className={styles.sectionContent}>{currentItem.storeName}</View>
                </View>
                <View className={styles.detailSection}>
                  <Text className={styles.sectionLabel}>货架/区域</Text>
                  <View className={styles.sectionContent}>{currentItem.shelfName}</View>
                </View>
                <View className={styles.detailSection}>
                  <Text className={styles.sectionLabel}>问题描述</Text>
                  <View className={styles.sectionContent}>{currentItem.description}</View>
                </View>
                {currentItem.photos.length > 0 && (
                  <View className={styles.detailSection}>
                    <Text className={styles.sectionLabel}>问题照片</Text>
                    <View className={styles.photoList}>
                      {currentItem.photos.map((p, i) => (
                        <Image key={i} src={p} className={styles.photo} mode="aspectFill" />
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {currentItem.feedback && (
                <View className={styles.formSection}>
                  <Text className={styles.sectionHeader}>✅ 整改反馈</Text>
                  <View className={styles.detailSection}>
                    <Text className={styles.sectionLabel}>反馈内容</Text>
                    <View className={styles.sectionContent}>{currentItem.feedback}</View>
                  </View>
                  {currentItem.feedbackPhotos?.length ? (
                    <View className={styles.detailSection}>
                      <Text className={styles.sectionLabel}>整改照片</Text>
                      <View className={styles.photoList}>
                        {currentItem.feedbackPhotos.map((p, i) => (
                          <Image key={i} src={p} className={styles.photo} mode="aspectFill" />
                        ))}
                      </View>
                    </View>
                  ) : null}
                  {currentItem.completedAt && (
                    <View className={styles.detailSection}>
                      <Text className={styles.sectionLabel}>完成时间</Text>
                      <View className={styles.sectionContent}>{currentItem.completedAt}</View>
                    </View>
                  )}
                  {currentItem.auditComment && (
                    <View className={styles.detailSection}>
                      <Text className={styles.sectionLabel}>
                        主管审核 {currentItem.auditResult === 'pass' ? '✓ 通过' : '✗ 未通过'}
                      </Text>
                      <View
                        className={styles.sectionContent}
                        style={{
                          background: currentItem.auditResult === 'pass' ? '#e8ffea' : '#ffece8',
                          color: currentItem.auditResult === 'pass' ? '#00b42a' : '#f53f3f'
                        }}
                      >
                        {currentItem.auditComment}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {currentItem.rejectComment && (
                <View className={styles.formSection} style={{ background: '#ffece8' }}>
                  <Text className={styles.sectionHeader} style={{ color: '#f53f3f' }}>❌ 退回意见</Text>
                  <View className={styles.sectionContent} style={{ background: '#fff' }}>
                    {currentItem.rejectComment}
                  </View>
                </View>
              )}
            </ScrollView>
            {(currentItem.status === 'pending' || currentItem.status === 'rejected') && (
              <View className={styles.modalFooter}>
                <View className={styles.submitBtn} onClick={() => { setModalType(null); openFeedback(currentItem); }}>
                  <Text>去提交整改反馈</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default RectificationPage;

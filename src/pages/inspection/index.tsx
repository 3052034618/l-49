import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, Input, Textarea, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';

import styles from './index.module.scss';
import { useApp } from '@/store/app';
import ShelfTaskCard from '@/components/ShelfTaskCard';
import type { ShelfTask, CompetitorPrice, MaterialItem } from '@/types';
import { getScoreColor } from '@/utils';

type FilterType = 'all' | 'pending' | 'submitted' | 'approved' | 'rejected';

const defaultMaterials: MaterialItem[] = [
  { name: '品牌海报', placed: true },
  { name: '价格标签', placed: true },
  { name: '跳跳卡', placed: false },
  { name: '端架展示', placed: false },
  { name: '试吃台', placed: false }
];

const InspectionPage: React.FC = () => {
  const { stores, shelfTasks, currentStoreId, setCurrentStoreId, updateShelfTask } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<ShelfTask | null>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState('');
  const [competitors, setCompetitors] = useState<CompetitorPrice[]>([
    { brand: '', product: '', price: 0, promotion: '' }
  ]);
  const [materials, setMaterials] = useState<MaterialItem[]>(defaultMaterials);
  const [score, setScore] = useState(85);
  const [remark, setRemark] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockChecked, setStockChecked] = useState(false);

  const currentStore = useMemo(
    () => stores.find(s => s.id === currentStoreId) || stores[0],
    [stores, currentStoreId]
  );

  const storeTasks = useMemo(
    () => shelfTasks.filter(t => t.storeId === currentStoreId),
    [shelfTasks, currentStoreId]
  );

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return storeTasks;
    return storeTasks.filter(t => t.status === filter);
  }, [storeTasks, filter]);

  const stats = useMemo(() => {
    const total = storeTasks.length;
    const done = storeTasks.filter(t => t.status !== 'pending').length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  }, [storeTasks]);

  const counts = useMemo(() => ({
    all: storeTasks.length,
    pending: storeTasks.filter(t => t.status === 'pending').length,
    submitted: storeTasks.filter(t => t.status === 'submitted').length,
    approved: storeTasks.filter(t => t.status === 'approved').length,
    rejected: storeTasks.filter(t => t.status === 'rejected').length
  }), [storeTasks]);

  const openTaskModal = (task: ShelfTask) => {
    setCurrentTask(task);
    setPhotos(task.photos || []);
    setIsOutOfStock(task.isOutOfStock);
    setOutOfStockItems((task.outOfStockItems || []).join('、'));
    setCompetitors(task.competitorPrices?.length ? task.competitorPrices : [{ brand: '', product: '', price: 0, promotion: '' }]);
    setMaterials(task.materials?.length ? task.materials.map(m => ({ ...m })) : defaultMaterials.map(m => ({ ...m })));
    setScore(task.score || 85);
    setRemark(task.remark || '');
    setStockChecked(task.status !== 'pending');
    setShowTaskModal(true);
  };

  const takePhoto = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - photos.length,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });
      console.log('[Inspection] 选择图片:', res.tempFilePaths.length);
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setPhotos(prev => [...prev, ...res.tempFilePaths]);
        if (!stockChecked) {
          setTimeout(() => setShowStockModal(true), 300);
        }
      }
    } catch (e) {
      console.log('[Inspection] 拍照取消或失败:', e);
    }
  };

  const confirmStockNormal = () => {
    setIsOutOfStock(false);
    setStockChecked(true);
    setShowStockModal(false);
    Taro.showToast({ title: '库存已确认为正常', icon: 'success' });
  };

  const confirmOutOfStock = () => {
    setIsOutOfStock(true);
    setShowStockModal(false);
  };

  const submitOutOfStockItems = () => {
    if (!outOfStockItems.trim()) {
      Taro.showToast({ title: '请填写缺货商品', icon: 'none' });
      return;
    }
    setStockChecked(true);
    Taro.showToast({ title: '缺货商品已记录', icon: 'success' });
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleMaterial = (idx: number) => {
    setMaterials(prev => prev.map((m, i) => (i === idx ? { ...m, placed: !m.placed } : m)));
  };

  const updateCompetitor = (idx: number, field: keyof CompetitorPrice, value: string | number) => {
    setCompetitors(prev => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const addCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors(prev => [...prev, { brand: '', product: '', price: 0, promotion: '' }]);
    }
  };

  const getScoreLevel = () => {
    if (score >= 90) return { text: '优秀', color: '#00b42a', bg: '#e8ffea' };
    if (score >= 80) return { text: '良好', color: '#165dff', bg: '#e8f3ff' };
    if (score >= 70) return { text: '合格', color: '#ff7d00', bg: '#fff7e8' };
    return { text: '待改进', color: '#f53f3f', bg: '#ffece8' };
  };

  const submitTask = () => {
    if (!currentTask) return;
    if (photos.length === 0) {
      Taro.showToast({ title: '请上传照片', icon: 'none' });
      return;
    }
    if (!stockChecked) {
      Taro.showToast({ title: '请先完成库存状态确认', icon: 'none' });
      setShowStockModal(true);
      return;
    }
    if (isOutOfStock && !outOfStockItems.trim()) {
      Taro.showToast({ title: '标记缺货时必须填写缺货商品', icon: 'none' });
      return;
    }
    const level = getScoreLevel();
    const updated: ShelfTask = {
      ...currentTask,
      photos,
      isOutOfStock,
      outOfStockItems: isOutOfStock && outOfStockItems ? outOfStockItems.split(/[、,，]/).filter(Boolean) : undefined,
      competitorPrices: competitors.filter(c => c.brand && c.product),
      materials,
      score,
      remark,
      status: 'submitted',
      createdAt: new Date().toLocaleString('zh-CN')
    };
    updateShelfTask(updated);
    setShowTaskModal(false);
    Taro.showToast({ title: '提交成功', icon: 'success' });
    console.log('[Inspection] 任务已提交:', updated);
  };

  return (
    <ScrollView scrollY className={styles.page} refresherEnabled>
      <View className={styles.header}>
        <View className={styles.currentStore}>
          <Text className={styles.storeLabel}>当前巡查门店</Text>
          <Text className={styles.storeName}>{currentStore?.name || '请选择门店'}</Text>
          <View className={styles.storeMeta}>
            <Text className={styles.metaItem}>📍 {currentStore?.distance || '--'}</Text>
            <Text className={styles.metaItem}>📋 {stats.done}/{stats.total} 任务</Text>
            <Text className={styles.metaItem}>📊 均分 {storeTasks.filter(t => t.score > 0).length > 0 ? Math.round(storeTasks.filter(t => t.score > 0).reduce((a, b) => a + b.score, 0) / storeTasks.filter(t => t.score > 0).length) : '--'}</Text>
          </View>
        </View>
        <View className={styles.storeSelect} onClick={() => setShowStoreModal(true)}>
          <Text className={styles.selectLabel}>🔄 切换门店</Text>
          <Text className={styles.selectArrow}>▼</Text>
        </View>
      </View>

      <View className={styles.progressBanner}>
        <View className={styles.progressInfo}>
          <Text className={styles.progressTitle}>门店巡查进度</Text>
          <View className={styles.progressDetail}>
            <Text className={styles.progressDone}>{stats.done}</Text>
            <Text className={styles.progressTotal}> / {stats.total} 项</Text>
          </View>
          <Text className={styles.progressPercent}>已完成 {stats.percent}%</Text>
        </View>
        <View
          className={styles.progressCircle}
          style={{ background: `conic-gradient(#165dff 0% ${stats.percent}%, #f2f3f5 ${stats.percent}% 100%)` }}
        >
          <View className={styles.circleInner}>
            <Text>{stats.percent}%</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabBar}>
        {[
          { key: 'all', label: `全部(${counts.all})` },
          { key: 'pending', label: `待巡查(${counts.pending})` },
          { key: 'submitted', label: `待审核(${counts.submitted})` },
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

      <View className={styles.taskList}>
        <View className={styles.sectionTitle}>
          <Text>🗂️ 货架巡查任务</Text>
        </View>
        {filteredTasks.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📷</Text>
            <Text className={styles.emptyText}>暂无任务</Text>
            <Text className={styles.emptyHint}>切换门店或新建任务开始巡查</Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <ShelfTaskCard
              key={task.id}
              task={task}
              onClick={() => openTaskModal(task)}
            />
          ))
        )}
      </View>

      {showTaskModal && currentTask && (
        <View className={styles.modalMask} onClick={() => setShowTaskModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>{currentTask.name}</Text>
              <Text className={styles.modalClose} onClick={() => setShowTaskModal(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📸 货架照片 ({photos.length}/9)</Text>
                <View className={styles.photoGrid}>
                  {photos.map((photo, idx) => (
                    <View key={idx} className={styles.photoItem}>
                      <Image src={photo} className={styles.photoImg} mode="aspectFill" />
                      <View className={styles.photoRemove} onClick={() => removePhoto(idx)}>×</View>
                    </View>
                  ))}
                  {photos.length < 9 && (
                    <View className={styles.photoAdd} onClick={takePhoto}>
                      <Text className={styles.addIcon}>📷</Text>
                      <Text className={styles.addText}>拍照/上传</Text>
                    </View>
                  )}
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📦 库存状态确认</Text>
                <View className={styles.switchRow}>
                  <Text className={styles.switchLabel}>库存状态</Text>
                  <Text
                    className={styles.switchValue}
                    style={{ color: !stockChecked ? '#ff7d00' : isOutOfStock ? '#f53f3f' : '#00b42a', fontWeight: 600 }}
                  >
                    {!stockChecked ? '待确认' : isOutOfStock ? '缺货' : '正常'}
                  </Text>
                </View>
                {!stockChecked && (
                  <View
                    className={styles.formInput}
                    style={{
                      marginTop: 16,
                      background: '#fff7e8',
                      border: '2rpx dashed #ff7d00',
                      textAlign: 'center',
                      color: '#ff7d00',
                      fontWeight: 600
                    }}
                    onClick={() => setShowStockModal(true)}
                  >
                    <Text>🔍 点击确认库存状态</Text>
                  </View>
                )}
                {stockChecked && (
                  <View style={{ marginTop: 16 }}>
                    <View className={styles.switchRow}>
                      <Text className={styles.switchLabel}>已确认结果</Text>
                      <Text
                        style={{
                          padding: '8rpx 24rpx',
                          borderRadius: 24,
                          fontSize: 24,
                          background: isOutOfStock ? '#ffece8' : '#e8ffea',
                          color: isOutOfStock ? '#f53f3f' : '#00b42a'
                        }}
                      >
                        {isOutOfStock ? `⚠️ 缺货：${(outOfStockItems || '').split('、').filter(Boolean).length} 项` : '✅ 库存充足'}
                      </Text>
                    </View>
                    <View
                      className={styles.formInput}
                      style={{
                        marginTop: 16,
                        textAlign: 'center',
                        color: '#86909c',
                        border: '2rpx solid #e5e6eb'
                      }}
                      onClick={() => setShowStockModal(true)}
                    >
                      <Text>重新确认库存</Text>
                    </View>
                  </View>
                )}
                {isOutOfStock && (
                  <View className={styles.formRow} style={{ marginTop: 24 }}>
                    <Text className={styles.formLabel}>缺货商品 <Text className={styles.required}>*</Text></Text>
                    <Textarea
                      className={styles.formTextarea}
                      placeholder="请输入缺货SKU，多个用顿号分隔（如：可乐330ml、雪碧500ml）"
                      value={outOfStockItems}
                      onInput={e => setOutOfStockItems(e.detail.value)}
                      onBlur={() => {
                        if (outOfStockItems.trim()) setStockChecked(true);
                      }}
                    />
                  </View>
                )}
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>🏷️ 竞品价格</Text>
                {competitors.map((comp, idx) => (
                  <View key={idx}>
                    <View className={styles.competitorRow}>
                      <Input
                        className={styles.compInput}
                        placeholder="品牌名称"
                        value={comp.brand}
                        onInput={e => updateCompetitor(idx, 'brand', e.detail.value)}
                      />
                      <Input
                        className={styles.compInput}
                        placeholder="商品规格"
                        value={comp.product}
                        onInput={e => updateCompetitor(idx, 'product', e.detail.value)}
                      />
                    </View>
                    <View className={styles.competitorRow}>
                      <Input
                        className={styles.compInput}
                        type="digit"
                        placeholder="售价(元)"
                        value={String(comp.price || '')}
                        onInput={e => updateCompetitor(idx, 'price', Number(e.detail.value) || 0)}
                      />
                      <Input
                        className={styles.compInput}
                        placeholder="促销信息(选填)"
                        value={comp.promotion || ''}
                        onInput={e => updateCompetitor(idx, 'promotion', e.detail.value)}
                      />
                    </View>
                  </View>
                ))}
                {competitors.length < 5 && (
                  <View className={styles.formInput} style={{ textAlign: 'center', marginTop: 16 }} onClick={addCompetitor}>
                    <Text style={{ color: '#165dff' }}>+ 添加竞品</Text>
                  </View>
                )}
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>🎯 促销物料摆放</Text>
                {materials.map((mat, idx) => (
                  <View key={idx} className={styles.switchRow}>
                    <Text className={styles.switchLabel}>{mat.name}</Text>
                    <View
                      className={`${styles.tagItem} ${mat.placed ? styles.active : ''}`}
                      onClick={() => toggleMaterial(idx)}
                    >
                      <Text>{mat.placed ? '✓ 已摆放' : '未摆放'}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>⭐ 陈列评分</Text>
                <View className={styles.scoreSlider}>
                  <View className={styles.scoreRow}>
                    <Text className={styles.scoreNum} style={{ color: getScoreColor(score) }}>
                      {score}
                    </Text>
                    <View
                      className={styles.scoreLevel}
                      style={{ color: getScoreLevel().color, backgroundColor: getScoreLevel().bg }}
                    >
                      {getScoreLevel().text}
                    </View>
                  </View>
                  <View
                    className={styles.sliderTrack}
                    onClick={e => {
                      const target = e.currentTarget;
                      const rect = target.getBoundingClientRect?.() || { width: 300, left: 0 };
                      const x = (e.touches?.[0]?.clientX || e.clientX || 150) - rect.left;
                      const percent = Math.max(0, Math.min(1, x / rect.width));
                      setScore(Math.round(60 + percent * 40));
                    }}
                  >
                    <View
                      className={styles.sliderFill}
                      style={{
                        width: `${((score - 60) / 40) * 100}%`,
                        background: `linear-gradient(90deg, ${getScoreColor(60)}, ${getScoreColor(score)})`
                      }}
                    />
                    <View
                      className={styles.sliderThumb}
                      style={{ left: `${((score - 60) / 40) * 100}%`, borderColor: getScoreColor(score) }}
                    />
                  </View>
                  <View className={styles.scoreLabels}>
                    <Text>60</Text><Text>70</Text><Text>80</Text><Text>90</Text><Text>100</Text>
                  </View>
                </View>
                <View className={styles.scoreCriteria}>
                  {[
                    { name: '陈列整齐度', score: Math.round(score * 0.3) },
                    { name: '商品丰满度', score: Math.round(score * 0.25) },
                    { name: '物料完整性', score: Math.round(score * 0.2) },
                    { name: '价格标识', score: Math.round(score * 0.15) },
                    { name: '创意展示', score: Math.round(score * 0.1) }
                  ].map((item, idx) => (
                    <View key={idx} className={styles.criterionItem}>
                      <Text className={styles.criterionName}>{item.name}</Text>
                      <View className={styles.criterionScore}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Text key={s} className={styles.star}>
                            {s <= Math.ceil(item.score / 20) ? '⭐' : '☆'}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📝 巡查备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请输入巡查备注、问题描述或特殊说明..."
                  value={remark}
                  onInput={e => setRemark(e.detail.value)}
                  maxlength={500}
                />
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.submitBtn} onClick={submitTask}>
                <Text>提交巡查结果</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showStockModal && (
        <View className={styles.modalMask} onClick={() => setShowStockModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', bottom: 0, top: 'auto' }}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>🔍 库存状态识别确认</Text>
              <Text className={styles.modalClose} onClick={() => setShowStockModal(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View style={{ padding: '16rpx 32rpx' }}>
                <View style={{
                  padding: 24,
                  borderRadius: 16,
                  background: '#f7f8fa',
                  marginBottom: 32
                }}>
                  <Text style={{ color: '#4e5969', fontSize: 26, lineHeight: '40rpx' }}>
                    请根据刚拍摄的货架照片，确认当前货架的库存情况。系统将把您的判断作为陈列评分依据之一。
                  </Text>
                </View>

                <Text style={{ fontSize: 30, fontWeight: 600, marginBottom: 24, color: '#1d2129' }}>请选择库存状态：</Text>

                <View
                  style={{
                    padding: 32,
                    borderRadius: 20,
                    border: `4rpx solid ${!isOutOfStock ? '#00b42a' : '#e5e6eb'}`,
                    background: !isOutOfStock ? '#e8ffea' : '#fff',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onClick={confirmStockNormal}
                >
                  <Text style={{ fontSize: 60, marginRight: 24 }}>✅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 32, fontWeight: 700, color: !isOutOfStock ? '#00b42a' : '#1d2129' }}>
                      库存正常
                    </Text>
                    <Text style={{ fontSize: 24, color: '#86909c', marginTop: 8 }}>
                      货架陈列丰满，无明显缺货SKU
                    </Text>
                  </View>
                  {!isOutOfStock && <Text style={{ fontSize: 40, color: '#00b42a' }}>✓</Text>}
                </View>

                <View
                  style={{
                    padding: 32,
                    borderRadius: 20,
                    border: `4rpx solid ${isOutOfStock ? '#f53f3f' : '#e5e6eb'}`,
                    background: isOutOfStock ? '#ffece8' : '#fff',
                    marginBottom: 32
                  }}
                  onClick={confirmOutOfStock}
                >
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ fontSize: 60, marginRight: 24 }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 32, fontWeight: 700, color: isOutOfStock ? '#f53f3f' : '#1d2129' }}>
                        存在缺货
                      </Text>
                      <Text style={{ fontSize: 24, color: '#86909c', marginTop: 8 }}>
                        有空缺位置或SKU不足，需详细记录
                      </Text>
                    </View>
                    {isOutOfStock && <Text style={{ fontSize: 40, color: '#f53f3f' }}>✓</Text>}
                  </View>
                </View>

                {isOutOfStock && (
                  <View style={{ padding: 24, borderRadius: 16, background: '#fff7e8', marginBottom: 32 }}>
                    <Text style={{ fontSize: 28, fontWeight: 600, color: '#ff7d00', marginBottom: 16 }}>
                      📝 请填写缺货商品（必填）
                    </Text>
                    <Textarea
                      className={styles.formTextarea}
                      placeholder="如：可乐330ml、雪碧500ml、芬达橙味..."
                      value={outOfStockItems}
                      onInput={e => setOutOfStockItems(e.detail.value)}
                      style={{ minHeight: 160, marginTop: 0 }}
                    />
                    <View
                      style={{
                        marginTop: 20,
                        padding: '20rpx 32rpx',
                        borderRadius: 12,
                        background: outOfStockItems.trim() ? '#00b42a' : '#c9cdd4',
                        textAlign: 'center'
                      }}
                      onClick={submitOutOfStockItems}
                    >
                      <Text style={{ color: '#fff', fontWeight: 600, fontSize: 28 }}>
                        确认并记录缺货商品
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {showStoreModal && (
        <View className={styles.modalMask} onClick={() => setShowStoreModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择门店</Text>
              <Text className={styles.modalClose} onClick={() => setShowStoreModal(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {stores.map(store => (
                <View
                  key={store.id}
                  className={`${styles.formInput} ${store.id === currentStoreId ? styles.active : ''}`}
                  style={{
                    marginBottom: 16,
                    border: store.id === currentStoreId ? '2rpx solid #165dff' : 'none',
                    background: store.id === currentStoreId ? '#e8f3ff' : '#fff'
                  }}
                  onClick={() => {
                    setCurrentStoreId(store.id);
                    setShowStoreModal(false);
                  }}
                >
                  <View style={{ fontWeight: 600, color: '#1d2129' }}>{store.name}</View>
                  <View style={{ fontSize: 24, color: '#86909c', marginTop: 8 }}>
                    {store.distance} · {store.address}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default InspectionPage;

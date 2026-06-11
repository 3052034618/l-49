import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/app';
import type { SalesProduct, SalesRecord } from '@/types';
import { formatCurrency } from '@/utils';

const defaultProducts: SalesProduct[] = [
  { name: '经典可乐500ml*24瓶', sku: 'SKU001', quantity: 0, price: 48, amount: 0 },
  { name: '无糖可乐500ml*24瓶', sku: 'SKU002', quantity: 0, price: 52, amount: 0 }
];

const SalesPage: React.FC = () => {
  const { stores, currentStoreId, salesRecords, addSalesRecord, setCurrentStoreId } = useApp();
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentDetail, setCurrentDetail] = useState<SalesRecord | null>(null);

  const [products, setProducts] = useState<SalesProduct[]>(defaultProducts.map(p => ({ ...p })));
  const [remark, setRemark] = useState('');

  const currentStore = useMemo(() => stores.find(s => s.id === currentStoreId) || stores[0], [stores, currentStoreId]);

  const storeRecords = useMemo(() => salesRecords.filter(r => r.storeId === currentStoreId), [salesRecords, currentStoreId]);

  const totals = useMemo(() => {
    const allRecords = salesRecords;
    const totalAmount = allRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalStores = new Set(allRecords.map(r => r.storeId)).size;
    const todayAmount = salesRecords
      .filter(r => r.date === '2026-06-11')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    return { totalAmount, totalStores, todayAmount };
  }, [salesRecords]);

  const totalCurrentAmount = useMemo(
    () => products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [products]
  );

  const updateProduct = (idx: number, field: keyof SalesProduct, value: string | number) => {
    setProducts(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const updated = { ...p, [field]: value };
      if (field === 'quantity' || field === 'price') {
        const qty = Number(field === 'quantity' ? value : p.quantity) || 0;
        const price = Number(field === 'price' ? value : p.price) || 0;
        updated.amount = Math.round(qty * price * 100) / 100;
      }
      return updated;
    }));
  };

  const addProduct = () => {
    setProducts(prev => [...prev, { name: '', sku: '', quantity: 0, price: 0, amount: 0 }]);
  };

  const removeProduct = (idx: number) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const openRecordModal = () => {
    setProducts(defaultProducts.map(p => ({ ...p })));
    setRemark('');
    setShowRecordModal(true);
  };

  const submitRecord = () => {
    const validProducts = products.filter(p => p.name.trim() && p.quantity > 0);
    if (validProducts.length === 0) {
      Taro.showToast({ title: '请添加至少一个销量商品', icon: 'none' });
      return;
    }
    const total = validProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const record: SalesRecord = {
      id: `sale${Date.now()}`,
      storeId: currentStoreId,
      storeName: currentStore?.name || '',
      date: '2026-06-11',
      products: validProducts,
      totalAmount: Math.round(total * 100) / 100,
      remark,
      createdAt: new Date().toLocaleString('zh-CN')
    };
    addSalesRecord(record);
    setShowRecordModal(false);
    Taro.showToast({ title: '已录入', icon: 'success' });
    console.log('[Sales] 销量已录入:', record);
  };

  const openDetail = (record: SalesRecord) => {
    setCurrentDetail(record);
    setShowDetailModal(true);
  };

  return (
    <ScrollView scrollY className={styles.page} refresherEnabled>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>销量备注 💰</Text>
        <Text className={styles.pageSubtitle}>记录每日销量，跟踪销售目标</Text>
      </View>

      <View className={styles.summaryRow}>
        <View className={styles.summaryCard}>
          <Text className={styles.sValue} style={{ color: '#00b42a' }}>
            {formatCurrency(totals.todayAmount).replace('¥', '¥')}
          </Text>
          <Text className={styles.sLabel}>今日销售额</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.sValue} style={{ color: '#165dff' }}>{totals.totalStores}</Text>
          <Text className={styles.sLabel}>已录门店</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.sValue} style={{ color: '#ff7d00' }}>{salesRecords.length}</Text>
          <Text className={styles.sLabel}>销量记录</Text>
        </View>
      </View>

      <View className={styles.storeSelectBar} onClick={() => setShowStoreModal(true)}>
        <View className={styles.storeInfo}>
          <Text className={styles.sLabel}>当前录入门店</Text>
          <Text className={styles.sName}>{currentStore?.name || '请选择门店'}</Text>
        </View>
        <Text className={styles.selectArrow}>▼ 切换</Text>
      </View>

      <View className={styles.recordList}>
        <View className={styles.sectionTitle}>
          <Text>📋 销量记录</Text>
          <Text style={{ fontSize: 24, color: '#86909c' }}>{currentStore?.name || ''}</Text>
        </View>
        {storeRecords.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📦</Text>
            <Text className={styles.emptyText}>该门店暂无销量记录</Text>
            <View className={styles.emptyBtn} onClick={openRecordModal}>
              <Text>+ 录入今日销量</Text>
            </View>
          </View>
        ) : (
          storeRecords.map(record => (
            <View key={record.id} className={styles.recordCard} onClick={() => openDetail(record)}>
              <View className={styles.recordHeader}>
                <View className={styles.recordStore}>
                  <Text className={styles.rName}>{record.storeName}</Text>
                  <Text className={styles.rTime}>📅 {record.date} · 录入于 {record.createdAt}</Text>
                </View>
                <View className={styles.recordAmount}>
                  <Text className={styles.aValue}>{formatCurrency(record.totalAmount)}</Text>
                  <Text className={styles.aLabel}>{record.products.length} 个SKU</Text>
                </View>
              </View>
              <View className={styles.productList}>
                {record.products.slice(0, 3).map(p => (
                  <View key={p.sku} className={styles.productRow}>
                    <View className={styles.productName}>
                      <Text className={styles.pName}>{p.name}</Text>
                      <Text className={styles.pSku}>{p.sku}</Text>
                    </View>
                    <Text className={styles.productQty}>x{p.quantity}</Text>
                    <Text className={styles.productAmount}>{formatCurrency(p.amount)}</Text>
                  </View>
                ))}
                {record.products.length > 3 && (
                  <View style={{ textAlign: 'center', padding: 12, color: '#86909c', fontSize: 24 }}>
                    ... 还有 {record.products.length - 3} 个商品，点击查看全部
                  </View>
                )}
              </View>
              {record.remark && (
                <View className={styles.recordRemark}>
                  <Text className={styles.remarkLabel}>📝 备注：</Text>
                  <Text>{record.remark}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View className={styles.fab} onClick={openRecordModal}>
        <Text>+</Text>
      </View>

      {showRecordModal && (
        <View className={styles.modalMask} onClick={() => setShowRecordModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>录入销量 - {currentStore?.name}</Text>
              <Text className={styles.modalClose} onClick={() => setShowRecordModal(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📦 商品明细</Text>
                {products.map((p, idx) => (
                  <View key={idx} className={styles.productItem}>
                    {products.length > 1 && (
                      <Text className={styles.removeBtn} onClick={() => removeProduct(idx)}>×</Text>
                    )}
                    <View className={styles.formRow}>
                      <Text className={styles.formLabel}>商品名称 <Text className={styles.required}>*</Text></Text>
                      <Input
                        className={styles.formInput}
                        placeholder="请输入商品名称和规格"
                        value={p.name}
                        onInput={e => updateProduct(idx, 'name', e.detail.value)}
                      />
                    </View>
                    <View className={styles.productGrid}>
                      <View className={styles.productField}>
                        <Text className={styles.fieldLabel}>SKU编码</Text>
                        <Input
                          className={styles.fieldInput}
                          placeholder="SKU"
                          value={p.sku}
                          onInput={e => updateProduct(idx, 'sku', e.detail.value)}
                        />
                      </View>
                      <View className={styles.productField}>
                        <Text className={styles.fieldLabel}>数量*</Text>
                        <Input
                          className={styles.fieldInput}
                          type="number"
                          placeholder="0"
                          value={String(p.quantity || '')}
                          onInput={e => updateProduct(idx, 'quantity', Number(e.detail.value) || 0)}
                        />
                      </View>
                      <View className={styles.productField}>
                        <Text className={styles.fieldLabel}>单价(元)*</Text>
                        <Input
                          className={styles.fieldInput}
                          type="digit"
                          placeholder="0.00"
                          value={String(p.price || '')}
                          onInput={e => updateProduct(idx, 'price', Number(e.detail.value) || 0)}
                        />
                      </View>
                    </View>
                    {p.amount > 0 && (
                      <View style={{ marginTop: 12, textAlign: 'right', fontSize: 26, color: '#00b42a', fontWeight: 600 }}>
                        小计: {formatCurrency(p.amount)}
                      </View>
                    )}
                  </View>
                ))}
                <View className={styles.addProductBtn} onClick={addProduct}>
                  <Text>+ 添加商品</Text>
                </View>
                <View className={styles.totalsBar}>
                  <Text className={styles.totalLabel}>合计金额</Text>
                  <Text className={styles.totalValue}>{formatCurrency(totalCurrentAmount)}</Text>
                </View>
              </View>

              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📝 销售备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="记录今日销售情况：热销商品、库存预警、活动效果、竞品动态等..."
                  value={remark}
                  onInput={e => setRemark(e.detail.value)}
                  maxlength={500}
                />
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.submitBtn} onClick={submitRecord}>
                <Text>提交销量记录</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showDetailModal && currentDetail && (
        <View className={styles.modalMask} onClick={() => setShowDetailModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>销量详情</Text>
              <Text className={styles.modalClose} onClick={() => setShowDetailModal(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formSection}>
                <View className={styles.totalsBar}>
                  <Text className={styles.totalLabel}>销售总额</Text>
                  <Text className={styles.totalValue}>{formatCurrency(currentDetail.totalAmount)}</Text>
                </View>
                <View style={{ margin: 16, fontSize: 24, color: '#86909c' }}>
                  📅 {currentDetail.date} · {currentDetail.storeName} · 录入于 {currentDetail.createdAt}
                </View>
              </View>
              <View className={styles.formSection}>
                <Text className={styles.sectionHeader}>📦 商品明细 ({currentDetail.products.length}个SKU)</Text>
                {currentDetail.products.map((p, idx) => (
                  <View key={idx} className={styles.productRow} style={{ padding: '16px 0', borderBottom: idx < currentDetail.products.length - 1 ? '1rpx dashed #f2f3f5' : 'none' }}>
                    <View className={styles.productName}>
                      <Text className={styles.pName} style={{ fontSize: 28, fontWeight: 500 }}>{p.name}</Text>
                      <Text className={styles.pSku}>SKU: {p.sku} · 单价: {formatCurrency(p.price)}</Text>
                    </View>
                    <Text className={styles.productQty} style={{ fontSize: 28, color: '#165dff' }}>x{p.quantity}</Text>
                    <Text className={styles.productAmount} style={{ fontSize: 28 }}>{formatCurrency(p.amount)}</Text>
                  </View>
                ))}
              </View>
              {currentDetail.remark && (
                <View className={styles.formSection}>
                  <Text className={styles.sectionHeader}>📝 销售备注</Text>
                  <View style={{ padding: 16, background: '#f5f6f7', borderRadius: 12, fontSize: 28, lineHeight: 1.6, color: '#4e5969' }}>
                    {currentDetail.remark}
                  </View>
                </View>
              )}
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
                  className={styles.formInput}
                  style={{
                    marginBottom: 16,
                    border: store.id === currentStoreId ? '2rpx solid #00b42a' : 'none',
                    background: store.id === currentStoreId ? '#e8ffea' : '#fff'
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

export default SalesPage;

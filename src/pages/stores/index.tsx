import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

import styles from './index.module.scss';
import { useApp } from '@/store/app';
import StoreCard from '@/components/StoreCard';
import StatCard from '@/components/StatCard';

type FilterType = 'all' | 'pending' | 'checkin' | 'completed';

const StoresPage: React.FC = () => {
  const { stores, user, shelfTasks, checkinStore, checkoutStore, setCurrentStoreId } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');

  const todayStats = useMemo(() => {
    const total = stores.length;
    const completed = stores.filter(s => s.status === 'completed').length;
    const checkin = stores.filter(s => s.status === 'checkin').length;
    const pending = stores.filter(s => s.status === 'pending').length;
    const totalTasks = shelfTasks.length;
    const doneTasks = shelfTasks.filter(t => t.status === 'approved' || t.status === 'submitted').length;
    return { total, completed, checkin, pending, totalTasks, doneTasks };
  }, [stores, shelfTasks]);

  const filteredStores = useMemo(() => {
    if (filter === 'all') return stores;
    return stores.filter(s => s.status === filter);
  }, [stores, filter]);

  const handleCheckin = async (storeId: string) => {
    try {
      const res = await Taro.getLocation({ type: 'gcj02' });
      console.log('[Stores] 定位签到成功:', res);
      checkinStore(storeId);
      Taro.showToast({ title: '签到成功', icon: 'success' });
    } catch (e) {
      console.error('[Stores] 定位失败:', e);
      Taro.showModal({
        title: '定位提示',
        content: '当前无法获取位置信息，是否继续签到？',
        success: (res) => {
          if (res.confirm) {
            checkinStore(storeId);
            Taro.showToast({ title: '签到成功', icon: 'success' });
          }
        }
      });
    }
  };

  const handleCheckout = (storeId: string) => {
    Taro.showModal({
      title: '确认签退',
      content: '确认完成所有任务并离开该门店？',
      success: (res) => {
        if (res.confirm) {
          checkoutStore(storeId);
          Taro.showToast({ title: '签退成功', icon: 'success' });
        }
      }
    });
  };

  const handleStoreClick = (storeId: string) => {
    setCurrentStoreId(storeId);
    Taro.switchTab({ url: '/pages/inspection/index' });
  };

  const routeStores = stores.filter(s => s.status !== 'skipped');

  return (
    <ScrollView scrollY className={styles.page} refresherEnabled onRefresh={() => {}}>
      <View className={styles.header}>
        <View className={styles.userGreeting}>
          <View className={styles.userInfo}>
            <Text className={styles.hello}>早上好，开始今日巡查</Text>
            <Text className={styles.userName}>{user.name} 👋</Text>
          </View>
          <View className={styles.dateBadge}>
            <Text>📅 6月11日 周四</Text>
          </View>
        </View>
        <View className={styles.statsRow}>
          <StatCard
            label="今日门店"
            value={todayStats.total}
            suffix="家"
            color="#165dff"
            icon="🏪"
          />
          <StatCard
            label="已完成"
            value={todayStats.completed}
            suffix="家"
            color="#00b42a"
            trend={todayStats.completed >= 5 ? 'up' : 'flat'}
            trendValue="进度良好"
            icon="✅"
          />
          <StatCard
            label="巡查任务"
            value={`${todayStats.doneTasks}/${todayStats.totalTasks}`}
            color="#ff7d00"
            icon="📋"
          />
        </View>
      </View>

      <View className={styles.tabBar}>
        {[
          { key: 'all', label: `全部(${todayStats.total})` },
          { key: 'pending', label: `待拜访(${todayStats.pending})` },
          { key: 'checkin', label: `进行中(${todayStats.checkin})` },
          { key: 'completed', label: `已完成(${todayStats.completed})` }
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

      <View className={styles.routeSection}>
        <View className={styles.routeHeader}>
          <Text className={styles.routeTitle}>🗺️ 今日拜访路线</Text>
          <Text className={styles.routeCount}>{routeStores.length} 站</Text>
        </View>
        <View className={styles.routeMap}>
          <Text className={styles.mapIcon}>🗺️</Text>
          <View className={styles.routeLine} />
          <View className={styles.routeDots}>
            {routeStores.slice(0, 5).map((_, idx) => (
              <View
                key={idx}
                className={`${styles.routeDot} ${
                  routeStores[idx]?.status === 'completed' ? styles.done :
                  routeStores[idx]?.status === 'checkin' ? styles.current : ''
                }`}
              >
                {routeStores[idx]?.status === 'completed' ? '✓' : idx + 1}
              </View>
            ))}
          </View>
        </View>
        <View className={styles.routeList}>
          {routeStores.slice(0, 4).map((store, idx) => (
            <View key={store.id} className={styles.routeItem} onClick={() => handleStoreClick(store.id)}>
              <View
                className={`${styles.itemIndex} ${
                  store.status === 'completed' ? styles.done :
                  store.status === 'checkin' ? styles.current : ''
                }`}
              >
                {store.status === 'completed' ? '✓' : idx + 1}
              </View>
              <View className={styles.itemContent}>
                <Text className={styles.itemName}>{store.name}</Text>
                <Text className={styles.itemAddr}>{store.distance} · {store.address}</Text>
              </View>
              <Text className={styles.itemStatus}>
                {store.status === 'completed' ? '✓ 已完成' : store.status === 'checkin' ? '进行中 →' : '待拜访'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.storeList}>
        <View className={styles.sectionTitle}>
          <Text>📋 门店列表</Text>
        </View>
        {filteredStores.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无门店数据</Text>
          </View>
        ) : (
          filteredStores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              onClick={() => handleStoreClick(store.id)}
              onCheckin={() => handleCheckin(store.id)}
              onCheckout={() => handleCheckout(store.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default StoresPage;

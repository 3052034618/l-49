import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import type { Store, ShelfTask, RectificationItem, SalesRecord, UserInfo, Performance, PerformanceItem, ScoreDistributionItem } from '@/types';
import { mockStores } from '@/data/stores';
import { mockShelfTasks } from '@/data/tasks';
import { mockRectifications } from '@/data/rectifications';
import { mockSalesRecords } from '@/data/sales';
import { mockPerformance, mockUser } from '@/data/performance';

const STORAGE_KEY = 'smart_retail_shelf_app_state_v1';

interface PersistedState {
  stores: Store[];
  shelfTasks: ShelfTask[];
  rectifications: RectificationItem[];
  salesRecords: SalesRecord[];
  currentStoreId: string;
}

interface AppState {
  stores: Store[];
  shelfTasks: ShelfTask[];
  rectifications: RectificationItem[];
  salesRecords: SalesRecord[];
  performance: Performance;
  user: UserInfo;
  currentStoreId: string;
  setCurrentStoreId: (id: string) => void;
  updateShelfTask: (task: ShelfTask) => void;
  addRectification: (item: RectificationItem) => void;
  updateRectification: (item: RectificationItem) => void;
  addSalesRecord: (record: SalesRecord) => void;
  checkinStore: (storeId: string) => void;
  checkoutStore: (storeId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const loadFromStorage = (): PersistedState | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      console.log('[AppStore] 从本地存储加载数据成功');
      return parsed;
    }
  } catch (e) {
    console.warn('[AppStore] 读取本地存储失败:', e);
  }
  return null;
};

const saveToStorage = (state: PersistedState) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(state));
    console.log('[AppStore] 本地存储已同步');
  } catch (e) {
    console.warn('[AppStore] 写入本地存储失败:', e);
  }
};

const recalcStoreProgress = (stores: Store[], tasks: ShelfTask[]): Store[] => {
  return stores.map(store => {
    const storeTasks = tasks.filter(t => t.storeId === store.id);
    const total = storeTasks.length || store.taskCount;
    const completed = storeTasks.filter(t => t.status !== 'pending').length;
    return {
      ...store,
      taskCount: total,
      completedTaskCount: completed
    };
  });
};

const buildDynamicPerformance = (
  stores: Store[],
  tasks: ShelfTask[],
  rects: RectificationItem[],
  sales: SalesRecord[]
): Performance => {
  const totalStores = stores.length;
  const completedStores = stores.filter(s => s.status === 'completed').length;
  const visitRate = totalStores > 0 ? Math.round((completedStores / totalStores) * 100) : 0;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status !== 'pending').length;
  const taskRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const scoredTasks = tasks.filter(t => t.score > 0);
  const avgScore = scoredTasks.length > 0
    ? Math.round(scoredTasks.reduce((a, b) => a + b.score, 0) / scoredTasks.length)
    : 0;

  const totalRects = rects.length;
  const closedRects = rects.filter(r => r.status === 'approved').length;
  const rectRate = totalRects > 0 ? Math.round((closedRects / totalRects) * 100) : 0;

  const salesTarget = mockPerformance.salesTarget;
  const salesActual = sales.reduce((a, b) => a + b.totalAmount, 0) || mockPerformance.salesActual;
  const salesRate = salesTarget > 0 ? Math.round((salesActual / salesTarget) * 100) : 0;

  const today = new Date();
  const weekDays: PerformanceItem[] = ['一', '二', '三', '四', '五', '六', '日'].map((d, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    const value = 60 + Math.floor(Math.random() * 40);
    return { label: `周${d}(${key})`, value, target: 80 };
  });
  weekDays[6] = { label: `周${weekDays[6].label.split('(')[1].replace(')', '')}`, value: Math.max(visitRate, 65), target: 80 };

  const distCount = (min: number, max: number) =>
    scoredTasks.filter(t => t.score >= min && t.score <= max).length;
  const scoreDist: ScoreDistributionItem[] = [
    { range: '90-100分', count: distCount(90, 100) + 2, color: '#00b42a' },
    { range: '80-89分', count: distCount(80, 89) + 5, color: '#165dff' },
    { range: '70-79分', count: distCount(70, 79) + 3, color: '#ff7d00' },
    { range: '60-69分', count: distCount(60, 69) + 1, color: '#f53f3f' }
  ];

  return {
    visitCompletionRate: visitRate,
    taskCompletionRate: taskRate,
    avgScore,
    totalStores,
    completedStores,
    totalTasks,
    completedTasks: doneTasks,
    rectificationRate: rectRate,
    salesTarget,
    salesActual,
    salesRate,
    weeklyData: weekDays,
    monthlyRanking: mockPerformance.monthlyRanking,
    rankTrend: mockPerformance.rankTrend,
    scoreDistribution: scoreDist
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = loadFromStorage();

  const [stores, setStores] = useState<Store[]>(
    initial ? recalcStoreProgress(initial.stores, initial.shelfTasks) : recalcStoreProgress(mockStores, mockShelfTasks)
  );
  const [shelfTasks, setShelfTasks] = useState<ShelfTask[]>(
    initial ? initial.shelfTasks : mockShelfTasks
  );
  const [rectifications, setRectifications] = useState<RectificationItem[]>(
    initial ? initial.rectifications : mockRectifications
  );
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(
    initial ? initial.salesRecords : mockSalesRecords
  );
  const [currentStoreId, setCurrentStoreIdState] = useState<string>(
    initial ? initial.currentStoreId : 's001'
  );
  const [user] = useState<UserInfo>(mockUser);

  const performance = useMemo(
    () => buildDynamicPerformance(stores, shelfTasks, rectifications, salesRecords),
    [stores, shelfTasks, rectifications, salesRecords]
  );

  useEffect(() => {
    const state: PersistedState = { stores, shelfTasks, rectifications, salesRecords, currentStoreId };
    saveToStorage(state);
  }, [stores, shelfTasks, rectifications, salesRecords, currentStoreId]);

  const setCurrentStoreId = (id: string) => {
    setCurrentStoreIdState(id);
  };

  const updateShelfTask = (task: ShelfTask) => {
    setShelfTasks(prev => {
      const next = prev.map(t => (t.id === task.id ? task : t));
      setStores(storesPrev => recalcStoreProgress(storesPrev, next));
      return next;
    });
    Taro.showToast({ title: '数据已同步', icon: 'none', duration: 800 });
  };

  const addRectification = (item: RectificationItem) => {
    setRectifications(prev => [item, ...prev]);
  };

  const updateRectification = (item: RectificationItem) => {
    setRectifications(prev => prev.map(r => (r.id === item.id ? item : r)));
  };

  const addSalesRecord = (record: SalesRecord) => {
    setSalesRecords(prev => [record, ...prev]);
  };

  const checkinStore = (storeId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'checkin' as const, checkinTime: timeStr } : s));
  };

  const checkoutStore = (storeId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'completed' as const, checkoutTime: timeStr } : s));
  };

  return (
    <AppContext.Provider
      value={{
        stores,
        shelfTasks,
        rectifications,
        salesRecords,
        performance,
        user,
        currentStoreId,
        setCurrentStoreId,
        updateShelfTask,
        addRectification,
        updateRectification,
        addSalesRecord,
        checkinStore,
        checkoutStore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};

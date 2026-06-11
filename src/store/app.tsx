import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Store, ShelfTask, RectificationItem, SalesRecord, UserInfo, Performance } from '@/types';
import { mockStores } from '@/data/stores';
import { mockShelfTasks } from '@/data/tasks';
import { mockRectifications } from '@/data/rectifications';
import { mockSalesRecords } from '@/data/sales';
import { mockPerformance, mockUser } from '@/data/performance';

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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [shelfTasks, setShelfTasks] = useState<ShelfTask[]>(mockShelfTasks);
  const [rectifications, setRectifications] = useState<RectificationItem[]>(mockRectifications);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(mockSalesRecords);
  const [currentStoreId, setCurrentStoreId] = useState<string>('s001');
  const [performance] = useState<Performance>(mockPerformance);
  const [user] = useState<UserInfo>(mockUser);

  const updateShelfTask = (task: ShelfTask) => {
    setShelfTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
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

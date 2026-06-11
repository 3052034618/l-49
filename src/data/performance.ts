import type { Performance } from '@/types';

export const mockPerformance: Performance = {
  visitCompletionRate: 85,
  taskCompletionRate: 78,
  avgScore: 86,
  totalStores: 15,
  completedStores: 11,
  totalTasks: 80,
  completedTasks: 62,
  rectificationRate: 92,
  salesTarget: 25000,
  salesActual: 21456,
  salesRate: 86,
  weeklyData: [
    { label: '周一', value: 78, target: 90 },
    { label: '周二', value: 85, target: 90 },
    { label: '周三', value: 92, target: 90 },
    { label: '周四', value: 88, target: 90 },
    { label: '周五', value: 76, target: 90 },
    { label: '周六', value: 95, target: 90 },
    { label: '今日', value: 82, target: 90 }
  ],
  monthlyRanking: 8,
  rankTrend: 'up',
  scoreDistribution: [
    { range: '90-100分', count: 18, color: '#00b42a' },
    { range: '80-89分', count: 28, color: '#165dff' },
    { range: '70-79分', count: 12, color: '#ff7d00' },
    { range: '60-69分', count: 4, color: '#f53f3f' }
  ]
};

export const mockUser = {
  id: 'u001',
  name: '张伟',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: '资深促销员',
  team: '华北区-北京大区-朝阳一组',
  supervisor: '李明（区域主管）',
  phone: '138****8888',
  employeeId: 'EMP2024001'
};

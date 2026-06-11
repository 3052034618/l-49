// 门店类型
export interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  status: 'pending' | 'checkin' | 'completed' | 'skipped';
  checkinTime?: string;
  checkoutTime?: string;
  taskCount: number;
  completedTaskCount: number;
  lng?: number;
  lat?: number;
  manager?: string;
  phone?: string;
  chainType?: string;
  area?: string;
}

// 货架任务类型
export interface ShelfTask {
  id: string;
  storeId: string;
  name: string;
  category: string;
  position: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  photos: string[];
  isOutOfStock: boolean;
  outOfStockItems?: string[];
  competitorPrices?: CompetitorPrice[];
  materials: MaterialItem[];
  score: number;
  remark?: string;
  auditResult?: 'pass' | 'fail' | null;
  auditComment?: string;
  createdAt?: string;
}

// 竞品价格
export interface CompetitorPrice {
  brand: string;
  product: string;
  price: number;
  promotion?: string;
}

// 促销物料
export interface MaterialItem {
  name: string;
  placed: boolean;
  position?: string;
  photo?: string;
}

// 整改事项
export interface RectificationItem {
  id: string;
  storeId: string;
  storeName: string;
  shelfName: string;
  title: string;
  description: string;
  photos: string[];
  status: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  feedback?: string;
  feedbackPhotos?: string[];
  auditResult?: 'pass' | 'fail';
  auditComment?: string;
  rejectComment?: string;
  createdAt: string;
  completedAt?: string;
}

// 销量记录
export interface SalesRecord {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  products: SalesProduct[];
  totalAmount: number;
  remark?: string;
  createdAt: string;
}

export interface SalesProduct {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  amount: number;
}

// 绩效数据
export interface Performance {
  visitCompletionRate: number;
  taskCompletionRate: number;
  avgScore: number;
  totalStores: number;
  completedStores: number;
  totalTasks: number;
  completedTasks: number;
  rectificationRate: number;
  salesTarget: number;
  salesActual: number;
  salesRate: number;
  weeklyData: PerformanceItem[];
  monthlyRanking: number;
  rankTrend: 'up' | 'down' | 'flat';
  scoreDistribution: ScoreDistributionItem[];
}

export interface PerformanceItem {
  label: string;
  value: number;
  target: number;
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
  color: string;
}

// 用户信息
export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  team: string;
  supervisor: string;
  phone: string;
  employeeId: string;
}

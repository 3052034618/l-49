import type { ShelfTask, CompetitorPrice, MaterialItem } from '@/types';

const defaultMaterials: MaterialItem[] = [
  { name: '品牌海报', placed: true, position: '货架顶部' },
  { name: '价格标签', placed: true },
  { name: '跳跳卡', placed: false },
  { name: '端架展示', placed: true, position: '主通道左侧' },
  { name: '试吃台', placed: false }
];

const defaultCompetitors: CompetitorPrice[] = [
  { brand: '竞品A', product: '经典口味500ml', price: 5.5, promotion: '第二件半价' },
  { brand: '竞品B', product: '原味600ml', price: 6.2 }
];

export const mockShelfTasks: ShelfTask[] = [
  {
    id: 't001',
    storeId: 's001',
    name: '主货架-饮料区A面',
    category: '碳酸饮料',
    position: '1楼入口处第3排',
    status: 'submitted',
    photos: [
      'https://picsum.photos/id/1060/600/400',
      'https://picsum.photos/id/1080/600/400'
    ],
    isOutOfStock: false,
    competitorPrices: defaultCompetitors,
    materials: defaultMaterials,
    score: 92,
    remark: '整体陈列良好，库存充足',
    createdAt: '2026-06-11 09:30'
  },
  {
    id: 't002',
    storeId: 's001',
    name: '主货架-饮料区B面',
    category: '果汁饮料',
    position: '1楼入口处第4排',
    status: 'submitted',
    photos: [
      'https://picsum.photos/id/225/600/400'
    ],
    isOutOfStock: true,
    outOfStockItems: ['橙汁1L装', '葡萄汁500ml'],
    competitorPrices: [
      { brand: '竞品C', product: '鲜橙汁1L', price: 12.8, promotion: '买2减3元' }
    ],
    materials: [
      { name: '品牌海报', placed: true },
      { name: '价格标签', placed: true },
      { name: '跳跳卡', placed: true },
      { name: '端架展示', placed: false },
      { name: '试吃台', placed: false }
    ],
    score: 78,
    remark: '橙汁缺货需补货',
    auditResult: 'pass',
    auditComment: '已审核通过，缺货请尽快跟进',
    createdAt: '2026-06-11 09:45'
  },
  {
    id: 't003',
    storeId: 's001',
    name: '端架-促销区',
    category: '新品推广',
    position: '1楼主通道',
    status: 'pending',
    photos: [],
    isOutOfStock: false,
    materials: defaultMaterials,
    score: 0,
    createdAt: '2026-06-11'
  },
  {
    id: 't004',
    storeId: 's001',
    name: '冷藏柜-冷饮区',
    category: '冷藏饮料',
    position: '1楼收银台旁',
    status: 'pending',
    photos: [],
    isOutOfStock: false,
    materials: defaultMaterials,
    score: 0,
    createdAt: '2026-06-11'
  },
  {
    id: 't005',
    storeId: 's001',
    name: '堆头-入口处',
    category: '主推品',
    position: '1楼入口左侧',
    status: 'rejected',
    photos: [
      'https://picsum.photos/id/30/600/400'
    ],
    isOutOfStock: false,
    competitorPrices: defaultCompetitors,
    materials: defaultMaterials,
    score: 65,
    remark: '堆头摆放不整齐',
    auditResult: 'fail',
    auditComment: '照片角度不清晰，堆头陈列需要重新整理，商品排列需整齐规范',
    createdAt: '2026-06-11 10:00'
  },
  {
    id: 't006',
    storeId: 's001',
    name: '收银台-小货架',
    category: '便携装',
    position: '1楼收银台旁小货架',
    status: 'approved',
    photos: [
      'https://picsum.photos/id/96/600/400'
    ],
    isOutOfStock: false,
    competitorPrices: defaultCompetitors,
    materials: defaultMaterials,
    score: 88,
    remark: '',
    auditResult: 'pass',
    auditComment: '陈列规范，执行到位',
    createdAt: '2026-06-11 08:50'
  },
  {
    id: 't007',
    storeId: 's004',
    name: '主货架-饮料区',
    category: '碳酸饮料',
    position: 'B1层食品区',
    status: 'approved',
    photos: [
      'https://picsum.photos/id/425/600/400'
    ],
    isOutOfStock: false,
    competitorPrices: defaultCompetitors,
    materials: defaultMaterials,
    score: 95,
    remark: '完美执行',
    auditResult: 'pass',
    auditComment: '非常好，继续保持',
    createdAt: '2026-06-11 09:10'
  }
];

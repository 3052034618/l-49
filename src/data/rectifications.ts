import type { RectificationItem } from '@/types';

export const mockRectifications: RectificationItem[] = [
  {
    id: 'r001',
    storeId: 's001',
    storeName: '永辉超市(朝阳店)',
    shelfName: '主货架-饮料区B面',
    title: '橙汁sku缺货需紧急补货',
    description: '橙汁1L装和葡萄汁500ml两个sku均已缺货超过3天，门店库存不足，请立即联系采购补货并跟进到店时间',
    photos: [
      'https://picsum.photos/id/292/600/400',
      'https://picsum.photos/id/431/600/400'
    ],
    status: 'processing',
    priority: 'high',
    deadline: '2026-06-12 18:00',
    createdAt: '2026-06-11 09:45',
    feedback: '已联系采购，预计今日下午到货',
    feedbackPhotos: [
      'https://picsum.photos/id/312/600/400'
    ]
  },
  {
    id: 'r002',
    storeId: 's001',
    storeName: '永辉超市(朝阳店)',
    shelfName: '堆头-入口处',
    title: '堆头陈列不规范需重新整理',
    description: '堆头商品排列不整齐，展示面混乱，价格标签缺失，影响品牌形象，需要重新按规范陈列',
    photos: [
      'https://picsum.photos/id/30/600/400'
    ],
    status: 'pending',
    priority: 'high',
    deadline: '2026-06-11 18:00',
    createdAt: '2026-06-11 10:00'
  },
  {
    id: 'r003',
    storeId: 's004',
    storeName: '盒马鲜生(三里屯店)',
    shelfName: '冷藏柜冷饮区',
    title: '冷藏温度不达标',
    description: '冷藏柜温度显示8°C，超过规定0-4°C范围，部分商品有软化现象，需联系门店设备组检修',
    photos: [
      'https://picsum.photos/id/365/600/400'
    ],
    status: 'completed',
    priority: 'medium',
    deadline: '2026-06-10 18:00',
    createdAt: '2026-06-10 14:20',
    completedAt: '2026-06-10 17:30',
    feedback: '已联系维修人员上门，温度已恢复至3°C',
    feedbackPhotos: [
      'https://picsum.photos/id/429/600/400'
    ],
    auditResult: 'pass',
    auditComment: '整改及时，已验证通过'
  },
  {
    id: 'r004',
    storeId: 's002',
    storeName: '物美超市(国贸店)',
    shelfName: '端架促销区',
    title: '促销物料缺失',
    description: '端架缺少品牌海报和价格标签，跳跳卡未按要求张贴，需补充物料并完成陈列',
    photos: [
      'https://picsum.photos/id/60/600/400'
    ],
    status: 'approved',
    priority: 'low',
    deadline: '2026-06-11 12:00',
    createdAt: '2026-06-11 08:30',
    completedAt: '2026-06-11 11:20',
    feedback: '物料已补充完毕，海报已张贴，跳跳卡已按规范摆放',
    feedbackPhotos: [
      'https://picsum.photos/id/119/600/400',
      'https://picsum.photos/id/160/600/400'
    ],
    auditResult: 'pass',
    auditComment: '整改完成，符合要求'
  },
  {
    id: 'r005',
    storeId: 's003',
    storeName: '家乐福(双井店)',
    shelfName: '主货架食品区',
    title: '商品过期需下架',
    description: '发现3包商品临期（保质期不足7天），需立即下架并进行临期品处理流程',
    photos: [
      'https://picsum.photos/id/225/600/400'
    ],
    status: 'rejected',
    priority: 'high',
    deadline: '2026-06-11 12:00',
    createdAt: '2026-06-11 09:00',
    completedAt: '2026-06-11 11:00',
    feedback: '已下架并登记',
    feedbackPhotos: [
      'https://picsum.photos/id/292/600/400'
    ],
    auditResult: 'fail',
    auditComment: '照片未拍清楚下架登记记录，请补充完整照片',
    rejectComment: '照片未拍清楚下架登记记录，请补充完整照片后重新提交'
  }
];

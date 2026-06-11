import type { SalesRecord } from '@/types';

export const mockSalesRecords: SalesRecord[] = [
  {
    id: 'sale001',
    storeId: 's004',
    storeName: '盒马鲜生(三里屯店)',
    date: '2026-06-11',
    products: [
      { name: '经典可乐500ml*24瓶', sku: 'SKU001', quantity: 12, price: 48, amount: 576 },
      { name: '无糖可乐500ml*24瓶', sku: 'SKU002', quantity: 8, price: 52, amount: 416 },
      { name: '橙汁饮料1L*12瓶', sku: 'SKU003', quantity: 15, price: 96, amount: 1440 },
      { name: '运动饮料600ml*24瓶', sku: 'SKU004', quantity: 6, price: 72, amount: 432 }
    ],
    totalAmount: 2864,
    remark: '今日整体销量不错，周末备货充足，橙汁补货后销量明显上升',
    createdAt: '2026-06-11 10:30'
  },
  {
    id: 'sale002',
    storeId: 's001',
    storeName: '永辉超市(朝阳店)',
    date: '2026-06-11',
    products: [
      { name: '经典可乐500ml*24瓶', sku: 'SKU001', quantity: 20, price: 48, amount: 960 },
      { name: '无糖可乐500ml*24瓶', sku: 'SKU002', quantity: 15, price: 52, amount: 780 },
      { name: '樱桃可乐330ml*24罐', sku: 'SKU005', quantity: 10, price: 60, amount: 600 },
      { name: '迷你罐200ml*24罐', sku: 'SKU006', quantity: 18, price: 42, amount: 756 },
      { name: '苏打水330ml*24罐', sku: 'SKU007', quantity: 8, price: 55, amount: 440 }
    ],
    totalAmount: 3536,
    remark: '朝阳店今日大促，销量超预期，特别是碳酸饮料系列表现好，建议明日加派促销员',
    createdAt: '2026-06-11 10:00'
  },
  {
    id: 'sale003',
    storeId: 's002',
    storeName: '物美超市(国贸店)',
    date: '2026-06-10',
    products: [
      { name: '经典可乐500ml*24瓶', sku: 'SKU001', quantity: 10, price: 48, amount: 480 },
      { name: '无糖可乐500ml*24瓶', sku: 'SKU002', quantity: 6, price: 52, amount: 312 },
      { name: '橙汁1L*12瓶', sku: 'SKU003', quantity: 8, price: 96, amount: 768 }
    ],
    totalAmount: 1560,
    remark: '工作日销量平稳',
    createdAt: '2026-06-10 18:00'
  }
];

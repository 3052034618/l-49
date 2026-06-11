export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  return timeStr;
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待开始',
    checkin: '进行中',
    completed: '已完成',
    skipped: '已跳过',
    submitted: '已提交',
    approved: '已通过',
    rejected: '已退回',
    processing: '处理中'
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: '#ff7d00',
    checkin: '#165dff',
    completed: '#00b42a',
    skipped: '#86909c',
    submitted: '#165dff',
    approved: '#00b42a',
    rejected: '#f53f3f',
    processing: '#ff7d00'
  };
  return map[status] || '#4e5969';
};

export const getPriorityText = (priority: string): string => {
  const map: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };
  return map[priority] || priority;
};

export const getPriorityColor = (priority: string): string => {
  const map: Record<string, string> = {
    high: '#f53f3f',
    medium: '#ff7d00',
    low: '#165dff'
  };
  return map[priority] || '#4e5969';
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#00b42a';
  if (score >= 80) return '#165dff';
  if (score >= 70) return '#ff7d00';
  return '#f53f3f';
};

export const formatCurrency = (value: number): string => {
  return `¥${value.toFixed(2)}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr;
};

import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import styles from './index.module.scss';

import { useApp } from '@/store/app';
import { formatCurrency } from '@/utils';

const PerformancePage: React.FC = () => {
  const { performance, user, stores, shelfTasks, rectifications, salesRecords } = useApp();

  const totals = useMemo(() => {
    const total = stores.length;
    const completed = stores.filter(s => s.status === 'completed').length;
    const totalTasks = shelfTasks.length;
    const doneTasks = shelfTasks.filter(t => t.status === 'approved' || t.status === 'submitted').length;
    const avgScore = shelfTasks.filter(t => t.score > 0).length > 0
      ? Math.round(shelfTasks.filter(t => t.score > 0).reduce((a, b) => a + b.score, 0) / shelfTasks.filter(t => t.score > 0).length)
      : 0;
    const rectDone = rectifications.filter(r => r.status === 'approved' || r.status === 'completed').length;
    const salesTotal = salesRecords.reduce((a, b) => a + b.totalAmount, 0);
    return {
      visitRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      taskRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      avgScore,
      rectRate: rectifications.length > 0 ? Math.round((rectDone / rectifications.length) * 100) : 0,
      totalStores: total,
      completedStores: completed,
      totalTasks,
      doneTasks,
      salesTotal
    };
  }, [stores, shelfTasks, rectifications, salesRecords]);

  const maxWeekValue = Math.max(...performance.weeklyData.map(d => d.target));

  return (
    <ScrollView scrollY className={styles.page} refresherEnabled>
      <View className={styles.header}>
        <View className={styles.profileRow}>
          <View className={styles.avatar}>
            {user.avatar && (
              <Image src={user.avatar} style={{ width: '100%', height: '100%' }} mode="aspectFill" />
            )}
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userRole}>🎯 {user.role} · {user.employeeId}</Text>
            <Text className={styles.userTeam}>🏢 {user.team}</Text>
          </View>
          <View className={styles.rankBadge}>
            <Text className={styles.rankNum}>#{performance.monthlyRanking}</Text>
            <Text className={styles.rankLabel}>月度排名</Text>
            <View
              className={styles.rankTrend}
              style={{ color: performance.rankTrend === 'up' ? '#00ff88' : performance.rankTrend === 'down' ? '#ffb4b4' : '#fff' }}
            >
              {performance.rankTrend === 'up' && '↑ 上升3名'}
              {performance.rankTrend === 'down' && '↓ 下降1名'}
              {performance.rankTrend === 'flat' && '→ 持平'}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsOverview}>
        <View className={styles.statsGrid}>
          <View className={`${styles.statCard} ${styles.blue}`}>
            <Text className={styles.statLabel}>🏪 拜访完成率</Text>
            <Text className={styles.statValue} style={{ color: '#165dff' }}>{totals.visitRate}%</Text>
            <Text className={styles.statDesc}>
              已拜访 <b style={{ color: '#165dff' }}>{totals.completedStores}</b> / {totals.totalStores} 家
            </Text>
            <View className={styles.progressTrack}>
              <View
                className={styles.progressFill}
                style={{ width: `${totals.visitRate}%`, background: 'linear-gradient(90deg, #165dff, #4080ff)' }}
              />
            </View>
          </View>

          <View className={`${styles.statCard} ${styles.green}`}>
            <Text className={styles.statLabel}>✅ 任务完成率</Text>
            <Text className={styles.statValue} style={{ color: '#00b42a' }}>{totals.taskRate}%</Text>
            <Text className={styles.statDesc}>
              已完成 <b style={{ color: '#00b42a' }}>{totals.doneTasks}</b> / {totals.totalTasks} 项
            </Text>
            <View className={styles.progressTrack}>
              <View
                className={styles.progressFill}
                style={{ width: `${totals.taskRate}%`, background: 'linear-gradient(90deg, #00b42a, #2ed552)' }}
              />
            </View>
          </View>

          <View className={`${styles.statCard} ${styles.orange}`}>
            <Text className={styles.statLabel}>⭐ 执行平均分</Text>
            <Text
              className={styles.statValue}
              style={{ color: totals.avgScore >= 85 ? '#00b42a' : totals.avgScore >= 70 ? '#ff7d00' : '#f53f3f' }}
            >
              {totals.avgScore}
            </Text>
            <Text className={styles.statDesc}>
              等级: <b>{totals.avgScore >= 90 ? '优秀' : totals.avgScore >= 80 ? '良好' : totals.avgScore >= 70 ? '合格' : '待改进'}</b>
            </Text>
            <View className={styles.progressTrack}>
              <View
                className={styles.progressFill}
                style={{
                  width: `${totals.avgScore}%`,
                  background: `linear-gradient(90deg, ${totals.avgScore >= 85 ? '#00b42a' : totals.avgScore >= 70 ? '#ff7d00' : '#f53f3f'}, ${totals.avgScore >= 85 ? '#2ed552' : totals.avgScore >= 70 ? '#ff9a2e' : '#ff6b6b'})`
                }}
              />
            </View>
          </View>

          <View className={`${styles.statCard} ${styles.purple}`}>
            <Text className={styles.statLabel}>🛠️ 整改完成率</Text>
            <Text className={styles.statValue} style={{ color: '#722ed1' }}>{totals.rectRate}%</Text>
            <Text className={styles.statDesc}>
              闭环 <b style={{ color: '#722ed1' }}>{rectifications.filter(r => r.status === 'approved').length}</b> 项
            </Text>
            <View className={styles.progressTrack}>
              <View
                className={styles.progressFill}
                style={{ width: `${totals.rectRate}%`, background: 'linear-gradient(90deg, #722ed1, #9254de)' }}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📊 本周拜访完成率趋势</Text>
          <Text className={styles.sectionAction}>查看详情 →</Text>
        </View>
        <View className={styles.weekChart}>
          {performance.weeklyData.map((item, idx) => {
            const heightPercent = maxWeekValue > 0 ? (item.value / maxWeekValue) * 100 : 0;
            const targetPercent = maxWeekValue > 0 ? (item.target / maxWeekValue) * 100 : 100;
            const isGood = item.value >= item.target;
            const isWarn = item.value < item.target * 0.8;
            return (
              <View key={idx} className={styles.weekBar}>
                <View className={styles.barWrap} style={{ minHeight: 200 }}>
                  <View className={styles.barTarget} style={{ height: `${targetPercent}%` }} />
                  <View
                    className={`${styles.barFill} ${
                      isGood ? styles.good :
                      isWarn ? styles.warn : ''
                    }`}
                    style={{ height: `${Math.max(heightPercent, 10)}%` }}
                  >
                    <Text className={styles.barValue}>{item.value}%</Text>
                  </View>
                </View>
                <Text className={styles.barLabel} style={{ fontWeight: idx === performance.weeklyData.length - 1 ? 700 : 500 }}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
        <View className={styles.barLegend}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ background: '#165dff' }} />
            <Text>实际完成率</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ background: 'repeating-linear-gradient(0deg, #165dff, #165dff 2px, transparent 2px, transparent 4px)', opacity: 0.3 }} />
            <Text>目标基准线(90%)</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ background: '#00b42a' }} />
            <Text>达标</Text>
          </View>
        </View>
      </View>

      <View className={styles.goalSection}>
        <View className={styles.goalCard}>
          <View className={styles.goalHeader}>
            <View className={styles.goalTitle}>
              <Text className={styles.gLabel}>🎯 月度销售目标</Text>
              <Text className={styles.gName}>6月销售冲刺</Text>
            </View>
            <View className={styles.goalPercent}>
              <Text className={styles.gNum}>{performance.salesRate}%</Text>
              <Text className={styles.gText}>进度</Text>
            </View>
          </View>
          <View className={styles.goalBar}>
            <View className={styles.goalFill} style={{ width: `${performance.salesRate}%` }} />
          </View>
          <View className={styles.goalDetails}>
            <View className={styles.goalDetail}>
              <Text className={styles.dLabel}>目标金额</Text>
              <Text className={styles.dValue}>{formatCurrency(performance.salesTarget)}</Text>
            </View>
            <View className={styles.goalDetail}>
              <Text className={styles.dLabel}>已完成</Text>
              <Text className={styles.dValue} style={{ color: '#00b42a' }}>{formatCurrency(totals.salesTotal)}</Text>
            </View>
            <View className={styles.goalDetail}>
              <Text className={styles.dLabel}>距离目标</Text>
              <Text className={styles.dValue} style={{ color: '#ff7d00' }}>
                {formatCurrency(Math.max(0, performance.salesTarget - totals.salesTotal))}
              </Text>
            </View>
            <View className={styles.goalDetail}>
              <Text className={styles.dLabel}>剩余天数</Text>
              <Text className={styles.dValue}>20 天</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>⭐ 评分分布</Text>
          <Text className={styles.sectionAction}>
            共 {performance.scoreDistribution.reduce((a, b) => a + b.count, 0)} 次评分
          </Text>
        </View>
        <View className={styles.scoreDist}>
          {performance.scoreDistribution.map((item, idx) => {
            const total = performance.scoreDistribution.reduce((a, b) => a + b.count, 0);
            const percent = total > 0 ? Math.max((item.count / total) * 100, 8) : 0;
            return (
              <View key={idx} className={styles.distItem}>
                <Text className={styles.distLabel}>{item.range}</Text>
                <View className={styles.distBar}>
                  <View
                    className={styles.distFill}
                    style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)` }}
                  >
                    {item.count > 0 && <Text className={styles.distValue}>{Math.round(percent)}%</Text>}
                  </View>
                </View>
                <Text className={styles.distCount} style={{ color: item.color }}>{item.count}次</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.infoList}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>👤 个人信息</Text>
          <Text className={styles.infoValue}>{user.name} →</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>📱 联系电话</Text>
          <Text className={styles.infoValue}>{user.phone}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>👔 直属主管</Text>
          <Text className={styles.infoValue}>{user.supervisor}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>📅 入职日期</Text>
          <Text className={styles.infoValue}>2024年3月15日</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>🎓 培训记录</Text>
          <Text className={styles.infoValue} style={{ color: '#00b42a' }}>已完成8/8 ✓</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>⚙️ 系统设置</Text>
          <Text className={styles.infoValue}>→</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PerformancePage;

import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import type { FlowType } from '@/types'
import { flowTypeNames, flowTypeColors, flowTypeIcons } from '@/types'

const flowTabs: { key: FlowType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'scan_use', label: '扫码扣减' },
  { key: 'basket_verify', label: '篮核验' },
  { key: 'expired_submit', label: '过期提交' },
  { key: 'warehouse_process', label: '库房处理' },
  { key: 'replenish', label: '补库入库' }
]

const FlowPage: React.FC = () => {
  const { flowRecords, materials } = useAppContext()
  const [activeTab, setActiveTab] = useState<FlowType | 'all'>('all')

  const filteredRecords = useMemo(() => {
    if (activeTab === 'all') return flowRecords
    return flowRecords.filter(r => r.type === activeTab)
  }, [flowRecords, activeTab])

  const stats = useMemo(() => ({
    total: flowRecords.length,
    scanUse: flowRecords.filter(r => r.type === 'scan_use').reduce((s, r) => s + r.quantity, 0),
    verify: flowRecords.filter(r => r.type === 'basket_verify').length,
    replenish: flowRecords.filter(r => r.type === 'replenish').reduce((s, r) => s + r.quantity, 0)
  }), [flowRecords])

  const getStock = (materialId: string): number => {
    const mat = materials.find(m => m.id === materialId)
    return mat?.quantity ?? 0
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>材料使用流水</Text>
        <Text className={styles.headerSub}>扫码扣减、核验、过期提交、库房处理、补库全记录</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>总记录</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statNumber, styles.scanNumber)}>{stats.scanUse}</Text>
            <Text className={styles.statLabel}>扣减数量</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={classnames(styles.statNumber, styles.replenishNumber)}>{stats.replenish}</Text>
            <Text className={styles.statLabel}>补库数量</Text>
          </View>
        </View>

        <View className={styles.tabBar}>
          {flowTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(
                styles.tabItem,
                activeTab === tab.key && styles.tabActive
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className={classnames(
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive
              )}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>

        {filteredRecords.length > 0 ? (
          <View className={styles.recordList}>
            {filteredRecords.map(record => {
              const color = flowTypeColors[record.type]
              const icon = flowTypeIcons[record.type]
              const stock = getStock(record.materialId)
              return (
                <View key={record.id} className={styles.recordCard}>
                  <View className={styles.recordLeft}>
                    <View className={styles.iconWrap} style={{ backgroundColor: `${color}15` }}>
                      <Text className={styles.icon}>{icon}</Text>
                    </View>
                    <View className={styles.timeline}>
                      <View className={styles.dot} style={{ backgroundColor: color }} />
                    </View>
                  </View>

                  <View className={styles.recordBody}>
                    <View className={styles.recordHeader}>
                      <Text className={styles.recordTitle}>{record.materialName}</Text>
                      <View
                        className={styles.typeTag}
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {flowTypeNames[record.type]}
                      </View>
                    </View>

                    <View className={styles.recordMeta}>
                      <Text className={styles.recordCode}>{record.materialCode}</Text>
                      {record.batchNumber && (
                        <Text className={styles.recordBatch}>批号：{record.batchNumber}</Text>
                      )}
                      <Text className={classnames(
                        styles.recordQty,
                        record.type === 'replenish' ? styles.qtyPlus : styles.qtyMinus
                      )}>
                        {record.type === 'replenish' ? '+' : '-'}{record.quantity}
                      </Text>
                    </View>

                    {record.basketName && (
                      <Text className={styles.recordExtra}>📋 {record.basketName}</Text>
                    )}

                    <Text className={styles.recordRemark}>{record.remark}</Text>
                    <Text className={styles.recordTime}>{record.createdAt}</Text>

                    <View className={styles.recordStock}>
                      <Text className={styles.stockLabel}>当前库存</Text>
                      <Text className={classnames(
                        styles.stockValue,
                        stock <= 0 && styles.stockZero
                      )}>
                        {stock}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📊</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'all' ? '暂无流水记录' : `暂无「${flowTypeNames[activeTab]}」记录`}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default FlowPage

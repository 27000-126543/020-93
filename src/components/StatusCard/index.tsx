import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { MaterialStatus } from '@/types'
import { statusNames } from '@/types'

interface StatusCardProps {
  status: MaterialStatus
  remainingDays: number
  materialName: string
  batchNumber: string
  expireDate: string
  quantity?: number
  onUse?: () => void
  onReport?: () => void
}

const statusConfig: Record<MaterialStatus, {
  bgClass: string
  textClass: string
  tagClass: string
  icon: string
}> = {
  available: {
    bgClass: styles.bgAvailable,
    textClass: styles.textAvailable,
    tagClass: styles.tagAvailable,
    icon: '✓'
  },
  warning: {
    bgClass: styles.bgWarning,
    textClass: styles.textWarning,
    tagClass: styles.tagWarning,
    icon: '!'
  },
  expired: {
    bgClass: styles.bgExpired,
    textClass: styles.textExpired,
    tagClass: styles.tagExpired,
    icon: '✕'
  }
}

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  remainingDays,
  materialName,
  batchNumber,
  expireDate,
  quantity,
  onUse,
  onReport
}) => {
  const config = statusConfig[status]
  const isExpired = status === 'expired'
  const isWarning = status === 'warning'
  const isAvailable = status === 'available'
  const outOfStock = typeof quantity === 'number' && quantity <= 0

  const daysDisplay = remainingDays >= 0
    ? `${remainingDays} 天`
    : `已过期 ${Math.abs(remainingDays)} 天`

  return (
    <View className={styles.card}>
      <View className={classnames(styles.statusSection, config.bgClass)}>
        <View className={styles.statusIcon}>{config.icon}</View>
        <View className={styles.statusInfo}>
          <Text className={classnames(styles.statusTitle, config.textClass)}>
            {statusNames[status]}
          </Text>
          <Text className={styles.daysLabel}>剩余效期</Text>
          <Text className={classnames(styles.daysNumber, config.textClass)}>
            {daysDisplay}
          </Text>
        </View>
        {outOfStock && (
          <View className={styles.stockBadge}>
            <Text className={styles.stockBadgeText}>库存为0</Text>
          </View>
        )}
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.materialName}>{materialName}</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>批号</Text>
          <Text className={styles.infoValue}>{batchNumber}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>有效期至</Text>
          <Text className={styles.infoValue}>{expireDate}</Text>
        </View>
        {typeof quantity === 'number' && (
          <View className={classnames(styles.infoRow, styles.stockRow, outOfStock && styles.stockRowZero)}>
          <Text className={styles.infoLabel}>当前库存</Text>
          <Text className={classnames(styles.infoValue, styles.stockValue, outOfStock && styles.stockZero)}>
            {quantity} {outOfStock && '（不可用，需补库）'}
          </Text>
        </View>
        )}
      </View>

      {(isWarning || isExpired || (isAvailable && outOfStock)) && (
        <View className={styles.actionSection}>
          {isWarning && !outOfStock && (
            <View
              className={classnames(styles.actionBtn, styles.btnUse)}
              onClick={onUse}
            >
              <Text className={styles.btnText}>确认已使用，扣减库存</Text>
            </View>
          )}
          {isWarning && outOfStock && (
            <View
              className={classnames(styles.actionBtn, styles.btnDisabled)}
            >
              <Text className={styles.btnText}>临期但库存为0，无法扣减</Text>
            </View>
          )}
          {isExpired && (
            <View
              className={classnames(styles.actionBtn, styles.btnReport)}
              onClick={onReport}
            >
              <Text className={styles.btnText}>拍照提交库房处理</Text>
            </View>
          )}
          {isAvailable && outOfStock && (
            <View
              className={classnames(styles.actionBtn, styles.btnDisabled)}
            >
              <Text className={styles.btnText}>已达效期可用，但库存为0</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default StatusCard

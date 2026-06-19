import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { BasketItem as BasketItemType } from '@/types'
import { statusColors, statusNames } from '@/types'

interface BasketItemProps {
  item: BasketItemType
  stockQuantity?: number
  onCheck?: (checked: boolean) => void
  onScan?: () => void
}

const BasketItemComponent: React.FC<BasketItemProps> = ({
  item,
  stockQuantity,
  onCheck,
  onScan
}) => {
  const hasStatus = item.status !== undefined
  const statusColor = hasStatus ? statusColors[item.status!] : '#86909c'
  const outOfStock = typeof stockQuantity === 'number' && stockQuantity <= 0
  const isComplete = item.verifiedCount >= item.quantity
  const remaining = item.quantity - item.verifiedCount

  const handleCheck = () => {
    onCheck?.(!item.checked)
  }

  return (
    <View className={classnames(
      styles.card,
      isComplete && styles.checked,
      outOfStock && !isComplete && styles.outOfStock
    )}>
      <View
        className={styles.checkbox}
        onClick={handleCheck}
      >
        {isComplete && <Text className={styles.checkIcon}>✓</Text>}
      </View>

      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{item.materialName}</Text>
          {hasStatus && (
            <View
              className={styles.statusTag}
              style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
            >
              {statusNames[item.status!]}
            </View>
          )}
          {outOfStock && !isComplete && (
            <View className={classnames(styles.statusTag, styles.noStockTag)}>
              无库存
            </View>
          )}
          {isComplete && (
            <View className={classnames(styles.statusTag, styles.completeTag)}>
              已完成
            </View>
          )}
        </View>

        <View className={styles.meta}>
          <Text className={styles.category}>{item.categoryName}</Text>
          <Text className={styles.code}>编码：{item.materialCode}</Text>
        </View>

        <View className={styles.verifyRow}>
          <Text className={styles.verifyLabel}>核验进度</Text>
          <Text className={classnames(
            styles.verifyCount,
            isComplete && styles.verifyComplete
          )}>
            {item.verifiedCount}/{item.quantity}
          </Text>
          {!isComplete && remaining > 0 && (
            <Text className={styles.verifyRemaining}>还差 {remaining}</Text>
          )}
        </View>

        <View className={styles.verifyBar}>
          <View
            className={classnames(
              styles.verifyFill,
              isComplete && styles.verifyFillComplete
            )}
            style={{ width: `${item.quantity > 0 ? Math.round((item.verifiedCount / item.quantity) * 100) : 0}%` }}
          />
        </View>

        <View className={styles.stockRow}>
          {typeof stockQuantity === 'number' && (
            <Text
              className={classnames(
                styles.stockText,
                outOfStock && styles.stockZero
              )}
            >
              库存：{stockQuantity}
              {outOfStock && '（需补充）'}
            </Text>
          )}
        </View>

        {hasStatus && (
          <View className={styles.statusInfo}>
            <Text className={styles.expireLabel}>有效期至 {item.expireDate}</Text>
            <Text
              className={styles.remainingDays}
              style={{ color: statusColor }}
            >
              {item.remainingDays! >= 0
                ? `剩余 ${item.remainingDays} 天`
                : `已过期 ${Math.abs(item.remainingDays!)} 天`}
            </Text>
          </View>
        )}
      </View>

      <View
        className={classnames(
          styles.scanBtn,
          isComplete && styles.disabled,
          outOfStock && !isComplete && styles.outOfStockBtn
        )}
        onClick={(e) => {
          e.stopPropagation()
          onScan?.()
        }}
      >
        <Text className={styles.scanText}>
          {isComplete ? '已完' : (outOfStock ? '补库' : (item.verifiedCount > 0 ? '续扫' : '扫码'))}
        </Text>
      </View>
    </View>
  )
}

export default BasketItemComponent

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

  const handleCheck = () => {
    onCheck?.(!item.checked)
  }

  return (
    <View className={classnames(
      styles.card,
      item.checked && styles.checked,
      outOfStock && styles.outOfStock
    )}>
      <View
        className={styles.checkbox}
        onClick={handleCheck}
      >
        {item.checked && <Text className={styles.checkIcon}>✓</Text>}
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
          {outOfStock && !hasStatus && (
            <View className={classnames(styles.statusTag, styles.noStockTag)}>
              无库存
            </View>
          )}
        </View>

        <View className={styles.meta}>
          <Text className={styles.category}>{item.categoryName}</Text>
          <Text className={styles.code}>编码：{item.materialCode}</Text>
          <Text className={styles.quantity}>× {item.quantity}</Text>
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
          item.checked && styles.disabled,
          outOfStock && !item.checked && styles.outOfStockBtn
        )}
        onClick={(e) => {
          e.stopPropagation()
          onScan?.()
        }}
      >
        <Text className={styles.scanText}>
          {outOfStock && !item.checked ? '补库' : (hasStatus ? '重扫' : '扫码')}
        </Text>
      </View>
    </View>
  )
}

export default BasketItemComponent

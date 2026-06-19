import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Material } from '@/types'
import { statusColors, statusNames } from '@/types'

interface MaterialItemProps {
  material: Material
  onClick?: () => void
  showQuantity?: boolean
}

const MaterialItem: React.FC<MaterialItemProps> = ({
  material,
  onClick,
  showQuantity = true
}) => {
  const statusColor = statusColors[material.status]

  return (
    <View
      className={styles.card}
      onClick={onClick}
    >
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{material.name}</Text>
          <View
            className={styles.statusTag}
            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
          >
            {statusNames[material.status]}
          </View>
        </View>

        <View className={styles.meta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>分类</Text>
            <Text className={styles.metaValue}>{material.categoryName}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaLabel}>编码</Text>
            <Text className={styles.metaValue}>{material.code}</Text>
          </View>
        </View>

        <View className={styles.footer}>
          <View className={styles.expireInfo}>
            <Text className={styles.expireLabel}>有效期至</Text>
            <Text className={styles.expireDate}>{material.expireDate}</Text>
            <Text
              className={styles.remainingDays}
              style={{ color: statusColor }}
            >
              {material.remainingDays >= 0
                ? `剩余 ${material.remainingDays} 天`
                : `已过期 ${Math.abs(material.remainingDays)} 天`}
            </Text>
          </View>
          {showQuantity && (
            <View className={styles.quantity}>
              <Text className={styles.quantityLabel}>库存</Text>
              <Text className={styles.quantityValue}>{material.quantity}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default MaterialItem

import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import type { TreatmentType } from '@/types'
import { treatmentNames } from '@/types'
import { calculateRemainingDays, getMaterialStatus } from '@/utils/date'
import BasketItemComponent from '@/components/BasketItem'

const treatmentTabs: { key: TreatmentType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'implant', label: '种植' },
  { key: 'restoration', label: '修复' },
  { key: 'orthodontics', label: '正畸' }
]

const BasketPage: React.FC = () => {
  const {
    baskets,
    materials,
    updateBasketItemChecked,
    updateBasketItemStatus,
    addScanHistory
  } = useAppContext()

  const [activeTab, setActiveTab] = useState<TreatmentType | 'all'>('all')
  const [expandedBasketId, setExpandedBasketId] = useState<string | null>(null)

  const filteredBaskets = activeTab === 'all'
    ? baskets
    : baskets.filter(b => b.treatmentType === activeTab)

  const handleTabChange = (key: TreatmentType | 'all') => {
    setActiveTab(key)
    console.log('[Basket] 切换治疗类型', { type: key })
  }

  const handleBasketClick = (basketId: string) => {
    setExpandedBasketId(prev => prev === basketId ? null : basketId)
  }

  const handleItemScan = useCallback((basketId: string, itemId: string, materialCode: string) => {
    const material = materials.find(m => m.code === materialCode)
    if (material) {
      addScanHistory(material)
      const remainingDays = calculateRemainingDays(material.expireDate)
      const status = getMaterialStatus(remainingDays)
      updateBasketItemStatus(basketId, itemId, status, remainingDays)
      Taro.showToast({
        title: `核验${status === 'available' ? '通过' : status === 'warning' ? '临期' : '过期'}`,
        icon: status === 'expired' ? 'error' : 'success'
      })
      console.log('[Basket] 扫码核验', { basketId, itemId, materialCode, status })
    } else {
      Taro.showToast({ title: '未找到该材料', icon: 'error' })
    }
  }, [materials, addScanHistory, updateBasketItemStatus])

  const handleItemCheck = useCallback((basketId: string, itemId: string, checked: boolean) => {
    updateBasketItemChecked(basketId, itemId, checked)
    console.log('[Basket] 勾选状态变更', { basketId, itemId, checked })
  }, [updateBasketItemChecked])

  const getProgress = (basket: typeof baskets[0]) => {
    const checked = basket.items.filter(i => i.checked).length
    return {
      checked,
      total: basket.items.length,
      percent: basket.items.length > 0 ? Math.round((checked / basket.items.length) * 100) : 0
    }
  }

  const handleCreateBasket = () => {
    Taro.navigateTo({ url: '/pages/basket-edit/index' })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabBar}>
        {treatmentTabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>备台清单</Text>
          <Text className={styles.sectionCount}>共 {filteredBaskets.length} 个</Text>
        </View>

        {filteredBaskets.length > 0 ? (
          <View className={styles.basketList}>
            {filteredBaskets.map(basket => {
              const progress = getProgress(basket)
              const isExpanded = expandedBasketId === basket.id
              return (
                <View
                  key={basket.id}
                  className={classnames(
                    styles.basketCard,
                    styles[basket.treatmentType],
                    isExpanded && styles.expanded
                  )}
                >
                  <View
                    className={styles.basketHeader}
                    onClick={() => handleBasketClick(basket.id)}
                  >
                    <View className={styles.basketInfo}>
                      <Text className={styles.basketName}>{basket.name}</Text>
                      <View className={styles.basketMeta}>
                        <Text className={styles.basketRoom}>{basket.roomNumber}</Text>
                        <Text className={styles.basketTime}>{basket.createdAt} 创建</Text>
                      </View>
                    </View>
                    <View className={styles.basketProgress}>
                      <View>
                        <Text className={styles.progressText}>{progress.checked}/{progress.total}</Text>
                        <Text className={styles.progressSub}>已核验</Text>
                      </View>
                      <Text className={styles.arrowIcon}>▼</Text>
                    </View>
                  </View>

                  {progress.percent > 0 && (
                    <View className={styles.progressBar}>
                      <View
                        className={styles.progressFill}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </View>
                  )}

                  {isExpanded && (
                    <View className={styles.itemsSection}>
                      <View className={styles.itemsList}>
                        {basket.items.map(item => (
                          <BasketItemComponent
                            key={item.id}
                            item={item}
                            onCheck={(checked) => handleItemCheck(basket.id, item.id, checked)}
                            onScan={() => handleItemScan(basket.id, item.id, item.materialCode)}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🧺</Text>
            <Text className={styles.emptyText}>暂无{activeTab === 'all' ? '' : treatmentNames[activeTab]}材料篮</Text>
            <View className={styles.createBtn} onClick={handleCreateBasket}>
              <Text className={styles.createBtnText}>+ 新建材料篮</Text>
            </View>
          </View>
        )}

        <View className={styles.floatingBtn} onClick={handleCreateBasket}>
          <Text className={styles.floatingBtnText}>+ 新建</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default BasketPage

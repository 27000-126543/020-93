import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import { getAllBaskets, getBasketsByTreatmentType } from '@/data/baskets'
import { getMaterialByCode } from '@/data/materials'
import type { TreatmentType, Basket } from '@/types'
import { treatmentNames } from '@/types'
import BasketItemComponent from '@/components/BasketItem'

const treatmentTabs: { key: TreatmentType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'implant', label: '种植' },
  { key: 'restoration', label: '修复' },
  { key: 'orthodontics', label: '正畸' }
]

const BasketPage: React.FC = () => {
  const { selectedBasket, setSelectedBasket, updateBasketItemChecked, addScanHistory } = useAppContext()
  const [activeTab, setActiveTab] = useState<TreatmentType | 'all'>('all')
  const [expandedBasketId, setExpandedBasketId] = useState<string | null>(null)

  const baskets = useMemo(() => {
    if (activeTab === 'all') {
      return getAllBaskets()
    }
    return getBasketsByTreatmentType(activeTab)
  }, [activeTab])

  const handleTabChange = (key: TreatmentType | 'all') => {
    setActiveTab(key)
    setExpandedBasketId(null)
    console.log('[Basket] 切换治疗类型', { type: key })
  }

  const handleBasketClick = (basket: Basket) => {
    if (expandedBasketId === basket.id) {
      setExpandedBasketId(null)
      setSelectedBasket(null)
    } else {
      setExpandedBasketId(basket.id)
      setSelectedBasket(basket)
    }
  }

  const handleItemScan = useCallback((basketId: string, itemId: string, materialCode: string) => {
    const material = getMaterialByCode(materialCode)
    if (material) {
      addScanHistory(material)
      updateBasketItemChecked(itemId, true)
      Taro.showToast({
        title: `核验${material.status === 'available' ? '通过' : material.status === 'warning' ? '临期' : '过期'}`,
        icon: material.status === 'expired' ? 'error' : 'success'
      })
      console.log('[Basket] 扫码核验', { basketId, itemId, material })
    } else {
      Taro.showToast({
        title: '未找到该材料',
        icon: 'error'
      })
      console.error('[Basket] 未找到材料', { materialCode })
    }
  }, [addScanHistory, updateBasketItemChecked])

  const handleItemCheck = useCallback((itemId: string, checked: boolean) => {
    updateBasketItemChecked(itemId, checked)
    console.log('[Basket] 勾选状态变更', { itemId, checked })
  }, [updateBasketItemChecked])

  const getProgress = (basket: Basket) => {
    const checked = basket.items.filter(i => i.checked).length
    return {
      checked,
      total: basket.items.length,
      percent: Math.round((checked / basket.items.length) * 100)
    }
  }

  const handleCreateBasket = () => {
    Taro.showToast({
      title: '功能开发中',
      icon: 'none'
    })
    console.log('[Basket] 点击创建材料篮')
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
          <Text className={styles.sectionCount}>共 {baskets.length} 个</Text>
        </View>

        {baskets.length > 0 ? (
          <View className={styles.basketList}>
            {baskets.map(basket => {
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
                    onClick={() => handleBasketClick(basket)}
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
                            onCheck={(checked) => handleItemCheck(item.id, checked)}
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
      </View>
    </ScrollView>
  )
}

export default BasketPage

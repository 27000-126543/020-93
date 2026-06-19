import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import type { TreatmentType, Material } from '@/types'
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
    addScanHistory,
    getMaterialByCode
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

  const handleEditBasket = (basketId: string) => {
    console.log('[Basket] 编辑清单', { basketId })
    Taro.navigateTo({ url: `/pages/basket-edit/index?basketId=${basketId}` })
  }

  const handleItemScan = useCallback((basketId: string, itemId: string, expectedCode: string) => {
    console.log('[Basket] 开始核验，期望编码', { expectedCode })

    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        processScanResult(res.result, basketId, itemId, expectedCode)
      },
      fail: () => {
        Taro.showActionSheet({
          itemList: materials.slice(0, 10).map(m => `${m.code} - ${m.name}`),
          success: (sheetRes) => {
            const picked = materials[sheetRes.tapIndex]
            if (picked) {
              processScanResult(picked.code, basketId, itemId, expectedCode)
            }
          },
          fail: () => {
            console.log('[Basket] 核验取消')
          }
        })
      }
    })
  }, [materials])

  const processScanResult = useCallback((scannedCode: string, basketId: string, itemId: string, expectedCode: string) => {
    const code = scannedCode.trim().toUpperCase()
    const expected = expectedCode.trim().toUpperCase()
    console.log('[Basket] 核验对比', { scanned: code, expected })

    if (code !== expected) {
      const scannedMaterial = getMaterialByCode(code)
      const expectedMaterial = getMaterialByCode(expected)
      Taro.showModal({
        title: '⚠️ 核验未通过',
        content: `当前项应为：${expectedMaterial?.name || expected}\n实际扫到：${scannedMaterial?.name || code}\n\n请确认是同一种材料还是扫错了包装`,
        confirmText: '继续核验其他项',
        cancelText: '我再扫一次',
        showCancel: true,
        success: (modalRes) => {
          if (!modalRes.confirm) {
            handleItemScan(basketId, itemId, expectedCode)
          }
        }
      })
      return
    }

    const material = getMaterialByCode(code)
    if (!material) {
      Taro.showToast({ title: '未找到该编码对应材料', icon: 'error' })
      return
    }

    addScanHistory(material)
    const remainingDays = calculateRemainingDays(material.expireDate)
    const status = getMaterialStatus(remainingDays)
    updateBasketItemStatus(basketId, itemId, status, remainingDays)

    const statusText = status === 'available' ? '通过' : status === 'warning' ? '临期' : '过期'
    Taro.showToast({
      title: `核验${statusText}`,
      icon: status === 'expired' ? 'error' : 'success'
    })
    console.log('[Basket] 核验通过', { basketId, itemId, code, status })
  }, [getMaterialByCode, addScanHistory, updateBasketItemStatus])

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

  const getStock = (materialId: string): number | undefined => {
    const mat = materials.find(m => m.id === materialId)
    return mat?.quantity
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

                  <View className={styles.toolbar}>
                    <View
                      className={styles.toolBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditBasket(basket.id)
                      }}
                    >
                      <Text className={styles.toolIcon}>✏️</Text>
                      <Text className={styles.toolText}>编辑</Text>
                    </View>
                  </View>

                  {progress.percent > 0 && (
                    <View className={styles.progressBar}>
                      <View
                        className={classnames(
                          styles.progressFill,
                          progress.percent === 100 && styles.progressComplete
                        )}
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
                            stockQuantity={getStock(item.materialId)}
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

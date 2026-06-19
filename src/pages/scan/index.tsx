import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import { getMaterialByCode, mockMaterials } from '@/data/materials'
import { statusNames } from '@/types'
import StatusCard from '@/components/StatusCard'

const ScanPage: React.FC = () => {
  const { currentRoom, scanHistory, addScanHistory, addSubmission, useMaterialQuantity } = useAppContext()
  const [scannedMaterial, setScannedMaterial] = useState<ReturnType<typeof getMaterialByCode> | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const mockScanCodes = useMemo(() => mockMaterials.map(m => m.code), [])

  const handleScan = () => {
    setIsScanning(true)
    console.log('[Scan] 开始扫码')

    setTimeout(() => {
      const randomCode = mockScanCodes[Math.floor(Math.random() * mockScanCodes.length)]
      const material = getMaterialByCode(randomCode)

      if (material) {
        setScannedMaterial(material)
        addScanHistory(material)
        console.log('[Scan] 扫码成功', { material })
        Taro.vibrateShort({ type: 'medium' })
      } else {
        console.error('[Scan] 未找到材料', { code: randomCode })
        Taro.showToast({
          title: '未识别该材料',
          icon: 'error'
        })
      }
      setIsScanning(false)
    }, 1500)
  }

  const handleManualInput = () => {
    Taro.showActionSheet({
      itemList: mockMaterials.slice(0, 6).map(m => `${m.code} - ${m.name}`),
      success: (res) => {
        const material = mockMaterials[res.tapIndex]
        if (material) {
          setScannedMaterial(material)
          addScanHistory(material)
          console.log('[Scan] 手动选择材料', { material })
        }
      },
      fail: (err) => {
        console.error('[Scan] 手动选择取消', err)
      }
    })
  }

  const handleUseMaterial = () => {
    if (!scannedMaterial) return

    useMaterialQuantity(scannedMaterial.id, 1)
    Taro.showToast({
      title: '已扣减库存',
      icon: 'success'
    })
    console.log('[Scan] 确认使用材料', { material: scannedMaterial })
    setScannedMaterial(null)
  }

  const handleReportExpired = () => {
    if (!scannedMaterial) return

    Taro.showModal({
      title: '拍照提交库房',
      content: `确定提交 ${scannedMaterial.name}（批号：${scannedMaterial.batchNumber}）的过期报告吗？`,
      confirmText: '拍照提交',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          addSubmission(scannedMaterial, ['photo1', 'photo2'], '发现过期材料，请库房处理')
          Taro.showToast({
            title: '已提交库房',
            icon: 'success'
          })
          console.log('[Scan] 提交过期材料', { material: scannedMaterial })
          setScannedMaterial(null)
        }
      }
    })
  }

  const handleHistoryItemClick = (material: typeof scanHistory[0]) => {
    setScannedMaterial(material)
    console.log('[Scan] 点击历史记录', { material })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.roomBar}>
        <Text className={styles.roomLabel}>当前治疗间</Text>
        {currentRoom ? (
          <Text className={styles.roomValue}>{currentRoom.roomNumber} - {currentRoom.doctorName}</Text>
        ) : (
          <Text className={styles.noRoom}>请先在首页选择治疗间</Text>
        )}
      </View>

      <View className={styles.scanSection}>
        <View className={styles.scanArea}>
          <Text className={styles.scanIcon}>📷</Text>
        </View>
        <Text className={styles.scanHint}>将材料包装条形码放入框内扫描</Text>

        <View
          className={styles.scanBtn}
          onClick={handleScan}
        >
          <Text className={styles.scanBtnIcon}>{isScanning ? '⏳' : '📷'}</Text>
        </View>
        <Text className={styles.scanBtnText}>{isScanning ? '扫描中...' : '点击扫码'}</Text>

        <View className={styles.manualInput} onClick={handleManualInput}>
          <Text className={styles.manualIcon}>⌨️</Text>
          <Text className={styles.manualText}>手动输入编码</Text>
        </View>
      </View>

      {scannedMaterial && (
        <View className={styles.resultSection}>
          <StatusCard
            status={scannedMaterial.status}
            remainingDays={scannedMaterial.remainingDays}
            materialName={scannedMaterial.name}
            batchNumber={scannedMaterial.batchNumber}
            expireDate={scannedMaterial.expireDate}
            onUse={handleUseMaterial}
            onReport={handleReportExpired}
          />
        </View>
      )}

      <View className={styles.historySection}>
        <View className={styles.historyHeader}>
          <Text className={styles.historyTitle}>最近扫描</Text>
          <Text className={styles.historyCount}>共 {scanHistory.length} 条</Text>
        </View>

        {scanHistory.length > 0 ? (
          <View className={styles.historyList}>
            {scanHistory.map(material => (
              <View
                key={material.id}
                className={styles.historyItem}
                onClick={() => handleHistoryItemClick(material)}
              >
                <View className={styles.historyInfo}>
                  <Text className={styles.historyName}>{material.name}</Text>
                  <Text className={styles.historyMeta}>
                    {material.categoryName} · {material.code} · 有效期至 {material.expireDate}
                  </Text>
                </View>
                <View className={classnames(styles.historyStatus, styles[material.status])}>
                  {statusNames[material.status]}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyHistory}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无扫描记录</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default ScanPage

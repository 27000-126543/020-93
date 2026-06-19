import React, { useState } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import { statusNames } from '@/types'
import StatusCard from '@/components/StatusCard'

const ScanPage: React.FC = () => {
  const {
    currentRoom,
    materials,
    scanHistory,
    addScanHistory,
    addSubmission,
    useMaterialQuantity,
    getMaterialByCode
  } = useAppContext()

  const [scannedMaterial, setScannedMaterial] = useState<typeof materials[0] | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    console.log('[Scan] 开始扫码')

    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        const code = res.result
        console.log('[Scan] 扫码结果', { code })
        const material = getMaterialByCode(code)
        if (material) {
          setScannedMaterial(material)
          addScanHistory(material)
          Taro.vibrateShort({ type: 'medium' })
        } else {
          Taro.showToast({ title: '未找到该编码对应材料', icon: 'none' })
          console.error('[Scan] 未找到材料', { code })
        }
      },
      fail: (err) => {
        console.error('[Scan] 扫码失败', err)
        Taro.showModal({
          title: '扫码失败',
          content: '相机不可用或已取消，是否改用手动输入编码？',
          confirmText: '手动输入',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              setShowInput(true)
            }
          }
        })
      },
      complete: () => {
        setIsScanning(false)
      }
    })
  }

  const handleManualSearch = () => {
    const code = inputCode.trim().toUpperCase()
    if (!code) {
      Taro.showToast({ title: '请输入材料编码', icon: 'none' })
      return
    }
    const material = getMaterialByCode(code)
    if (material) {
      setScannedMaterial(material)
      addScanHistory(material)
      setShowInput(false)
      setInputCode('')
      console.log('[Scan] 手动输入查到材料', { code, material })
    } else {
      Taro.showToast({ title: '未找到该编码对应材料', icon: 'none' })
      console.error('[Scan] 手动输入未找到材料', { code })
    }
  }

  const handleUseMaterial = () => {
    if (!scannedMaterial) return
    if (scannedMaterial.quantity <= 0) {
      Taro.showToast({ title: '库存为0，无法扣减', icon: 'error' })
      return
    }
    const success = useMaterialQuantity(scannedMaterial.id, 1)
    if (success) {
      const updated = { ...scannedMaterial, quantity: scannedMaterial.quantity - 1 }
      setScannedMaterial(updated)
      Taro.showToast({ title: '已扣减库存', icon: 'success' })
      console.log('[Scan] 确认使用材料', { material: scannedMaterial })
    } else {
      Taro.showToast({ title: '库存为0，无法扣减', icon: 'error' })
    }
  }

  const handleReportExpired = () => {
    if (!scannedMaterial) return
    Taro.navigateTo({
      url: `/pages/photo-submit/index?materialId=${scannedMaterial.id}`
    })
  }

  const handleHistoryItemClick = (material: typeof scanHistory[0]) => {
    const fresh = materials.find(m => m.id === material.id) || material
    setScannedMaterial(fresh)
    console.log('[Scan] 点击历史记录', { material: fresh })
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

        <View className={styles.manualInput} onClick={() => setShowInput(!showInput)}>
          <Text className={styles.manualIcon}>⌨️</Text>
          <Text className={styles.manualText}>手动输入编码</Text>
        </View>
      </View>

      {showInput && (
        <View className={styles.inputSection}>
          <View className={styles.inputRow}>
            <Input
              className={styles.codeInput}
              type='text'
              placeholder='输入材料编码，如 ADH001'
              value={inputCode}
              onInput={(e) => setInputCode(e.detail.value)}
              onConfirm={handleManualSearch}
              confirmType='search'
            />
            <View className={styles.searchBtn} onClick={handleManualSearch}>
              <Text className={styles.searchBtnText}>查询</Text>
            </View>
          </View>
          <View className={styles.codeList}>
            <Text className={styles.codeListTitle}>可用编码：</Text>
            <ScrollView className={styles.codeScroll} scrollX>
              {materials.map(m => (
                <View
                  key={m.id}
                  className={styles.codeChip}
                  onClick={() => { setInputCode(m.code) }}
                >
                  <Text className={styles.codeChipText}>{m.code}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

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
          <View className={styles.quantityInfo}>
            <Text className={styles.quantityLabel}>当前库存</Text>
            <Text className={classnames(
              styles.quantityValue,
              scannedMaterial.quantity <= 0 && styles.zero
            )}>
              {scannedMaterial.quantity}
            </Text>
          </View>
        </View>
      )}

      <View className={styles.historySection}>
        <View className={styles.historyHeader}>
          <Text className={styles.historyTitle}>最近扫描</Text>
          <Text className={styles.historyCount}>共 {scanHistory.length} 条</Text>
        </View>

        {scanHistory.length > 0 ? (
          <View className={styles.historyList}>
            {scanHistory.map(material => {
              const fresh = materials.find(m => m.id === material.id) || material
              return (
                <View
                  key={material.id}
                  className={styles.historyItem}
                  onClick={() => handleHistoryItemClick(material)}
                >
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyName}>{fresh.name}</Text>
                    <Text className={styles.historyMeta}>
                      {fresh.categoryName} · {fresh.code} · 有效期至 {fresh.expireDate}
                    </Text>
                  </View>
                  <View className={classnames(styles.historyStatus, styles[fresh.status])}>
                    {statusNames[fresh.status]}
                  </View>
                </View>
              )
            })}
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

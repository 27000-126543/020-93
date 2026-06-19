import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'

const PhotoSubmitPage: React.FC = () => {
  const { materials, addSubmission } = useAppContext()
  const [materialId, setMaterialId] = useState('')
  const [material, setMaterial] = useState<typeof materials[0] | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [remark, setRemark] = useState('')

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.materialId) {
      setMaterialId(params.materialId)
    }
  }, [])

  useEffect(() => {
    if (materialId) {
      const found = materials.find(m => m.id === materialId) || null
      setMaterial(found)
    }
  }, [materialId, materials])

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        setPhotos(prev => [...prev, ...res.tempFilePaths])
        console.log('[PhotoSubmit] 拍照成功', { paths: res.tempFilePaths })
      },
      fail: (err) => {
        console.error('[PhotoSubmit] 拍照失败', err)
      }
    })
  }

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        setPhotos(prev => [...prev, ...res.tempFilePaths])
        console.log('[PhotoSubmit] 选图成功', { paths: res.tempFilePaths })
      },
      fail: (err) => {
        console.error('[PhotoSubmit] 选图失败', err)
      }
    })
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!material) {
      Taro.showToast({ title: '材料信息缺失', icon: 'error' })
      return
    }
    if (photos.length === 0) {
      Taro.showToast({ title: '请至少拍一张照片', icon: 'none' })
      return
    }

    addSubmission(material, material.batchNumber, photos, remark)
    Taro.showToast({ title: '提交成功', icon: 'success' })
    console.log('[PhotoSubmit] 提交过期材料', {
      material: material.name,
      batchNumber: material.batchNumber,
      photoCount: photos.length
    })

    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  if (!material) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.emptyContainer}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>未指定过期材料</Text>
          <Text className={styles.emptyHint}>请从扫码页面点击"拍照提交"进入</Text>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.materialCard}>
        <View className={styles.materialHeader}>
          <Text className={styles.materialName}>{material.name}</Text>
          <View className={styles.expiredTag}>已过期</View>
        </View>
        <View className={styles.materialInfo}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>批号</Text>
            <Text className={styles.infoValue}>{material.batchNumber}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>有效期至</Text>
            <Text className={styles.infoValue}>{material.expireDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>编码</Text>
            <Text className={styles.infoValue}>{material.code}</Text>
          </View>
        </View>
      </View>

      <View className={styles.photoSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>留存照片</Text>
          <Text className={styles.photoCount}>{photos.length}/9</Text>
        </View>

        <View className={styles.photoGrid}>
          {photos.map((path, index) => (
            <View key={index} className={styles.photoItem}>
              <Image
                className={styles.photoImg}
                src={path}
                mode='aspectFill'
              />
              <View
                className={styles.removeBtn}
                onClick={() => handleRemovePhoto(index)}
              >
                <Text className={styles.removeIcon}>✕</Text>
              </View>
            </View>
          ))}

          {photos.length < 9 && (
            <View className={styles.addPhotoGrid}>
              <View className={styles.addBtn} onClick={handleTakePhoto}>
                <Text className={styles.addIcon}>📷</Text>
                <Text className={styles.addText}>拍照</Text>
              </View>
              <View className={styles.addBtn} onClick={handleChooseImage}>
                <Text className={styles.addIcon}>🖼️</Text>
                <Text className={styles.addText}>选图</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.remarkSection}>
        <Text className={styles.remarkTitle}>备注信息</Text>
        <Input
          className={styles.remarkInput}
          type='text'
          placeholder='请输入备注，如：包装已破损、批号模糊等'
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
        />
      </View>

      <View className={styles.submitSection}>
        <View
          className={classnames(styles.submitBtn, photos.length === 0 && styles.disabled)}
          onClick={photos.length > 0 ? handleSubmit : undefined}
        >
          <Text className={styles.submitText}>
            {photos.length > 0 ? `提交库房处理（${photos.length}张照片）` : '请先拍照留存'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default PhotoSubmitPage

import React, { useState } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import type { TreatmentType, MaterialCategory } from '@/types'
import { treatmentNames, categoryNames } from '@/types'

const treatmentOptions: { key: TreatmentType; label: string }[] = [
  { key: 'implant', label: '种植' },
  { key: 'restoration', label: '修复' },
  { key: 'orthodontics', label: '正畸复诊' }
]

const categoryOptions: { key: MaterialCategory; label: string }[] = [
  { key: 'adhesive', label: '粘接剂' },
  { key: 'etchant', label: '酸蚀剂' },
  { key: 'anesthetic', label: '局麻药' },
  { key: 'temporary-crown', label: '临时冠材料' }
]

const BasketEditPage: React.FC = () => {
  const { materials, addBasket, currentRoom } = useAppContext()
  const [name, setName] = useState('')
  const [treatmentType, setTreatmentType] = useState<TreatmentType>('implant')
  const [roomNumber, setRoomNumber] = useState(currentRoom?.roomNumber || '')
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | 'all'>('all')

  const filteredMaterials = activeCategory === 'all'
    ? materials
    : materials.filter(m => m.category === activeCategory)

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterialIds(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId)
      }
      return [...prev, materialId]
    })
  }

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入清单名称', icon: 'none' })
      return
    }
    if (!roomNumber.trim()) {
      Taro.showToast({ title: '请输入治疗间号', icon: 'none' })
      return
    }
    if (selectedMaterialIds.length === 0) {
      Taro.showToast({ title: '请至少添加一个材料', icon: 'none' })
      return
    }

    addBasket(name.trim(), treatmentType, roomNumber.trim(), selectedMaterialIds)
    Taro.showToast({ title: '创建成功', icon: 'success' })
    console.log('[BasketEdit] 保存材料篮', { name, treatmentType, roomNumber, materialCount: selectedMaterialIds.length })

    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>清单名称</Text>
          <Input
            className={styles.formInput}
            type='text'
            placeholder='如：A01种植手术备台'
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>治疗类型</Text>
          <View className={styles.typeRow}>
            {treatmentOptions.map(opt => (
              <View
                key={opt.key}
                className={classnames(styles.typeChip, treatmentType === opt.key && styles.activeType)}
                onClick={() => setTreatmentType(opt.key)}
              >
                <Text className={styles.typeChipText}>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>治疗间号</Text>
          <Input
            className={styles.formInput}
            type='text'
            placeholder='如：A01'
            value={roomNumber}
            onInput={(e) => setRoomNumber(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.materialSection}>
        <View className={styles.materialHeader}>
          <Text className={styles.sectionTitle}>添加材料</Text>
          <Text className={styles.selectedCount}>已选 {selectedMaterialIds.length} 项</Text>
        </View>

        <View className={styles.categoryBar}>
          <View
            className={classnames(styles.categoryChip, activeCategory === 'all' && styles.activeCategory)}
            onClick={() => setActiveCategory('all')}
          >
            <Text className={styles.categoryText}>全部</Text>
          </View>
          {categoryOptions.map(opt => (
            <View
              key={opt.key}
              className={classnames(styles.categoryChip, activeCategory === opt.key && styles.activeCategory)}
              onClick={() => setActiveCategory(opt.key)}
            >
              <Text className={styles.categoryText}>{opt.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.materialList}>
          {filteredMaterials.map(m => {
            const isSelected = selectedMaterialIds.includes(m.id)
            return (
              <View
                key={m.id}
                className={classnames(styles.materialRow, isSelected && styles.selectedRow)}
                onClick={() => toggleMaterial(m.id)}
              >
                <View className={styles.materialCheck}>
                  {isSelected && <Text className={styles.checkIcon}>✓</Text>}
                </View>
                <View className={styles.materialInfo}>
                  <Text className={styles.materialName}>{m.name}</Text>
                  <View className={styles.materialMeta}>
                    <Text className={styles.materialCode}>{m.code}</Text>
                    <Text className={styles.materialCategory}>{m.categoryName}</Text>
                    <Text className={styles.materialStock}>库存：{m.quantity}</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View className={styles.saveSection}>
        <View
          className={classnames(styles.saveBtn, selectedMaterialIds.length === 0 && styles.disabled)}
          onClick={selectedMaterialIds.length > 0 ? handleSave : undefined}
        >
          <Text className={styles.saveText}>
            {selectedMaterialIds.length > 0
              ? `保存清单（${selectedMaterialIds.length}项材料）`
              : '请选择材料'}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default BasketEditPage

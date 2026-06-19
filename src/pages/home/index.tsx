import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import { getTodaySchedules } from '@/data/schedules'
import { getMaterialsByStatus } from '@/data/materials'
import { getTodayDisplay } from '@/utils/date'
import ScheduleCard from '@/components/ScheduleCard'

const HomePage: React.FC = () => {
  const { currentRoom, setCurrentRoom } = useAppContext()
  const schedules = useMemo(() => getTodaySchedules(), [])
  const warningMaterials = useMemo(() => getMaterialsByStatus('warning'), [])
  const expiredMaterials = useMemo(() => getMaterialsByStatus('expired'), [])

  const handleScheduleSelect = (schedule: typeof schedules[0]) => {
    setCurrentRoom(schedule)
    Taro.showToast({
      title: `已进入${schedule.roomName}`,
      icon: 'success',
      duration: 1500
    })
    console.log('[Home] 选择治疗间', { schedule })
  }

  const handleQuickScan = () => {
    console.log('[Home] 点击快速扫码')
    Taro.switchTab({
      url: '/pages/scan/index'
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.dateRow}>
          <Text className={styles.dateText}>{getTodayDisplay()}</Text>
          <Text className={styles.weatherText}>☀️ 晴 26°C</Text>
        </View>
        <Text className={styles.greeting}>早上好，护士</Text>
        <Text className={styles.subGreeting}>今天共有 {schedules.length} 台治疗</Text>
        {currentRoom && (
          <View className={styles.currentRoom}>
            <Text className={styles.roomLabel}>当前治疗间</Text>
            <View className={styles.roomInfo}>
              <Text className={styles.roomNumber}>{currentRoom.roomNumber}</Text>
              <Text className={styles.roomName}>{currentRoom.roomName}</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.content}>
        <View className={styles.quickAction}>
          <View className={styles.scanBtn} onClick={handleQuickScan}>
            <Text className={styles.scanIcon}>📷</Text>
            <Text className={styles.scanText}>扫码核验材料效期</Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={classnames(styles.statCard, styles.warning)}>
            <Text className={styles.statNumber}>{warningMaterials.length}</Text>
            <Text className={styles.statLabel}>临期材料</Text>
            <Text className={styles.statSub}>30天内到期，建议优先使用</Text>
          </View>
          <View className={classnames(styles.statCard, styles.expired)}>
            <Text className={styles.statNumber}>{expiredMaterials.length}</Text>
            <Text className={styles.statLabel}>过期材料</Text>
            <Text className={styles.statSub}>禁止使用，请及时处理</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日排班</Text>
            <Text className={styles.sectionCount}>共 {schedules.length} 台</Text>
          </View>
          {schedules.length > 0 ? (
            <View className={styles.scheduleList}>
              {schedules.map(schedule => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  selected={currentRoom?.id === schedule.id}
                  onClick={() => handleScheduleSelect(schedule)}
                />
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📅</Text>
              <Text className={styles.emptyText}>今日暂无排班</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default HomePage

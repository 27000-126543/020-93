import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Schedule } from '@/types'

interface ScheduleCardProps {
  schedule: Schedule
  selected?: boolean
  onClick?: () => void
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  selected = false,
  onClick
}) => {
  return (
    <View
      className={classnames(styles.card, selected && styles.selected)}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.roomInfo}>
          <Text className={styles.roomNumber}>{schedule.roomNumber}</Text>
          <Text className={styles.roomName}>{schedule.roomName}</Text>
        </View>
        <View className={styles.timeBadge}>
          <Text className={styles.timeText}>{schedule.time}</Text>
        </View>
      </View>

      <View className={styles.divider} />

      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>医生</Text>
          <Text className={styles.value}>{schedule.doctorName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>治疗类型</Text>
          <View className={styles.treatmentTag}>
            <Text className={styles.treatmentText}>{schedule.treatmentName}</Text>
          </View>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>患者</Text>
          <Text className={styles.value}>{schedule.patientName}</Text>
        </View>
      </View>

      {selected && (
        <View className={styles.selectedIndicator}>
          <Text className={styles.selectedText}>✓ 已选择</Text>
        </View>
      )}
    </View>
  )
}

export default ScheduleCard

import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'

const menuItems = [
  { icon: '⚙️', text: '设置' },
  { icon: '❓', text: '使用帮助' },
  { icon: '📱', text: '关于我们' },
  { icon: '📋', text: '意见反馈' }
]

const MinePage: React.FC = () => {
  const { submissions, scanHistory } = useAppContext()

  const stats = {
    todayScanned: scanHistory.length,
    monthSubmissions: submissions.length,
    pending: submissions.length
  }

  const handleMenuClick = (text: string) => {
    Taro.showToast({
      title: `${text}功能开发中`,
      icon: 'none'
    })
    console.log('[Mine] 点击菜单', { text })
  }

  const handleSubmissionClick = (item: typeof submissions[0]) => {
    Taro.showModal({
      title: item.material.name,
      content: `批号：${item.batchNumber}\n照片数量：${item.photos.length}张\n备注：${item.remark || '无'}\n提交时间：${item.submittedAt}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.profile}>
          <View className={styles.avatar}>👩‍⚕️</View>
          <View className={styles.profileInfo}>
            <Text className={styles.name}>李护士</Text>
            <Text className={styles.role}>主管护师</Text>
            <Text className={styles.department}>口腔科 · 修复科</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.todayScanned}</Text>
            <Text className={styles.statLabel}>今日核验</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.monthSubmissions}</Text>
            <Text className={styles.statLabel}>本月提交</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={styles.statLabel}>处理中</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>过期材料提交记录</Text>
            <Text className={styles.sectionMore}>查看全部</Text>
          </View>

          {submissions.length > 0 ? (
            <View className={styles.submissionsList}>
              {submissions.map((item, index) => (
                <View
                  key={index}
                  className={styles.submissionItem}
                  onClick={() => handleSubmissionClick(item)}
                >
                  <View className={styles.submissionHeader}>
                    <Text className={styles.submissionName}>{item.material.name}</Text>
                    <View className={styles.submissionStatus}>处理中</View>
                  </View>
                  <View className={styles.submissionMeta}>
                    <Text className={styles.submissionBatch}>批号：{item.batchNumber}</Text>
                    <Text className={styles.submissionPhotos}>📷 {item.photos.length}张</Text>
                    <Text className={styles.submissionTime}>{item.submittedAt}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无提交记录</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>功能菜单</Text>
          </View>

          <View className={styles.menuList}>
            {menuItems.map((item, index) => (
              <View
                key={index}
                className={styles.menuItem}
                onClick={() => handleMenuClick(item.text)}
              >
                <View className={styles.menuLeft}>
                  <Text className={styles.menuIcon}>{item.icon}</Text>
                  <Text className={styles.menuText}>{item.text}</Text>
                </View>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default MinePage

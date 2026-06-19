import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppContext } from '@/store/app.context'
import type { SubmissionStatus } from '@/types'
import { submissionStatusNames, submissionStatusColors } from '@/types'

const menuItems = [
  { icon: '⚙️', text: '设置' },
  { icon: '❓', text: '使用帮助' },
  { icon: '📱', text: '关于我们' },
  { icon: '📋', text: '意见反馈' }
]

const statusTabs: { key: SubmissionStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'received', label: '已接收' },
  { key: 'scrapped', label: '已报废' }
]

const MinePage: React.FC = () => {
  const { submissions, scanHistory, updateSubmissionStatus } = useAppContext()
  const [activeStatusTab, setActiveStatusTab] = useState<SubmissionStatus | 'all'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<typeof submissions[0] | null>(null)

  const stats = {
    todayScanned: scanHistory.length,
    monthSubmissions: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length
  }

  const filteredSubmissions = useMemo(() => {
    if (activeStatusTab === 'all') return submissions
    return submissions.filter(s => s.status === activeStatusTab)
  }, [submissions, activeStatusTab])

  const handleMenuClick = (text: string) => {
    Taro.showToast({
      title: `${text}功能开发中`,
      icon: 'none'
    })
    console.log('[Mine] 点击菜单', { text })
  }

  const handleSubmissionClick = (item: typeof submissions[0]) => {
    setSelectedSubmission(item)
  }

  const handleCloseDetail = () => {
    setSelectedSubmission(null)
  }

  const handleStatusChange = (item: typeof submissions[0], newStatus: SubmissionStatus) => {
    Taro.showModal({
      title: `更新为「${submissionStatusNames[newStatus]}」？`,
      content: newStatus === 'scrapped'
        ? '此操作表示库房已确认该材料报废处理。'
        : '此操作表示库房已收到该材料。',
      success: (res) => {
        if (res.confirm) {
          updateSubmissionStatus(item.id, newStatus,
            newStatus === 'received' ? '库房已签收，待进一步处置' : '已按规定流程完成报废处理'
          )
          setSelectedSubmission(null)
          Taro.showToast({ title: '状态已更新', icon: 'success' })
        }
      }
    })
  }

  const handlePhotoPreview = (current: string, urls: string[]) => {
    Taro.previewImage({
      current,
      urls
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
            <Text className={classnames(styles.statNumber, styles.pendingNumber)}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待库房处理</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>过期材料提交记录</Text>
            <Text className={styles.sectionMore}>
              共 {submissions.length} 条
            </Text>
          </View>

          <View className={styles.statusTabBar}>
            {statusTabs.map(tab => {
              const count = tab.key === 'all'
                ? submissions.length
                : submissions.filter(s => s.status === tab.key).length
              return (
                <View
                  key={tab.key}
                  className={classnames(
                    styles.statusTabItem,
                    activeStatusTab === tab.key && styles.statusTabActive
                  )}
                  onClick={() => setActiveStatusTab(tab.key)}
                >
                  <Text className={classnames(
                    styles.statusTabText,
                    activeStatusTab === tab.key && styles.statusTabTextActive
                  )}>
                    {tab.label}
                  </Text>
                  <Text className={classnames(
                    styles.statusTabCount,
                    activeStatusTab === tab.key && styles.statusTabCountActive
                  )}>
                    {count}
                  </Text>
                </View>
              )
            })}
          </View>

          {filteredSubmissions.length > 0 ? (
            <View className={styles.submissionsList}>
              {filteredSubmissions.map((item) => {
                const color = submissionStatusColors[item.status]
                return (
                  <View
                    key={item.id}
                    className={styles.submissionItem}
                    onClick={() => handleSubmissionClick(item)}
                  >
                    <View className={styles.submissionHeader}>
                      <Text className={styles.submissionName}>{item.material.name}</Text>
                      <View
                        className={styles.submissionStatus}
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {submissionStatusNames[item.status]}
                      </View>
                    </View>
                    <View className={styles.submissionMeta}>
                      <Text className={styles.submissionBatch}>批号：{item.batchNumber}</Text>
                      <Text className={styles.submissionPhotos}>📷 {item.photos.length}张</Text>
                      <Text className={styles.submissionTime}>{item.submittedAt}</Text>
                    </View>
                    {item.photos.length > 0 && (
                      <View className={styles.submissionThumbs}>
                        {item.photos.slice(0, 4).map((p, i) => (
                          <Image
                            key={i}
                            className={styles.thumbImg}
                            src={p}
                            mode='aspectFill'
                          />
                        ))}
                        {item.photos.length > 4 && (
                          <View className={styles.thumbMore}>
                            <Text className={styles.thumbMoreText}>+{item.photos.length - 4}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>
                {activeStatusTab === 'all'
                  ? '暂无提交记录'
                  : `暂无「${submissionStatusNames[activeStatusTab]}」记录`}
              </Text>
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

      {selectedSubmission && (() => {
        const item = selectedSubmission
        const color = submissionStatusColors[item.status]
        return (
          <View className={styles.modalMask} onClick={handleCloseDetail}>
            <View className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <View className={styles.modalHeader}>
                <Text className={styles.modalTitle}>提交详情</Text>
                <View className={styles.modalClose} onClick={handleCloseDetail}>
                  <Text className={styles.modalCloseText}>✕</Text>
                </View>
              </View>

              <ScrollView className={styles.modalBody} scrollY>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>材料名称</Text>
                  <Text className={styles.detailValue}>{item.material.name}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>批号</Text>
                  <Text className={styles.detailValue}>{item.batchNumber}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>分类</Text>
                  <Text className={styles.detailValue}>{item.material.categoryName}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>提交时间</Text>
                  <Text className={styles.detailValue}>{item.submittedAt}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>当前状态</Text>
                  <View
                    className={styles.detailStatusTag}
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {submissionStatusNames[item.status]}
                  </View>
                </View>
                {item.remark && (
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>提交备注</Text>
                    <Text className={styles.detailValue}>{item.remark}</Text>
                  </View>
                )}
                {item.handleRemark && (
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>处理备注</Text>
                    <Text className={styles.detailValue}>{item.handleRemark}</Text>
                  </View>
                )}
                {item.handledAt && (
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>处理时间</Text>
                    <Text className={styles.detailValue}>{item.handledAt}</Text>
                  </View>
                )}

                {item.photos.length > 0 && (
                  <View className={styles.detailPhotos}>
                    <Text className={styles.detailLabel}>留存照片（点击放大）</Text>
                    <View className={styles.detailPhotoGrid}>
                      {item.photos.map((p, i) => (
                        <Image
                          key={i}
                          className={styles.detailPhoto}
                          src={p}
                          mode='aspectFill'
                          onClick={() => handlePhotoPreview(p, item.photos)}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>

              {item.status === 'pending' && (
                <View className={styles.modalActions}>
                  <View
                    className={classnames(styles.actionBtn, styles.actionReceive)}
                    onClick={() => handleStatusChange(item, 'received')}
                  >
                    <Text className={styles.actionBtnText}>库房已接收</Text>
                  </View>
                  <View
                    className={classnames(styles.actionBtn, styles.actionScrap)}
                    onClick={() => handleStatusChange(item, 'scrapped')}
                  >
                    <Text className={styles.actionBtnText}>确认报废</Text>
                  </View>
                </View>
              )}
              {item.status === 'received' && (
                <View className={styles.modalActions}>
                  <View
                    className={classnames(styles.actionBtn, styles.actionScrap)}
                    onClick={() => handleStatusChange(item, 'scrapped')}
                  >
                    <Text className={styles.actionBtnText}>确认报废</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )
      })()}
    </ScrollView>
  )
}

export default MinePage

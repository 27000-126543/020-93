import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import styles from './index.module.scss'

const PhotoSubmitPage: React.FC = () => {
  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.container}>
        <Text className={styles.icon}>📷</Text>
        <Text className={styles.title}>拍照提交</Text>
        <Text className={styles.desc}>功能正在开发中...</Text>
      </View>
    </ScrollView>
  )
}

export default PhotoSubmitPage

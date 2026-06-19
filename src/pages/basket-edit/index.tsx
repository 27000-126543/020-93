import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import styles from './index.module.scss'

const BasketEditPage: React.FC = () => {
  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.container}>
        <Text className={styles.icon}>🧺</Text>
        <Text className={styles.title}>编辑材料篮</Text>
        <Text className={styles.desc}>功能正在开发中...</Text>
      </View>
    </ScrollView>
  )
}

export default BasketEditPage

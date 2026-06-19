import React, { useEffect } from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import { AppProvider } from '@/store/app.context'
import './app.scss'

function App(props: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('[App] 初始化完成')
  }, [])

  useDidShow(() => {
    console.log('[App] 页面显示')
  })

  useDidHide(() => {
    console.log('[App] 页面隐藏')
  })

  return (
    <AppProvider>
      {props.children}
    </AppProvider>
  )
}

export default App

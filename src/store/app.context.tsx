import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Schedule, Material, Basket, BasketItem } from '@/types'

interface AppState {
  currentRoom: Schedule | null
  selectedBasket: Basket | null
  scanHistory: Material[]
  submissions: { material: Material; photos: string[]; remark: string }[]
  setCurrentRoom: (room: Schedule | null) => void
  setSelectedBasket: (basket: Basket | null) => void
  addScanHistory: (material: Material) => void
  addSubmission: (material: Material, photos: string[], remark: string) => void
  updateBasketItemChecked: (itemId: string, checked: boolean) => void
  useMaterialQuantity: (materialId: string, quantity: number) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<Schedule | null>(null)
  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(null)
  const [scanHistory, setScanHistory] = useState<Material[]>([])
  const [submissions, setSubmissions] = useState<{ material: Material; photos: string[]; remark: string }[]>([])

  const addScanHistory = useCallback((material: Material) => {
    setScanHistory(prev => {
      const filtered = prev.filter(m => m.id !== material.id)
      return [material, ...filtered].slice(0, 20)
    })
  }, [])

  const addSubmission = useCallback((material: Material, photos: string[], remark: string) => {
    setSubmissions(prev => [{ material, photos, remark }, ...prev])
  }, [])

  const updateBasketItemChecked = useCallback((itemId: string, checked: boolean) => {
    setSelectedBasket(prev => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, checked } : item
        )
      }
    })
  }, [])

  const useMaterialQuantity = useCallback((materialId: string, quantity: number) => {
    console.log('[Inventory] 扣减材料', { materialId, quantity })
  }, [])

  return (
    <AppContext.Provider value={{
      currentRoom,
      selectedBasket,
      scanHistory,
      submissions,
      setCurrentRoom,
      setSelectedBasket,
      addScanHistory,
      addSubmission,
      updateBasketItemChecked,
      useMaterialQuantity
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

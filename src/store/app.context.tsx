import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Schedule, Material, Basket, BasketItem, TreatmentType, SubmissionStatus } from '@/types'
import { treatmentNames, categoryNames, submissionStatusNames } from '@/types'
import { mockMaterials } from '@/data/materials'
import { mockBaskets } from '@/data/baskets'
import { calculateRemainingDays, getMaterialStatus } from '@/utils/date'

interface PhotoSubmission {
  id: string
  material: Material
  batchNumber: string
  photos: string[]
  remark: string
  submittedAt: string
  status: SubmissionStatus
  handleRemark: string
  handledAt?: string
}

interface AppState {
  currentRoom: Schedule | null
  materials: Material[]
  baskets: Basket[]
  scanHistory: Material[]
  submissions: PhotoSubmission[]
  setCurrentRoom: (room: Schedule | null) => void
  getMaterialByCode: (code: string) => Material | undefined
  getMaterialById: (id: string) => Material | undefined
  getMaterialsByStatus: (status: Material['status']) => Material[]
  addScanHistory: (material: Material) => void
  useMaterialQuantity: (materialId: string, quantity: number) => boolean
  addSubmission: (material: Material, batchNumber: string, photos: string[], remark: string) => void
  updateSubmissionStatus: (id: string, status: SubmissionStatus, handleRemark?: string) => void
  updateBasketItemChecked: (basketId: string, itemId: string, checked: boolean) => void
  updateBasketItemStatus: (basketId: string, itemId: string, status: Material['status'], remainingDays: number) => void
  addBasket: (name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => void
  updateBasket: (basketId: string, name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => void
  getBasketById: (id: string) => Basket | undefined
  getAllBaskets: () => Basket[]
  getBasketsByTreatmentType: (type: TreatmentType) => Basket[]
}

const AppContext = createContext<AppState | undefined>(undefined)

function buildBasketItems(basketId: string, materialIds: string[], materials: Material[]): BasketItem[] {
  return materialIds.map((mid, idx) => {
    const mat = materials.find(m => m.id === mid)
    const remainingDays = mat ? calculateRemainingDays(mat.expireDate) : 0
    const status = mat ? getMaterialStatus(remainingDays) : 'available' as const
    return {
      id: `item-${mid}-${Date.now()}-${idx}`,
      basketId,
      materialId: mid,
      materialName: mat?.name || '',
      materialCode: mat?.code || '',
      category: mat?.category || 'adhesive',
      categoryName: mat?.categoryName || categoryNames['adhesive'],
      quantity: 1,
      checked: false,
      status,
      remainingDays,
      expireDate: mat?.expireDate || ''
    }
  })
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<Schedule | null>(null)
  const [materials, setMaterials] = useState<Material[]>(() => [...mockMaterials])
  const [baskets, setBaskets] = useState<Basket[]>(() => [...mockBaskets])
  const [scanHistory, setScanHistory] = useState<Material[]>([])
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([])

  const getMaterialByCode = useCallback((code: string) => {
    return materials.find(m => m.code === code)
  }, [materials])

  const getMaterialById = useCallback((id: string) => {
    return materials.find(m => m.id === id)
  }, [materials])

  const getMaterialsByStatus = useCallback((status: Material['status']) => {
    return materials.filter(m => m.status === status)
  }, [materials])

  const addScanHistory = useCallback((material: Material) => {
    setScanHistory(prev => {
      const filtered = prev.filter(m => m.id !== material.id)
      return [material, ...filtered].slice(0, 20)
    })
  }, [])

  const useMaterialQuantity = useCallback((materialId: string, quantity: number): boolean => {
    let success = false
    setMaterials(prev => {
      return prev.map(m => {
        if (m.id === materialId) {
          if (m.quantity <= 0) return m
          success = true
          return { ...m, quantity: Math.max(0, m.quantity - quantity) }
        }
        return m
      })
    })
    console.log('[Inventory] 扣减材料', { materialId, quantity, success })
    return success
  }, [])

  const addSubmission = useCallback((material: Material, batchNumber: string, photos: string[], remark: string) => {
    const now = new Date()
    const submittedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const submission: PhotoSubmission = {
      id: `sub-${Date.now()}`,
      material,
      batchNumber,
      photos,
      remark,
      submittedAt,
      status: 'pending',
      handleRemark: ''
    }
    setSubmissions(prev => [submission, ...prev])
    console.log('[Submission] 新增提交', { materialName: material.name, batchNumber, photoCount: photos.length, id: submission.id })
  }, [])

  const updateSubmissionStatus = useCallback((id: string, status: SubmissionStatus, handleRemark: string = '') => {
    const now = new Date()
    const handledAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, status, handleRemark, handledAt } : s
    ))
    console.log('[Submission] 更新状态', { id, status: submissionStatusNames[status] })
  }, [])

  const updateBasketItemChecked = useCallback((basketId: string, itemId: string, checked: boolean) => {
    setBaskets(prev => prev.map(b => {
      if (b.id !== basketId) return b
      return {
        ...b,
        items: b.items.map(item =>
          item.id === itemId ? { ...item, checked } : item
        )
      }
    }))
  }, [])

  const updateBasketItemStatus = useCallback((basketId: string, itemId: string, status: Material['status'], remainingDays: number) => {
    setBaskets(prev => prev.map(b => {
      if (b.id !== basketId) return b
      return {
        ...b,
        items: b.items.map(item =>
          item.id === itemId ? { ...item, status, remainingDays, checked: true } : item
        )
      }
    }))
  }, [])

  const addBasket = useCallback((name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => {
    const newId = `basket-${Date.now()}`
    const items = buildBasketItems(newId, materialIds, materials)
    const now = new Date()
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const newBasket: Basket = {
      id: newId,
      name,
      treatmentType,
      treatmentName: treatmentNames[treatmentType],
      roomNumber,
      items,
      createdAt
    }
    setBaskets(prev => [newBasket, ...prev])
    console.log('[Basket] 新建材料篮', { id: newId, name, treatmentType, roomNumber, itemCount: items.length })
  }, [materials])

  const updateBasket = useCallback((basketId: string, name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => {
    const items = buildBasketItems(basketId, materialIds, materials)
    setBaskets(prev => prev.map(b => {
      if (b.id !== basketId) return b
      return {
        ...b,
        name,
        treatmentType,
        treatmentName: treatmentNames[treatmentType],
        roomNumber,
        items
      }
    }))
    console.log('[Basket] 更新材料篮', { id: basketId, name, treatmentType, roomNumber, itemCount: items.length })
  }, [materials])

  const getBasketById = useCallback((id: string) => baskets.find(b => b.id === id), [baskets])
  const getAllBaskets = useCallback(() => baskets, [baskets])
  const getBasketsByTreatmentType = useCallback((type: TreatmentType) => baskets.filter(b => b.treatmentType === type), [baskets])

  return (
    <AppContext.Provider value={{
      currentRoom,
      materials,
      baskets,
      scanHistory,
      submissions,
      setCurrentRoom,
      getMaterialByCode,
      getMaterialById,
      getMaterialsByStatus,
      addScanHistory,
      useMaterialQuantity,
      addSubmission,
      updateSubmissionStatus,
      updateBasketItemChecked,
      updateBasketItemStatus,
      addBasket,
      updateBasket,
      getBasketById,
      getAllBaskets,
      getBasketsByTreatmentType
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

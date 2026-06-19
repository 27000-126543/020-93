import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Schedule, Material, Basket, BasketItem, TreatmentType, SubmissionStatus, FlowRecord, FlowType } from '@/types'
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
  replenishedQty: number
  replenishedAt?: string
}

function nowStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

interface AppState {
  currentRoom: Schedule | null
  materials: Material[]
  baskets: Basket[]
  scanHistory: Material[]
  submissions: PhotoSubmission[]
  flowRecords: FlowRecord[]
  setCurrentRoom: (room: Schedule | null) => void
  getMaterialByCode: (code: string) => Material | undefined
  getMaterialById: (id: string) => Material | undefined
  getMaterialsByStatus: (status: Material['status']) => Material[]
  addScanHistory: (material: Material) => void
  useMaterialQuantity: (materialId: string, quantity: number) => boolean
  addSubmission: (material: Material, batchNumber: string, photos: string[], remark: string) => void
  updateSubmissionStatus: (id: string, status: SubmissionStatus, handleRemark?: string) => void
  replenishMaterial: (submissionId: string, quantity: number) => void
  updateBasketItemChecked: (basketId: string, itemId: string, checked: boolean) => void
  incrementBasketItemVerified: (basketId: string, itemId: string, status: Material['status'], remainingDays: number) => void
  updateBasketItemStatus: (basketId: string, itemId: string, status: Material['status'], remainingDays: number) => void
  addBasket: (name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => void
  updateBasket: (basketId: string, name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => void
  getBasketById: (id: string) => Basket | undefined
  getAllBaskets: () => Basket[]
  getBasketsByTreatmentType: (type: TreatmentType) => Basket[]
  addFlowRecord: (type: FlowType, materialId: string, quantity: number, remark: string, extra?: Partial<Pick<FlowRecord, 'basketName' | 'batchNumber' | 'operator'>>) => void
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
      verifiedCount: 0,
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
  const [flowRecords, setFlowRecords] = useState<FlowRecord[]>([])

  const getMaterialByCode = useCallback((code: string) => {
    return materials.find(m => m.code.toUpperCase() === code.toUpperCase())
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

  const addFlowRecord = useCallback((type: FlowType, materialId: string, quantity: number, remark: string, extra?: Partial<Pick<FlowRecord, 'basketName' | 'batchNumber' | 'operator'>>) => {
    const mat = materials.find(m => m.id === materialId)
    const record: FlowRecord = {
      id: `flow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      materialId,
      materialName: mat?.name || materialId,
      materialCode: mat?.code || '',
      quantity,
      remark,
      createdAt: nowStr(),
      basketName: extra?.basketName,
      batchNumber: extra?.batchNumber,
      operator: extra?.operator
    }
    setFlowRecords(prev => [record, ...prev])
  }, [materials])

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
    if (success) {
      const mat = materials.find(m => m.id === materialId)
      addFlowRecord('scan_use', materialId, quantity, `扫码扣减 ${quantity} 件`)
    }
    return success
  }, [materials, addFlowRecord])

  const addSubmission = useCallback((material: Material, batchNumber: string, photos: string[], remark: string) => {
    const submission: PhotoSubmission = {
      id: `sub-${Date.now()}`,
      material,
      batchNumber,
      photos,
      remark,
      submittedAt: nowStr(),
      status: 'pending',
      handleRemark: '',
      replenishedQty: 0
    }
    setSubmissions(prev => [submission, ...prev])
    addFlowRecord('expired_submit', material.id, 1, `过期提交，批号${batchNumber}`, { batchNumber })
  }, [addFlowRecord])

  const updateSubmissionStatus = useCallback((id: string, status: SubmissionStatus, handleRemark: string = '') => {
    setSubmissions(prev => prev.map(s => {
      if (s.id !== id) return s
      return { ...s, status, handleRemark, handledAt: nowStr() }
    }))
    const sub = submissions.find(s => s.id === id)
    if (sub) {
      addFlowRecord('warehouse_process', sub.material.id, 1, `${submissionStatusNames[status]}：${handleRemark}`, { batchNumber: sub.batchNumber })
    }
  }, [submissions, addFlowRecord])

  const replenishMaterial = useCallback((submissionId: string, quantity: number) => {
    setMaterials(prev => prev.map(m => {
      const sub = submissions.find(s => s.id === submissionId)
      if (sub && m.id === sub.material.id) {
        return { ...m, quantity: m.quantity + quantity }
      }
      return m
    }))
    setSubmissions(prev => prev.map(s => {
      if (s.id !== submissionId) return s
      return { ...s, replenishedQty: s.replenishedQty + quantity, replenishedAt: nowStr() }
    }))
    const sub = submissions.find(s => s.id === submissionId)
    if (sub) {
      addFlowRecord('replenish', sub.material.id, quantity, `补库入库 ${quantity} 件`, { batchNumber: sub.batchNumber })
    }
  }, [submissions, addFlowRecord])

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

  const incrementBasketItemVerified = useCallback((basketId: string, itemId: string, status: Material['status'], remainingDays: number) => {
    setBaskets(prev => prev.map(b => {
      if (b.id !== basketId) return b
      return {
        ...b,
        items: b.items.map(item => {
          if (item.id !== itemId) return item
          if (item.verifiedCount >= item.quantity) return item
          const newVerified = Math.min(item.verifiedCount + 1, item.quantity)
          const done = newVerified >= item.quantity
          return { ...item, verifiedCount: newVerified, checked: done, status, remainingDays }
        })
      }
    }))
  }, [])

  const updateBasketItemStatus = useCallback((basketId: string, itemId: string, status: Material['status'], remainingDays: number) => {
    setBaskets(prev => prev.map(b => {
      if (b.id !== basketId) return b
      return {
        ...b,
        items: b.items.map(item => {
          if (item.id !== itemId) return item
          const newVerified = item.verifiedCount + 1
          const done = newVerified >= item.quantity
          return { ...item, status, remainingDays, verifiedCount: newVerified, checked: done }
        })
      }
    }))
  }, [])

  const addBasket = useCallback((name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => {
    const newId = `basket-${Date.now()}`
    const items = buildBasketItems(newId, materialIds, materials)
    const newBasket: Basket = {
      id: newId,
      name,
      treatmentType,
      treatmentName: treatmentNames[treatmentType],
      roomNumber,
      items,
      createdAt: nowStr()
    }
    setBaskets(prev => [newBasket, ...prev])
  }, [materials])

  const updateBasket = useCallback((basketId: string, name: string, treatmentType: TreatmentType, roomNumber: string, materialIds: string[]) => {
    setBaskets(prev => prev.map(b => {
      if (b.id !== basketId) return b
      const existing = b.items
      const newItems: BasketItem[] = materialIds.map((mid, idx) => {
        const exist = existing.find(e => e.materialId === mid)
        if (exist) return exist
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
          verifiedCount: 0,
          checked: false,
          status,
          remainingDays,
          expireDate: mat?.expireDate || ''
        }
      })
      return {
        ...b,
        name,
        treatmentType,
        treatmentName: treatmentNames[treatmentType],
        roomNumber,
        items: newItems
      }
    }))
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
      flowRecords,
      setCurrentRoom,
      getMaterialByCode,
      getMaterialById,
      getMaterialsByStatus,
      addScanHistory,
      useMaterialQuantity,
      addSubmission,
      updateSubmissionStatus,
      replenishMaterial,
      updateBasketItemChecked,
      incrementBasketItemVerified,
      updateBasketItemStatus,
      addBasket,
      updateBasket,
      getBasketById,
      getAllBaskets,
      getBasketsByTreatmentType,
      addFlowRecord
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

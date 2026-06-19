export type MaterialStatus = 'available' | 'warning' | 'expired'

export type MaterialCategory = 'adhesive' | 'etchant' | 'anesthetic' | 'temporary-crown'

export type TreatmentType = 'implant' | 'restoration' | 'orthodontics'

export interface Material {
  id: string
  code: string
  name: string
  category: MaterialCategory
  categoryName: string
  batchNumber: string
  expireDate: string
  remainingDays: number
  status: MaterialStatus
  quantity: number
  manufacturer: string
  specification: string
}

export interface Schedule {
  id: string
  doctorName: string
  roomNumber: string
  roomName: string
  time: string
  treatmentType: TreatmentType
  treatmentName: string
  patientName: string
}

export interface BasketItem {
  id: string
  basketId: string
  materialId: string
  materialName: string
  materialCode: string
  category: MaterialCategory
  categoryName: string
  quantity: number
  checked: boolean
  status?: MaterialStatus
  remainingDays?: number
  expireDate?: string
}

export interface Basket {
  id: string
  name: string
  treatmentType: TreatmentType
  treatmentName: string
  roomNumber: string
  items: BasketItem[]
  createdAt: string
}

export interface PhotoSubmission {
  id: string
  materialId: string
  materialName: string
  batchNumber: string
  photos: string[]
  remark: string
  submittedAt: string
  submittedBy: string
}

export const categoryNames: Record<MaterialCategory, string> = {
  'adhesive': '粘接剂',
  'etchant': '酸蚀剂',
  'anesthetic': '局麻药',
  'temporary-crown': '临时冠材料'
}

export const treatmentNames: Record<TreatmentType, string> = {
  'implant': '种植',
  'restoration': '修复',
  'orthodontics': '正畸复诊'
}

export const statusNames: Record<MaterialStatus, string> = {
  'available': '可用',
  'warning': '临期建议优先',
  'expired': '已过期禁止使用'
}

export const statusColors: Record<MaterialStatus, string> = {
  'available': '#00b42a',
  'warning': '#ff7d00',
  'expired': '#f53f3f'
}

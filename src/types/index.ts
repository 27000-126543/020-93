export type MaterialStatus = 'available' | 'warning' | 'expired'

export type MaterialCategory = 'adhesive' | 'etchant' | 'anesthetic' | 'temporary-crown'

export type TreatmentType = 'implant' | 'restoration' | 'orthodontics'

export type SubmissionStatus = 'pending' | 'received' | 'scrapped'

export type FlowType = 'scan_use' | 'basket_verify' | 'expired_submit' | 'warehouse_process' | 'replenish'

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
  verifiedCount: number
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

export interface FlowRecord {
  id: string
  type: FlowType
  materialId: string
  materialName: string
  materialCode: string
  quantity: number
  remark: string
  createdAt: string
  basketName?: string
  batchNumber?: string
  operator?: string
}

export const flowTypeNames: Record<FlowType, string> = {
  'scan_use': '扫码扣减',
  'basket_verify': '篮核验',
  'expired_submit': '过期提交',
  'warehouse_process': '库房处理',
  'replenish': '补库入库'
}

export const flowTypeColors: Record<FlowType, string> = {
  'scan_use': '#1677ff',
  'basket_verify': '#722ed1',
  'expired_submit': '#f53f3f',
  'warehouse_process': '#ff7d00',
  'replenish': '#00b42a'
}

export const flowTypeIcons: Record<FlowType, string> = {
  'scan_use': '📊',
  'basket_verify': '✅',
  'expired_submit': '⚠️',
  'warehouse_process': '🏭',
  'replenish': '📦'
}

export const submissionStatusNames: Record<SubmissionStatus, string> = {
  'pending': '待处理',
  'received': '已接收',
  'scrapped': '已报废'
}

export const submissionStatusColors: Record<SubmissionStatus, string> = {
  'pending': '#ff7d00',
  'received': '#1677ff',
  'scrapped': '#f53f3f'
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

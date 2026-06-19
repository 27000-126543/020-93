import type { Material } from '@/types'
import { categoryNames } from '@/types'
import { calculateRemainingDays, getMaterialStatus } from '@/utils/date'

function createMaterial(
  id: string,
  code: string,
  name: string,
  category: Material['category'],
  batchNumber: string,
  expireDate: string,
  quantity: number,
  manufacturer: string,
  specification: string
): Material {
  const remainingDays = calculateRemainingDays(expireDate)
  const status = getMaterialStatus(remainingDays)
  return {
    id,
    code,
    name,
    category,
    categoryName: categoryNames[category],
    batchNumber,
    expireDate,
    remainingDays,
    status,
    quantity,
    manufacturer,
    specification
  }
}

export const mockMaterials: Material[] = [
  createMaterial('1', 'ADH001', '3M Single Bond Universal 粘接剂', 'adhesive', 'B20250101', '2026-12-31', 12, '3M ESPE', '5ml/瓶'),
  createMaterial('2', 'ADH002', '可乐丽菲露粘接剂', 'adhesive', 'K20250315', '2026-07-15', 8, '可乐丽', '3ml/瓶'),
  createMaterial('3', 'ADH003', '义获嘉粘接剂', 'adhesive', 'V20250220', '2026-06-25', 5, '义获嘉', '4ml/瓶'),
  createMaterial('4', 'ADH004', 'GC 粘接剂', 'adhesive', 'G20240601', '2026-05-20', 3, 'GC', '5ml/瓶'),
  createMaterial('5', 'ADH005', '登士柏粘接剂', 'adhesive', 'D20240101', '2026-03-10', 2, '登士柏', '3ml/瓶'),
  createMaterial('6', 'ADH006', '皓齿粘接剂', 'adhesive', 'U20231101', '2025-12-01', 1, 'Ultradent', '5ml/瓶'),

  createMaterial('7', 'ETC001', '3M 酸蚀剂 37%', 'etchant', 'E20250401', '2027-03-31', 20, '3M ESPE', '2ml/支'),
  createMaterial('8', 'ETC002', 'GC 酸蚀剂', 'etchant', 'GE20250115', '2026-08-15', 10, 'GC', '2ml/支'),
  createMaterial('9', 'ETC003', '义获嘉酸蚀剂', 'etchant', 'VE20240901', '2026-07-01', 6, '义获嘉', '2.5ml/支'),
  createMaterial('10', 'ETC004', '可乐丽酸蚀剂', 'etchant', 'KE20240501', '2026-04-10', 4, '可乐丽', '2ml/支'),
  createMaterial('11', 'ETC005', '皓齿酸蚀剂', 'etchant', 'UE20231201', '2025-11-15', 2, 'Ultradent', '3ml/支'),

  createMaterial('12', 'ANE001', '阿替卡因肾上腺素注射液', 'anesthetic', 'A20250201', '2027-01-31', 50, '必兰', '1.7ml/支'),
  createMaterial('13', 'ANE002', '利多卡因注射液', 'anesthetic', 'L20250501', '2027-04-30', 30, '上海朝晖', '5ml/支'),
  createMaterial('14', 'ANE003', '甲哌卡因注射液', 'anesthetic', 'M20241001', '2026-09-15', 25, '斯康杜尼', '1.8ml/支'),
  createMaterial('15', 'ANE004', '罗哌卡因注射液', 'anesthetic', 'R20240301', '2026-02-28', 15, 'AstraZeneca', '10ml/支'),
  createMaterial('16', 'ANE005', '布比卡因注射液', 'anesthetic', 'B20231001', '2025-09-10', 8, '上海禾丰', '5ml/支'),

  createMaterial('17', 'TC001', '3M 临时冠树脂', 'temporary-crown', 'T20250301', '2027-02-28', 8, '3M ESPE', '50g/支'),
  createMaterial('18', 'TC002', 'GC 临时冠材料', 'temporary-crown', 'GT20241101', '2026-10-15', 6, 'GC', '40g/支'),
  createMaterial('19', 'TC003', '义获嘉临时冠', 'temporary-crown', 'VT20240601', '2026-05-20', 4, '义获嘉', '45g/支'),
  createMaterial('20', 'TC004', '登士柏临时冠', 'temporary-crown', 'DT20240101', '2025-12-25', 2, '登士柏', '50g/支'),
  createMaterial('21', 'TC005', '可乐丽临时冠', 'temporary-crown', 'KT20230801', '2025-07-15', 1, '可乐丽', '35g/支')
]

export function getMaterialByCode(code: string): Material | undefined {
  return mockMaterials.find(m => m.code === code)
}

export function getMaterialById(id: string): Material | undefined {
  return mockMaterials.find(m => m.id === id)
}

export function getMaterialsByStatus(status: Material['status']): Material[] {
  return mockMaterials.filter(m => m.status === status)
}

export function getMaterialsByCategory(category: Material['category']): Material[] {
  return mockMaterials.filter(m => m.category === category)
}

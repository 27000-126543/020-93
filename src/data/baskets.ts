import type { Basket, BasketItem, TreatmentType, Material } from '@/types'
import { categoryNames, treatmentNames } from '@/types'
import { mockMaterials } from './materials'
import { calculateRemainingDays, getMaterialStatus } from '@/utils/date'

function createBasketItem(material: Material, quantity: number, checked: boolean = false): BasketItem {
  const remainingDays = calculateRemainingDays(material.expireDate)
  const status = getMaterialStatus(remainingDays)
  return {
    id: `item-${material.id}`,
    basketId: '',
    materialId: material.id,
    materialName: material.name,
    materialCode: material.code,
    category: material.category,
    categoryName: categoryNames[material.category],
    quantity,
    verifiedCount: 0,
    checked,
    status,
    remainingDays,
    expireDate: material.expireDate
  }
}

export const mockBaskets: Basket[] = [
  {
    id: 'basket-1',
    name: 'A01种植手术备台',
    treatmentType: 'implant',
    treatmentName: treatmentNames['implant'],
    roomNumber: 'A01',
    items: [
      createBasketItem(mockMaterials[0], 1),
      createBasketItem(mockMaterials[6], 1),
      createBasketItem(mockMaterials[11], 2),
      createBasketItem(mockMaterials[16], 1)
    ],
    createdAt: '2026-06-20 08:30'
  },
  {
    id: 'basket-2',
    name: 'A02修复备台',
    treatmentType: 'restoration',
    treatmentName: treatmentNames['restoration'],
    roomNumber: 'A02',
    items: [
      createBasketItem(mockMaterials[1], 1),
      createBasketItem(mockMaterials[7], 1),
      createBasketItem(mockMaterials[12], 1),
      createBasketItem(mockMaterials[17], 1)
    ],
    createdAt: '2026-06-20 08:45'
  },
  {
    id: 'basket-3',
    name: 'B01正畸复诊备台',
    treatmentType: 'orthodontics',
    treatmentName: treatmentNames['orthodontics'],
    roomNumber: 'B01',
    items: [
      createBasketItem(mockMaterials[2], 1),
      createBasketItem(mockMaterials[8], 1),
      createBasketItem(mockMaterials[13], 1)
    ],
    createdAt: '2026-06-20 09:00'
  }
]

export function getBasketById(id: string): Basket | undefined {
  return mockBaskets.find(b => b.id === id)
}

export function getBasketsByTreatmentType(type: TreatmentType): Basket[] {
  return mockBaskets.filter(b => b.treatmentType === type)
}

export function getAllBaskets(): Basket[] {
  return mockBaskets
}

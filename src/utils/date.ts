import dayjs from 'dayjs'
import type { MaterialStatus } from '@/types'

export const WARNING_DAYS = 30

export function calculateRemainingDays(expireDate: string): number {
  const today = dayjs().startOf('day')
  const expire = dayjs(expireDate).startOf('day')
  return expire.diff(today, 'day')
}

export function getMaterialStatus(remainingDays: number): MaterialStatus {
  if (remainingDays < 0) return 'expired'
  if (remainingDays <= WARNING_DAYS) return 'warning'
  return 'available'
}

export function formatDate(date: string): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatDateTime(date: string): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export function getTodayDisplay(): string {
  return dayjs().format('YYYY年MM月DD日 dddd')
}

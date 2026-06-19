import type { Schedule } from '@/types'
import { treatmentNames } from '@/types'

export const mockSchedules: Schedule[] = [
  {
    id: '1',
    doctorName: '张医生',
    roomNumber: 'A01',
    roomName: '治疗间A01',
    time: '09:00-12:00',
    treatmentType: 'implant',
    treatmentName: treatmentNames['implant'],
    patientName: '王建国'
  },
  {
    id: '2',
    doctorName: '李医生',
    roomNumber: 'A02',
    roomName: '治疗间A02',
    time: '09:00-11:00',
    treatmentType: 'restoration',
    treatmentName: treatmentNames['restoration'],
    patientName: '刘芳'
  },
  {
    id: '3',
    doctorName: '王医生',
    roomNumber: 'B01',
    roomName: '治疗间B01',
    time: '10:00-12:00',
    treatmentType: 'orthodontics',
    treatmentName: treatmentNames['orthodontics'],
    patientName: '陈小明'
  },
  {
    id: '4',
    doctorName: '张医生',
    roomNumber: 'A01',
    roomName: '治疗间A01',
    time: '14:00-17:00',
    treatmentType: 'restoration',
    treatmentName: treatmentNames['restoration'],
    patientName: '赵伟'
  },
  {
    id: '5',
    doctorName: '李医生',
    roomNumber: 'A02',
    roomName: '治疗间A02',
    time: '14:00-16:00',
    treatmentType: 'implant',
    treatmentName: treatmentNames['implant'],
    patientName: '孙丽'
  },
  {
    id: '6',
    doctorName: '王医生',
    roomNumber: 'B01',
    roomName: '治疗间B01',
    time: '15:00-17:00',
    treatmentType: 'orthodontics',
    treatmentName: treatmentNames['orthodontics'],
    patientName: '周杰'
  }
]

export function getTodaySchedules(): Schedule[] {
  return mockSchedules
}

export function getScheduleById(id: string): Schedule | undefined {
  return mockSchedules.find(s => s.id === id)
}

export function getSchedulesByRoom(roomNumber: string): Schedule[] {
  return mockSchedules.filter(s => s.roomNumber === roomNumber)
}

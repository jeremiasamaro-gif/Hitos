import { create } from 'zustand'
import type { ClientPayment } from '@/lib/supabase'
import { mockClientPayments } from './mockData'

interface PaymentState {
  payments: ClientPayment[]
  loading: boolean
  fetchPayments: (projectId: string) => Promise<void>
  createPayment: (data: Omit<ClientPayment, 'id' | 'created_at'>) => Promise<void>
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,

  fetchPayments: async (projectId) => {
    set({ loading: true })
    await new Promise((r) => setTimeout(r, 100))
    const payments = mockClientPayments.filter((p) => p.project_id === projectId)
    set({ payments, loading: false })
  },

  createPayment: async (data) => {
    const payment: ClientPayment = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    mockClientPayments.push(payment)
    set((s) => ({ payments: [payment, ...s.payments] }))
  },
}))

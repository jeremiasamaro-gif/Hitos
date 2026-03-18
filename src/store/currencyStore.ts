import { create } from 'zustand'
import type { ExchangeRate } from '@/lib/supabase'
import { mockExchangeRates } from './mockData'
import { type CurrencyMode, convertAmount } from '@/utils/currency'

interface CurrencyState {
  mode: CurrencyMode
  latestRate: ExchangeRate | null
  setMode: (mode: CurrencyMode) => void
  fetchRate: (projectId: string) => Promise<void>
  setRate: (data: { project_id: string; date: string; rate_blue: number; created_by: string }) => Promise<void>
  convert: (amountArs: number) => number
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  mode: 'ARS',
  latestRate: null,

  setMode: (mode) => set({ mode }),

  fetchRate: async (projectId) => {
    const rates = mockExchangeRates.filter((r) => r.project_id === projectId)
    const latest = rates.length > 0 ? rates[rates.length - 1] : null
    set({ latestRate: latest })
  },

  setRate: async (data) => {
    const rate: ExchangeRate = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    mockExchangeRates.push(rate)
    set({ latestRate: rate })
  },

  convert: (amountArs) => {
    const { mode, latestRate } = get()
    return convertAmount(
      amountArs,
      mode,
      latestRate?.rate_blue ?? 0
    )
  },
}))

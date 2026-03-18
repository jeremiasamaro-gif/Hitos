import { create } from 'zustand'
import type { User } from '@/lib/supabase'
import { mockUsers } from './mockData'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: 'arquitecto' | 'cliente') => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    // Check localStorage for persisted mock session
    const savedEmail = localStorage.getItem('hitos-mock-user')
    if (savedEmail) {
      const user = mockUsers.find((u) => u.email === savedEmail) ?? null
      set({ user, loading: false })
    } else {
      set({ loading: false })
    }
  },

  signIn: async (email, _password) => {
    set({ loading: true, error: null })
    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      set({ loading: false, error: 'Usuario no encontrado. Usá arq@test.com o cliente@test.com' })
      throw new Error('User not found')
    }
    localStorage.setItem('hitos-mock-user', email)
    set({ user, loading: false })
  },

  signUp: async (email, _password, name, role) => {
    set({ loading: true, error: null })
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role,
      honorario_direccion: 0,
      honorario_proyecto: 0,
      firma_url: null,
      firma_en_pdf: false,
      logo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    localStorage.setItem('hitos-mock-user', email)
    set({ user: newUser, loading: false })
  },

  signOut: async () => {
    localStorage.removeItem('hitos-mock-user')
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))

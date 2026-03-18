import { create } from 'zustand'
import type { ProjectMember } from '@/lib/supabase'
import { mockProjectMembers } from './mockData'

interface MemberState {
  members: ProjectMember[]
  loading: boolean
  fetchMembers: (projectId: string) => Promise<void>
  inviteMember: (data: { project_id: string; email: string; role: 'cliente' }) => Promise<void>
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  loading: false,

  fetchMembers: async (projectId) => {
    set({ loading: true })
    await new Promise((r) => setTimeout(r, 100))
    const members = mockProjectMembers.filter((m) => m.project_id === projectId)
    set({ members, loading: false })
  },

  inviteMember: async (data) => {
    const member: ProjectMember = {
      id: crypto.randomUUID(),
      project_id: data.project_id,
      user_id: crypto.randomUUID(),
      role: data.role,
      created_at: new Date().toISOString(),
    }
    mockProjectMembers.push(member)
    set((s) => ({ members: [...s.members, member] }))
  },
}))

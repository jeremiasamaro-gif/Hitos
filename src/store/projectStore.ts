import { create } from 'zustand'
import type { Project, ObraType } from '@/lib/supabase'
import { mockProjects } from './mockData'

interface CreateProjectData {
  name: string
  address?: string
  architect_id: string
  obra_type?: ObraType
  description?: string
  start_date?: string
  end_date_estimated?: string
  weeks_estimated?: number
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (data: CreateProjectData) => Promise<Project>
  updateProject: (id: string, data: Partial<Pick<Project, 'name' | 'address' | 'usd_rate_blue'>>) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    // Simulate small delay for realistic feel
    await new Promise((r) => setTimeout(r, 200))
    set({ projects: [...mockProjects], loading: false })
  },

  fetchProject: async (id) => {
    set({ loading: true })
    await new Promise((r) => setTimeout(r, 100))
    const project = mockProjects.find((p) => p.id === id) ?? null
    set({ currentProject: project, loading: false })
  },

  createProject: async (data) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      address: data.address ?? null,
      architect_id: data.architect_id,
      usd_rate_blue: 1420,
      obra_type: data.obra_type ?? null,
      description: data.description ?? null,
      start_date: data.start_date ?? null,
      end_date_estimated: data.end_date_estimated ?? null,
      weeks_estimated: data.weeks_estimated ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockProjects.push(project)
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  updateProject: async (id, data) => {
    const idx = mockProjects.findIndex((p) => p.id === id)
    if (idx >= 0) {
      mockProjects[idx] = { ...mockProjects[idx], ...data, updated_at: new Date().toISOString() }
      const updated = mockProjects[idx]
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: s.currentProject?.id === id ? updated : s.currentProject,
      }))
    }
  },
}))

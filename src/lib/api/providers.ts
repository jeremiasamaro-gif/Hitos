import type { Provider } from '../supabase'
import { mockProviders } from '@/store/mockData'

export async function getProviders(architectId: string): Promise<Provider[]> {
  await new Promise((r) => setTimeout(r, 100))
  return mockProviders.filter((p) => p.architect_id === architectId)
}

export async function createProvider(
  data: Pick<Provider, 'architect_id' | 'nombre'> & Partial<Pick<Provider, 'apellido' | 'rubro' | 'telefono' | 'email' | 'notas'>>
): Promise<Provider> {
  await new Promise((r) => setTimeout(r, 100))
  const newProvider: Provider = {
    id: crypto.randomUUID(),
    architect_id: data.architect_id,
    nombre: data.nombre,
    apellido: data.apellido ?? null,
    rubro: data.rubro ?? null,
    telefono: data.telefono ?? null,
    email: data.email ?? null,
    notas: data.notas ?? null,
    created_at: new Date().toISOString(),
  }
  mockProviders.push(newProvider)
  return newProvider
}

export async function updateProvider(
  id: string,
  data: Partial<Pick<Provider, 'nombre' | 'apellido' | 'rubro' | 'telefono' | 'email' | 'notas'>>
): Promise<Provider> {
  await new Promise((r) => setTimeout(r, 100))
  const idx = mockProviders.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Provider not found')
  Object.assign(mockProviders[idx], data)
  return mockProviders[idx]
}

export async function deleteProvider(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100))
  const idx = mockProviders.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Provider not found')
  mockProviders.splice(idx, 1)
}

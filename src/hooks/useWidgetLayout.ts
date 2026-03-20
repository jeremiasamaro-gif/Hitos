import { useState, useCallback } from 'react'
import { getDefaultLayout, WIDGET_REGISTRY } from '@/lib/widgetRegistry'

const STORAGE_KEY = (projectId: string) => `hitos-widgets-${projectId}`

export function useWidgetLayout(projectId: string) {
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(projectId))
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        // Filter out widgets that no longer exist in registry
        return parsed.filter((id) => WIDGET_REGISTRY.some((w) => w.id === id))
      }
    } catch {}
    return getDefaultLayout()
  })

  const persist = useCallback((newOrder: string[]) => {
    setOrder(newOrder)
    localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(newOrder))
  }, [projectId])

  const reorder = useCallback((activeId: string, overId: string) => {
    setOrder((prev) => {
      const oldIndex = prev.indexOf(activeId)
      const newIndex = prev.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const copy = [...prev]
      copy.splice(oldIndex, 1)
      copy.splice(newIndex, 0, activeId)
      localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(copy))
      return copy
    })
  }, [projectId])

  const toggleWidget = useCallback((widgetId: string) => {
    setOrder((prev) => {
      const exists = prev.includes(widgetId)
      const newOrder = exists
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
      localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(newOrder))
      return newOrder
    })
  }, [projectId])

  const resetLayout = useCallback(() => {
    const defaultLayout = getDefaultLayout()
    persist(defaultLayout)
  }, [persist])

  return { order, reorder, toggleWidget, resetLayout }
}

import { useState, useCallback } from 'react'
import { getDefaultLayout, getWidgetsForSection, type WidgetSection } from '@/lib/widgetRegistry'

const STORAGE_KEY = (projectId: string, section: WidgetSection) =>
  `hitos_widgets_${projectId}_${section}`

export function useWidgetLayout(projectId: string, section: WidgetSection = 'resumen') {
  const sectionWidgets = getWidgetsForSection(section)

  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(projectId, section))
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        return parsed.filter((id) => sectionWidgets.some((w) => w.id === id))
      }
    } catch {}
    return getDefaultLayout(section)
  })

  const persist = useCallback((newOrder: string[]) => {
    setOrder(newOrder)
    localStorage.setItem(STORAGE_KEY(projectId, section), JSON.stringify(newOrder))
  }, [projectId, section])

  const reorder = useCallback((activeId: string, overId: string) => {
    setOrder((prev) => {
      const oldIndex = prev.indexOf(activeId)
      const newIndex = prev.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const copy = [...prev]
      copy.splice(oldIndex, 1)
      copy.splice(newIndex, 0, activeId)
      localStorage.setItem(STORAGE_KEY(projectId, section), JSON.stringify(copy))
      return copy
    })
  }, [projectId, section])

  const toggleWidget = useCallback((widgetId: string) => {
    setOrder((prev) => {
      const exists = prev.includes(widgetId)
      const newOrder = exists
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
      localStorage.setItem(STORAGE_KEY(projectId, section), JSON.stringify(newOrder))
      return newOrder
    })
  }, [projectId, section])

  const resetLayout = useCallback(() => {
    const defaultLayout = getDefaultLayout(section)
    persist(defaultLayout)
  }, [persist, section])

  return { order, reorder, toggleWidget, resetLayout }
}

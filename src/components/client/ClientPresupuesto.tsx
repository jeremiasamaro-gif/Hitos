import { useState, useMemo } from 'react'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCommentStore } from '@/store/commentStore'
import { buildTree, type BudgetTreeNode } from '@/lib/budgetUtils'
import { formatCurrency } from '@/utils/currency'
import { ClientComentarioDrawer } from './ClientComentarioDrawer'

export function ClientPresupuesto() {
  const { project, currencyMode, convert } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const comments = useCommentStore((s) => s.comments)

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [drawerItem, setDrawerItem] = useState<{ id: string; name: string } | null>(null)

  const tree = useMemo(() => buildTree(items), [items])

  const spentByItem = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.budget_item_id) {
        map.set(e.budget_item_id, (map.get(e.budget_item_id) || 0) + e.amount_ars)
      }
    }
    return map
  }, [expenses])

  const commentCountByItem = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of comments) {
      if (c.budget_item_id) {
        map.set(c.budget_item_id, (map.get(c.budget_item_id) || 0) + 1)
      }
    }
    return map
  }, [comments])

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const collapseAll = () => {
    const all: Record<string, boolean> = {}
    tree.forEach((n) => { all[n.item.id] = true })
    setCollapsed(all)
  }

  const expandAll = () => setCollapsed({})

  const fmt = (ars: number) => formatCurrency(convert(ars), currencyMode)

  const getSpentForNode = (node: BudgetTreeNode): number => {
    let spent = spentByItem.get(node.item.id) || 0
    for (const c of node.children) spent += getSpentForNode(c)
    return spent
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Presupuesto</h1>
        <div className="flex items-center gap-3">
          <button onClick={collapseAll} className="text-xs text-secondary hover:text-accent transition-colors">Colapsar todo</button>
          <button onClick={expandAll} className="text-xs text-secondary hover:text-accent transition-colors">Expandir todo</button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-secondary text-left bg-card">
              <th className="px-3 py-2.5 w-20">Cod.</th>
              <th className="px-3 py-2.5">Descripción</th>
              <th className="px-3 py-2.5 w-16">Ud.</th>
              <th className="px-3 py-2.5 w-20 text-right">Cant.</th>
              <th className="px-3 py-2.5 w-28 text-right">P. Unit.</th>
              <th className="px-3 py-2.5 w-32 text-right">Presupuesto</th>
              <th className="px-3 py-2.5 w-32 text-right">Gastado</th>
              <th className="px-3 py-2.5 w-20 text-right">%</th>
              <th className="px-3 py-2.5 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {tree.map((node) => (
              <ReadOnlyRow
                key={node.item.id}
                node={node}
                collapsed={collapsed}
                toggleCollapse={toggleCollapse}
                fmt={fmt}
                spentByItem={spentByItem}
                commentCountByItem={commentCountByItem}
                getSpentForNode={getSpentForNode}
                onComment={setDrawerItem}
              />
            ))}
          </tbody>
        </table>
      </div>

      {drawerItem && (
        <ClientComentarioDrawer
          open={!!drawerItem}
          onClose={() => setDrawerItem(null)}
          projectId={project.id}
          budgetItemId={drawerItem.id}
          budgetItemName={drawerItem.name}
        />
      )}
    </div>
  )
}

// ── Read-Only Row ──

interface ReadOnlyRowProps {
  node: BudgetTreeNode
  collapsed: Record<string, boolean>
  toggleCollapse: (id: string) => void
  fmt: (ars: number) => string
  spentByItem: Map<string, number>
  commentCountByItem: Map<string, number>
  getSpentForNode: (node: BudgetTreeNode) => number
  onComment: (item: { id: string; name: string }) => void
}

function ReadOnlyRow({ node, collapsed, toggleCollapse, fmt, spentByItem, commentCountByItem, getSpentForNode, onComment }: ReadOnlyRowProps) {
  const isCategory = node.level === 0
  const isSub = node.level === 1
  const isCollapsed = isCategory && collapsed[node.item.id]
  const commentCount = commentCountByItem.get(node.item.id) || 0

  const spent = getSpentForNode(node)
  const budget = node.total
  const pct = budget > 0 ? (spent / budget) * 100 : 0
  const exceeded = pct > 100

  const rowBg = isCategory ? 'bg-[#F0EFFE]' : isSub ? 'bg-[#F7F6F1]' : ''
  const borderStyle = isCategory
    ? { borderLeft: '3px solid var(--color-accent)' }
    : isSub
    ? { borderLeft: '3px solid #C7D2FE' }
    : {}
  const codeColor = isCategory ? 'text-[var(--color-accent)]' : 'text-secondary'
  const descClass = isCategory
    ? 'font-bold text-[var(--color-accent)]'
    : isSub
    ? 'font-semibold text-[#4338CA]'
    : 'font-normal text-primary'

  return (
    <>
      <tr
        className={`border-b border-border/50 ${rowBg} ${isCategory ? 'cursor-pointer' : ''}`}
        style={borderStyle}
        onClick={isCategory && node.children.length > 0 ? () => toggleCollapse(node.item.id) : undefined}
      >
        <td className={`px-3 py-2 font-mono text-xs ${codeColor}`}>
          <span className="inline-flex items-center gap-1">
            {isCategory && node.children.length > 0 && (
              <ChevronRight
                size={14}
                className="shrink-0 transition-transform duration-200"
                style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
              />
            )}
            {node.item.item_code}
          </span>
        </td>
        <td className={`px-3 py-2 ${descClass}`} style={{ paddingLeft: `${12 + node.level * 16}px` }}>
          <span className="flex items-center gap-2">
            {node.item.description}
            {(isSub || node.level === 2) && node.item.week_number != null && (
              <span className="bg-[#EEF2FF] text-[var(--color-accent)] rounded-full text-[11px] px-2 py-0.5 font-normal shrink-0">
                Semana {node.item.week_number}
              </span>
            )}
          </span>
        </td>
        {node.children.length > 0 ? (
          <>
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2 text-right font-mono font-bold">{fmt(budget)}</td>
          </>
        ) : (
          <>
            <td className="px-3 py-2 text-secondary">{node.item.unit}</td>
            <td className="px-3 py-2 text-right font-mono">{node.item.quantity}</td>
            <td className="px-3 py-2 text-right font-mono">{fmt(node.item.unit_price)}</td>
            <td className="px-3 py-2 text-right font-mono font-semibold">{fmt(node.item.total_price)}</td>
          </>
        )}
        <td className="px-3 py-2 text-right font-mono">{spent > 0 ? fmt(spent) : '—'}</td>
        <td className={`px-3 py-2 text-right font-mono text-xs ${exceeded ? 'text-status-exceeded font-medium' : 'text-secondary'}`}>
          {pct > 0 ? `${pct.toFixed(0)}%` : '—'}
        </td>
        <td className="px-3 py-2 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); onComment({ id: node.item.id, name: node.item.description }) }}
            className="relative p-1 text-secondary hover:text-accent transition-colors"
            title="Comentarios"
          >
            <MessageSquare size={14} />
            {commentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                {commentCount > 9 ? '9+' : commentCount}
              </span>
            )}
          </button>
        </td>
      </tr>

      {!isCollapsed && node.children.map((child) => (
        <ReadOnlyRow
          key={child.item.id}
          node={child}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
          fmt={fmt}
          spentByItem={spentByItem}
          commentCountByItem={commentCountByItem}
          getSpentForNode={getSpentForNode}
          onComment={onComment}
        />
      ))}
    </>
  )
}

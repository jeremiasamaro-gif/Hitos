import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { useCommentStore } from '@/store/commentStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { ComentariosDrawer } from '@/components/comments/ComentariosDrawer'
import { buildPnlSections, getPeriodLabel, getSpentStatus, type PnlPeriod, type PnlLineItem, type PnlSection, type VariationKind } from '@/lib/pnlUtils'
import { formatCurrency, type CurrencyMode } from '@/utils/currency'
import { Select } from '@/components/ui/Select'
import { ExportPDFButton } from '@/components/ui/ExportPDFButton'

export function PnlPage() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { convert, mode } = useCurrencyStore()
  const { project, userRole } = useProjectContext()
  const comments = useCommentStore((s) => s.comments)
  const getUnread = useCommentStore((s) => s.getUnreadCount)

  const [period, setPeriod] = useState<PnlPeriod>('monthly')
  const [drawerItem, setDrawerItem] = useState<{ id: string; title: string } | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const refDate = new Date()
  const sections = useMemo(() => buildPnlSections(items, expenses, period, refDate, convert), [items, expenses, period, convert])
  const labels = useMemo(() => getPeriodLabel(period, refDate), [period])

  // Compute budget amounts per item for spent status
  const budgetByItem = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) {
      map.set(item.id, convert(item.total_price))
    }
    return map
  }, [items, convert])

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const fmt = (amount: number) => formatCurrency(amount, mode)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-heading font-bold">Estado de Resultados</h1>
        <div className="flex items-center gap-2">
          <ExportPDFButton variant="pnl" label="Exportar PNL" />
          <div className="w-36">
            <Select
              options={[
                { value: 'monthly', label: 'Mensual' },
                { value: 'quarterly', label: 'Trimestral' },
                { value: 'yearly', label: 'Anual' },
              ]}
              value={period}
              onChange={(e) => setPeriod(e.target.value as PnlPeriod)}
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-3 border-b border-border text-xs font-semibold text-secondary uppercase">
          <div className="col-span-5">Concepto</div>
          <div className="col-span-2 text-right">{labels.current}</div>
          <div className="col-span-2 text-right">{labels.previous}</div>
          <div className="col-span-2 text-right">Var.</div>
          <div className="col-span-1" />
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <PnlSectionBlock
            key={section.type}
            section={section}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            fmt={fmt}
            mode={mode}
            budgetByItem={budgetByItem}
            comments={comments}
            getUnread={getUnread}
            onCommentClick={(id, title) => setDrawerItem({ id, title })}
          />
        ))}
      </div>

      <ComentariosDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        projectId={project.id}
        budgetItemId={drawerItem?.id || ''}
        title={drawerItem?.title || ''}
      />
    </div>
  )
}

// ============================================
// SECTION BLOCK
// ============================================

interface SectionProps {
  section: PnlSection
  collapsed: Set<string>
  toggleCollapse: (id: string) => void
  fmt: (n: number) => string
  mode: CurrencyMode
  budgetByItem: Map<string, number>
  comments: { budget_item_id: string | null }[]
  getUnread: (itemId: string) => number
  onCommentClick: (id: string, title: string) => void
}

function PnlSectionBlock({ section, collapsed, toggleCollapse, fmt, budgetByItem, comments, getUnread, onCommentClick }: SectionProps) {
  const colorMap: Record<string, string> = { budget: 'border-green-500', spent: 'border-red-500', result: 'border-white' }
  const borderColor = colorMap[section.type] || 'border-border'

  return (
    <div>
      {/* Section header line */}
      <div className={`flex items-center gap-3 px-4 py-2 border-l-4 ${borderColor} bg-app/50`}>
        <span className="text-xs font-bold tracking-wider text-secondary">{section.label}</span>
        <div className="flex-1 border-t border-border/50" />
      </div>

      {/* Category items */}
      {section.items.map((line) => (
        <PnlCategoryRow
          key={line.id}
          line={line}
          sectionType={section.type}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
          fmt={fmt}
          budgetByItem={budgetByItem}
          comments={comments}
          getUnread={getUnread}
          onCommentClick={onCommentClick}
        />
      ))}

      {/* Section total */}
      <div className="grid grid-cols-12 gap-1 px-4 py-2 border-t border-border bg-app/30 font-semibold text-sm">
        <div className="col-span-5 font-mono">{section.total.description}</div>
        <div className="col-span-2 text-right font-mono">{fmt(section.total.currentAmount)}</div>
        <div className="col-span-2 text-right font-mono">{fmt(section.total.previousAmount)}</div>
        <div className="col-span-2 text-right">
          <VariationBadge variation={section.total.variation} />
        </div>
        <div className="col-span-1" />
      </div>
    </div>
  )
}

// ============================================
// CATEGORY ROW (collapsible)
// ============================================

interface CategoryRowProps {
  line: PnlLineItem
  sectionType: PnlSection['type']
  collapsed: Set<string>
  toggleCollapse: (id: string) => void
  fmt: (n: number) => string
  budgetByItem: Map<string, number>
  comments: { budget_item_id: string | null }[]
  getUnread: (itemId: string) => number
  onCommentClick: (id: string, title: string) => void
}

function PnlCategoryRow({ line, sectionType, collapsed, toggleCollapse, fmt, budgetByItem, comments, getUnread, onCommentClick }: CategoryRowProps) {
  const isOpen = !collapsed.has(line.id)
  const hasChildren = line.children.length > 0

  return (
    <>
      {/* Parent / Category row */}
      <div
        className={`grid grid-cols-12 gap-1 px-4 py-2 border-b border-border/30 ${
          line.level === 0 ? 'bg-card/40 cursor-pointer hover:bg-card/60' : ''
        }`}
        onClick={() => hasChildren && toggleCollapse(line.id)}
      >
        <div className="col-span-5 flex items-center gap-2" style={{ paddingLeft: `${line.level * 16}px` }}>
          {hasChildren && (
            isOpen ? <ChevronDown size={14} className="text-secondary shrink-0" /> : <ChevronRight size={14} className="text-secondary shrink-0" />
          )}
          <span className={`${line.level === 0 ? 'uppercase font-bold text-sm' : line.level === 1 ? 'font-semibold text-sm' : 'text-secondary text-sm'}`}>
            <span className="text-secondary/50 font-mono text-xs mr-2">{line.code}</span>
            {line.description}
          </span>
        </div>
        <div className="col-span-2 text-right font-mono text-sm">{fmt(line.currentAmount)}</div>
        <div className="col-span-2 text-right font-mono text-sm text-secondary">
          {line.previousAmount === 0 && line.currentAmount > 0 ? '—' : fmt(line.previousAmount)}
        </div>
        <div className="col-span-2 text-right">
          {sectionType === 'spent' ? (
            <SpentStatusBadge spent={line.currentAmount} budgeted={budgetByItem.get(line.budgetItemId) || 0} variation={line.variation} />
          ) : (
            <VariationBadge variation={line.variation} />
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <CommentIcon
            itemId={line.budgetItemId}
            comments={comments}
            getUnread={getUnread}
            onClick={() => onCommentClick(line.budgetItemId, line.description)}
          />
        </div>
      </div>

      {/* Children (subcategories / items) */}
      {isOpen && line.children.map((child) => (
        <div
          key={child.id}
          className="grid grid-cols-12 gap-1 px-4 py-1.5 border-b border-border/20"
        >
          <div className="col-span-5 flex items-center" style={{ paddingLeft: `${(child.level + 1) * 16}px` }}>
            <span className="text-sm text-secondary">
              <span className="font-mono text-xs mr-2 text-secondary/40">{child.code}</span>
              {child.description}
            </span>
          </div>
          <div className="col-span-2 text-right font-mono text-sm">{fmt(child.currentAmount)}</div>
          <div className="col-span-2 text-right font-mono text-sm text-secondary">
            {child.previousAmount === 0 && child.currentAmount > 0 ? '—' : fmt(child.previousAmount)}
          </div>
          <div className="col-span-2 text-right">
            {sectionType === 'spent' ? (
              <SpentStatusBadge spent={child.currentAmount} budgeted={budgetByItem.get(child.budgetItemId) || 0} variation={child.variation} />
            ) : (
              <VariationBadge variation={child.variation} />
            )}
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <CommentIcon
              itemId={child.budgetItemId}
              comments={comments}
              getUnread={getUnread}
              onClick={() => onCommentClick(child.budgetItemId, child.description)}
            />
          </div>
        </div>
      ))}
    </>
  )
}

// ============================================
// VARIATION BADGE
// ============================================

function VariationBadge({ variation }: { variation: { value: number; kind: VariationKind } }) {
  const { value, kind } = variation

  if (kind === 'zero') return <span className="text-xs text-secondary font-mono">0%</span>
  if (kind === 'new') return <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent">nuevo</span>
  if (kind === 'gone') return <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">-100%</span>

  const color = kind === 'positive' ? 'text-green-400' : 'text-red-400'
  const sign = kind === 'positive' ? '+' : ''

  return <span className={`text-xs font-mono ${color}`}>{sign}{value.toFixed(1)}%</span>
}

// ============================================
// SPENT STATUS BADGE (semáforo)
// ============================================

function SpentStatusBadge({ spent, budgeted, variation }: { spent: number; budgeted: number; variation: { value: number; kind: VariationKind } }) {
  const status = getSpentStatus(spent, budgeted)

  if (status === 'exceeded') {
    return <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">Excedido</span>
  }
  if (status === 'at_risk') {
    return <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-400">En riesgo</span>
  }

  return <VariationBadge variation={variation} />
}

// ============================================
// COMMENT ICON
// ============================================

function CommentIcon({ itemId, comments, getUnread, onClick }: {
  itemId: string
  comments: { budget_item_id: string | null }[]
  getUnread: (id: string) => number
  onClick: () => void
}) {
  const count = comments.filter((c) => c.budget_item_id === itemId).length
  const unread = getUnread(itemId)
  if (count === 0 && unread === 0) return null

  return (
    <button onClick={(e) => { e.stopPropagation(); onClick() }} className="relative p-0.5 text-secondary hover:text-accent transition-colors">
      <MessageSquare size={14} />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-status-exceeded text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}

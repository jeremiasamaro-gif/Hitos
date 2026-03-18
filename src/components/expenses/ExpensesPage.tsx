import { useState } from 'react'
import { ExpenseFilters } from './ExpenseFilters'
import { ExpenseTable } from './ExpenseTable'
import { ExpenseFormModal } from './ExpenseFormModal'
import { Button } from '@/components/ui/Button'
import { Plus, Search } from 'lucide-react'

export function ExpensesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">Gastos</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-app border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nuevo Gasto
          </Button>
        </div>
      </div>

      <ExpenseFilters />
      <ExpenseTable searchQuery={searchQuery} />

      <ExpenseFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

import { useState } from 'react'
import { ExpenseFilters } from './ExpenseFilters'
import { ExpenseTable } from './ExpenseTable'
import { ExpenseFormModal } from './ExpenseFormModal'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export function ExpensesPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">Gastos</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo Gasto
        </Button>
      </div>

      <ExpenseFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ExpenseTable searchQuery={searchQuery} />

      <ExpenseFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

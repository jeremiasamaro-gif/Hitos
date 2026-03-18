import { useState, useEffect, type FormEvent } from 'react'
import { usePaymentStore } from '@/store/paymentStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useAuthStore } from '@/store/authStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { PaymentTable } from './PaymentTable'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export function MisPagosPage() {
  const { project } = useProjectContext()
  const user = useAuthStore((s) => s.user)
  const { payments, fetchPayments, createPayment } = usePaymentStore()
  const items = useBudgetStore((s) => s.items)

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'ARS' | 'USD' | 'EUR'>('ARS')
  const [exchangeRate, setExchangeRate] = useState('1450')
  const [method, setMethod] = useState('transferencia')
  const [description, setDescription] = useState('')
  const [budgetItemId, setBudgetItemId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPayments(project.id)
  }, [project.id, fetchPayments])

  const parents = items.filter((i) => !i.parent_id)
  const rubroOptions = [
    { value: '', label: 'General (sin rubro)' },
    ...parents.map((p) => ({ value: p.id, label: p.description })),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !amount) return
    setLoading(true)

    const amountNum = parseFloat(amount)
    const rate = currency !== 'ARS' ? parseFloat(exchangeRate) : null
    const amountArs = currency !== 'ARS' ? amountNum * (rate || 1) : amountNum

    await createPayment({
      project_id: project.id,
      user_id: user.id,
      date,
      amount: amountNum,
      currency,
      exchange_rate: rate,
      amount_ars: amountArs,
      payment_method: method,
      description: description || null,
      budget_item_id: budgetItemId || null,
    })

    setAmount('')
    setDescription('')
    setBudgetItemId('')
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-xl font-heading font-bold mb-6">Mis Pagos</h1>

      <Card className="p-4 mb-6">
        <h2 className="text-sm font-heading font-semibold mb-4">Registrar pago</h2>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input label="Monto" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <Select
            label="Moneda"
            options={[
              { value: 'ARS', label: 'ARS' },
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
            ]}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'ARS' | 'USD' | 'EUR')}
          />
          {currency !== 'ARS' && (
            <Input
              label="Tipo de cambio"
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
          )}
          <Select
            label="Método"
            options={[
              { value: 'transferencia', label: 'Transferencia' },
              { value: 'efectivo', label: 'Efectivo' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'tarjeta', label: 'Tarjeta' },
            ]}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          />
          <Select
            label="Rubro"
            options={rubroOptions}
            value={budgetItemId}
            onChange={(e) => setBudgetItemId(e.target.value)}
          />
          <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Registrando...' : 'Registrar pago'}
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="text-sm font-heading font-semibold mb-3">Historial de pagos</h2>
      <PaymentTable payments={payments} />
    </div>
  )
}

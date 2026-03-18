import { useCurrencyStore } from '@/store/currencyStore'
import type { CurrencyMode } from '@/utils/currency'

const modes: { value: CurrencyMode; label: string }[] = [
  { value: 'ARS', label: 'ARS' },
  { value: 'USD_BLUE', label: 'USD Blue' },
]

export function CurrencySelector() {
  const { mode, setMode } = useCurrencyStore()

  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors
            ${mode === m.value ? 'bg-accent text-white' : 'bg-card text-secondary hover:text-primary'}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

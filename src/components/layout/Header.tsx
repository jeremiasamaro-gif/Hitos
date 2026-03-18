import { useAuthStore } from '@/store/authStore'
import { CurrencySelector } from '@/components/ui/CurrencySelector'
import { Badge } from '@/components/ui/Badge'
import { LogOut } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuthStore()

  return (
    <header className="flex items-center justify-between py-3 px-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <CurrencySelector />

      <div className="flex items-center gap-3">
        <Badge variant={user?.role === 'arquitecto' ? 'accent' : 'default'}>
          {user?.role === 'arquitecto' ? 'Arquitecto' : 'Cliente'}
        </Badge>
        <span className="text-sm text-primary">{user?.name}</span>
        <button
          onClick={signOut}
          className="p-1.5 text-secondary hover:text-primary transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}

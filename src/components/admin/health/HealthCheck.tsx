import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { mockActivityLogs } from '@/store/mockData'

export function HealthCheck() {
  const [ping, setPing] = useState<number | null>(null)
  const [status, setStatus] = useState<'ok' | 'slow' | 'error'>('ok')
  const [lastCheck, setLastCheck] = useState<string>(new Date().toISOString())

  const checkHealth = () => {
    const start = performance.now()
    // Simulate DB ping
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - start + Math.random() * 40 + 10)
      setPing(elapsed)
      setStatus(elapsed > 500 ? 'slow' : 'ok')
      setLastCheck(new Date().toISOString())
    }, Math.random() * 50 + 20)
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const statusColors = { ok: '#22C55E', slow: '#EAB308', error: '#EF4444' }
  const statusLabels = { ok: 'OK', slow: 'Lento', error: 'Error' }

  const recentErrors = mockActivityLogs
    .filter((l) => l.action === 'error')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const formatDate = (d: string) => new Date(d).toLocaleString('es-AR')

  return (
    <div className="space-y-6">
      {/* Supabase Status */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium">Estado de Supabase</h2>
          <button onClick={checkHealth} className="p-1 text-secondary hover:text-accent transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: statusColors[status] }} />
                <span className="text-lg font-bold" style={{ color: statusColors[status] }}>{statusLabels[status]}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Tiempo de respuesta</p>
              <p className="text-lg font-bold font-mono">{ping !== null ? `${ping}ms` : '...'}</p>
            </div>
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Último check</p>
              <p className="text-sm font-mono text-secondary">{formatDate(lastCheck)}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted mt-3">Auto-refresh cada 30 segundos</p>
        </div>
      </div>

      {/* Errors */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Últimos errores</h2>
        </div>
        <div className="p-5">
          {recentErrors.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">✅</span>
              <p className="text-sm text-secondary mt-2">Sin errores registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentErrors.map((log) => (
                <div key={log.id} className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                  <p className="text-red-700">{JSON.stringify(log.details)}</p>
                  <p className="text-[10px] text-red-400 mt-1 font-mono">{formatDate(log.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Información del sistema</h2>
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Rama activa</span>
            <span className="text-sm font-mono font-medium">staging</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Entorno</span>
            <span className="text-sm font-mono font-medium">development</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Framework</span>
            <span className="text-sm font-mono font-medium">React 18 + Vite</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Base de datos</span>
            <span className="text-sm font-mono font-medium">Supabase (mock)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

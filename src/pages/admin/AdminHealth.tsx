import { HealthCheck } from '@/components/admin/health/HealthCheck'

export function AdminHealth() {
  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-heading font-bold">Health Check</h1>
      <HealthCheck />
    </div>
  )
}

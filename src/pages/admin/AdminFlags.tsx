import { FeatureFlagsTable } from '@/components/admin/flags/FeatureFlagsTable'

export function AdminFlags() {
  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-xl font-heading font-bold">Feature Flags</h1>
      <p className="text-sm text-secondary">Activá o desactivá features para todos los usuarios, por plan o por usuario específico.</p>
      <FeatureFlagsTable />
    </div>
  )
}

import { mockActivityLogs } from '@/store/mockData'
import type { ActivityLog } from '@/lib/supabase'

export function logActivity(
  userId: string,
  action: string,
  details?: Record<string, unknown>
): void {
  const log: ActivityLog = {
    id: crypto.randomUUID(),
    user_id: userId,
    action,
    details: details ?? null,
    created_at: new Date().toISOString(),
  }
  mockActivityLogs.push(log)
}

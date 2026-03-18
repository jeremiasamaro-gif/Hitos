import { useCommentStore } from '@/store/commentStore'

export function UnreadBadge({ entityId }: { entityId: string }) {
  const count = useCommentStore((s) => s.getUnreadCount(entityId))
  if (count === 0) return null

  return (
    <span className="bg-status-exceeded text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  )
}

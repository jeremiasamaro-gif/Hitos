import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/formatters'
import type { Comment, User } from '@/lib/supabase'

interface Props {
  comment: Comment
  users: Map<string, User>
  onReply?: () => void
}

export function CommentBubble({ comment, users, onReply }: Props) {
  const author = users.get(comment.user_id)
  const isArchitect = author?.role === 'arquitecto'

  return (
    <div className={`rounded-lg p-3 ${comment.parent_id ? 'ml-8 bg-app' : 'bg-card'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium">{author?.name || 'Usuario'}</span>
        <Badge variant={isArchitect ? 'accent' : 'default'}>
          {isArchitect ? 'Arq' : 'Cliente'}
        </Badge>
        <span className="text-xs text-secondary ml-auto">{formatDate(comment.created_at)}</span>
      </div>
      <p className="text-sm text-primary">{comment.text}</p>
      {!comment.parent_id && onReply && (
        <button
          onClick={onReply}
          className="text-xs text-accent hover:underline mt-2"
        >
          Responder
        </button>
      )}
    </div>
  )
}

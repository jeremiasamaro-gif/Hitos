import { useState, useEffect } from 'react'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'
import { CommentBubble } from './CommentBubble'
import { CommentInput } from './CommentInput'
import type { User } from '@/lib/supabase'
import { mockUsers } from '@/store/mockData'

interface Props {
  projectId: string
  budgetItemId?: string
  expenseId?: string
}

export function CommentThread({ projectId, budgetItemId, expenseId }: Props) {
  const { comments, fetchComments, createComment, replyComment, markAsRead } = useCommentStore()
  const user = useAuthStore((s) => s.user)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [users, setUsers] = useState<Map<string, User>>(new Map())

  const entityId = budgetItemId || expenseId || ''

  // Filter comments for this entity
  const entityComments = comments.filter((c) => {
    if (budgetItemId) return c.budget_item_id === budgetItemId
    if (expenseId) return c.expense_id === expenseId
    return false
  })

  // Group into threads
  const topLevel = entityComments.filter((c) => !c.parent_id)
  const replies = entityComments.filter((c) => c.parent_id)

  useEffect(() => {
    fetchComments(projectId, { budgetItemId, expenseId })
    markAsRead(entityId)
  }, [projectId, budgetItemId, expenseId, fetchComments, markAsRead, entityId])

  // Load user profiles from mock data
  useEffect(() => {
    const userIds = [...new Set(entityComments.map((c) => c.user_id))]
    if (userIds.length === 0) return
    const map = new Map<string, User>()
    mockUsers.filter((u) => userIds.includes(u.id)).forEach((u) => map.set(u.id, u))
    setUsers(map)
  }, [entityComments.length])

  const handleCreate = async (text: string) => {
    if (!user) return
    await createComment({
      project_id: projectId,
      user_id: user.id,
      text,
      budget_item_id: budgetItemId || null,
      expense_id: expenseId || null,
      parent_id: null,
    })
  }

  const handleReply = async (parentId: string, text: string) => {
    if (!user) return
    await replyComment(parentId, {
      project_id: projectId,
      user_id: user.id,
      text,
      budget_item_id: budgetItemId || null,
      expense_id: expenseId || null,
    })
    setReplyTo(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {topLevel.length === 0 && (
        <p className="text-sm text-secondary py-4 text-center">Sin comentarios</p>
      )}

      {topLevel.map((comment) => (
        <div key={comment.id}>
          <CommentBubble
            comment={comment}
            users={users}
            onReply={() => setReplyTo(comment.id)}
          />
          {replies
            .filter((r) => r.parent_id === comment.id)
            .map((reply) => (
              <CommentBubble key={reply.id} comment={reply} users={users} />
            ))}
          {replyTo === comment.id && (
            <div className="ml-8 mt-2">
              <CommentInput
                placeholder="Responder..."
                onSubmit={(text) => handleReply(comment.id, text)}
              />
            </div>
          )}
        </div>
      ))}

      <CommentInput onSubmit={handleCreate} />
    </div>
  )
}

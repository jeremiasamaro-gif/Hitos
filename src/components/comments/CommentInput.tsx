import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Send } from 'lucide-react'

interface Props {
  placeholder?: string
  onSubmit: (text: string) => void
}

export function CommentInput({ placeholder = 'Escribí un comentario...', onSubmit }: Props) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    onSubmit(text.trim())
    setText('')
  }

  return (
    <div className="flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="flex-1 bg-app border border-border rounded-lg px-3 py-2 text-sm text-primary
          placeholder:text-secondary/50 focus:outline-none focus:border-accent resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
      />
      <Button size="sm" onClick={handleSubmit} className="self-end">
        <Send size={14} />
      </Button>
    </div>
  )
}

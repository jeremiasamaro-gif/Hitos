import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'

interface Props {
  value: number | string
  itemId: string
  field: string
  editable: boolean
  type?: 'number' | 'text'
  formatter?: (v: number) => string
  onSave: (itemId: string, field: string, value: number | string) => void
}

export function PnlEditableCell({ value, itemId, field, editable, type = 'number', formatter, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const displayValue = type === 'number' && formatter ? formatter(value as number) : String(value)

  const handleSave = () => {
    setEditing(false)
    const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue
    if (newValue !== value) {
      onSave(itemId, field, newValue)
    }
  }

  if (editing && editable) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-full bg-app border border-accent rounded px-2 py-1 text-sm font-mono text-primary focus:outline-none"
      />
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-sm ${editable ? 'cursor-pointer group' : ''}`}
      onDoubleClick={() => {
        if (editable) {
          setEditValue(String(value))
          setEditing(true)
        }
      }}
    >
      {displayValue}
      {editable && <Pencil size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />}
    </span>
  )
}

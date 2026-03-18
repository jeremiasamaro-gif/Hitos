import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-secondary">{label}</label>}
      <input
        ref={ref}
        className={`w-full rounded-lg bg-app border border-border px-3 py-2 text-sm text-primary
          placeholder:text-secondary/50 focus:outline-none focus:border-accent transition-colors
          ${error ? 'border-status-exceeded' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-status-exceeded">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function useRegisterForm() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const authError = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'arquitecto' | 'cliente'>('arquitecto')
  const [loading, setLoading] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = password.length >= 8 && /\d/.test(password)
  const canSubmit = name.trim() !== '' && isEmailValid && isPasswordValid && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    clearError()
    setLoading(true)
    try {
      await signUp(email, password, name, role)
      if (role === 'arquitecto') {
        navigate('/projects')
      } else {
        navigate('/projects')
      }
    } catch {
      // authStore sets error internally
    } finally {
      setLoading(false)
    }
  }

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    role, setRole,
    loading,
    error: authError,
    canSubmit,
    handleSubmit,
  }
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { es } from '@/i18n/es'
import { en } from '@/i18n/en'

type Lang = 'es' | 'en'
type Translations = Record<string, string>

interface LangContextValue {
  t: Translations
  lang: Lang
  setLang: (l: Lang) => void
}

const translations: Record<Lang, Translations> = { es, en }

const LangContext = createContext<LangContextValue>({
  t: es,
  lang: 'es',
  setLang: () => {},
})

const STORAGE_KEY = 'hitos-lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'en' ? 'en' : 'es'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  return (
    <LangContext.Provider value={{ t: translations[lang], lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

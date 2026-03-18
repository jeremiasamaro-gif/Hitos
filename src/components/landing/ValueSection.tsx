import { useLang } from '@/contexts/LangContext'

/* Simple inline SVG icons */
const icons = {
  budget: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M2 9h20M9 21V9" />
    </svg>
  ),
  align: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  alert: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  currency: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
}

export function ValueSection() {
  const { t } = useLang()

  const items = [
    { icon: icons.budget, title: t.value_1_title, desc: t.value_1_desc },
    { icon: icons.align, title: t.value_2_title, desc: t.value_2_desc },
    { icon: icons.alert, title: t.value_3_title, desc: t.value_3_desc },
    { icon: icons.currency, title: t.value_4_title, desc: t.value_4_desc },
  ]

  return (
    <section className="py-20 px-4 bg-[var(--color-bg-alt)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary text-center mb-12">
          {t.value_title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-card border border-[var(--color-border)] rounded-xl p-6 shadow-card hover:shadow-card-hover hover:border-[var(--color-border-hover)] transition-all duration-150"
            >
              <div className="text-accent mb-4">{item.icon}</div>
              <h3 className="text-base font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

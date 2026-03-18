import { useLang } from '@/contexts/LangContext'

const avatarColors = ['#6366f1', '#22c55e', '#eab308']

interface TestimonialCardProps {
  text: string
  author: string
  colorIndex: number
}

function TestimonialCard({ text, author, colorIndex }: TestimonialCardProps) {
  const initials = author
    .replace(/^Arq\.\s*|^Arch\.\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="bg-card border border-[var(--color-border)] rounded-xl p-6 shadow-card hover:shadow-card-hover hover:border-[var(--color-border-hover)] transition-all duration-150">
      <p className="text-base text-primary leading-relaxed mb-6 italic">"{text}"</p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: avatarColors[colorIndex % avatarColors.length] }}
        >
          {initials}
        </div>
        <span className="text-sm text-secondary">{author}</span>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const { t } = useLang()

  const testimonials = [
    { text: t.testimonial_1, author: t.testimonial_1_author },
    { text: t.testimonial_2, author: t.testimonial_2_author },
    { text: t.testimonial_3, author: t.testimonial_3_author },
  ]

  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary text-center mb-12">
          {t.testimonials_title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <TestimonialCard key={i} text={item.text} author={item.author} colorIndex={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

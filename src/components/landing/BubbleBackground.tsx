const bubbles = [
  { size: 500, top: '-100px', right: '-80px', opacity: 0.05 },
  { size: 300, top: '80px', left: '-60px', opacity: 0.04 },
  { size: 450, top: '40%', right: '-100px', opacity: 0.06 },
  { size: 200, top: '35%', left: '5%', opacity: 0.04 },
  { size: 350, top: '60%', right: '10%', opacity: 0.05 },
  { size: 500, bottom: '-120px', left: '-100px', opacity: 0.07 },
  { size: 180, top: '70%', left: '40%', opacity: 0.04 },
  { size: 220, bottom: '15%', right: '35%', opacity: 0.05 },
]

export function BubbleBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: '#6366f1',
            opacity: b.opacity,
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
          }}
        />
      ))}
    </div>
  )
}

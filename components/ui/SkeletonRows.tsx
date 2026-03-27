interface Props {
  rows?: number
  cols?: number
}

export default function SkeletonRows({ rows = 4, cols = 1 }: Props) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid gap-2 ${cols > 1 ? `grid-cols-${cols}` : ''}`}>
          <div className="skeleton h-4 rounded" style={{ opacity: 1 - i * 0.15 }} />
          {cols > 1 && <div className="skeleton h-4 rounded w-16 ml-auto" style={{ opacity: 1 - i * 0.15 }} />}
        </div>
      ))}
    </div>
  )
}

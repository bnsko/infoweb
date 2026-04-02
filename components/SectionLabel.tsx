export default function SectionLabel({ label, icon }: { label: string; icon?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-2">
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-faint)' }}>{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
    </div>
  )
}

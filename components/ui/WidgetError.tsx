export default function WidgetError({ message = 'Chyba načítania dát.' }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  )
}

import { Link } from 'react-router-dom'

function ZoneButton({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-3 border border-zone-border bg-zone-panel/60 p-6 no-underline transition-all duration-300 hover:border-zone-amber hover:bg-zone-panel hover:shadow-[0_0_24px_rgba(201,162,39,0.15)] sm:p-8"
    >
      <span className="absolute right-3 top-3 text-zone-border transition-colors group-hover:text-zone-amber/50">
        →
      </span>

      <span className="flex h-12 w-12 items-center justify-center border border-zone-olive bg-zone-dark text-2xl text-zone-amber transition-all group-hover:border-zone-amber group-hover:shadow-[0_0_12px_rgba(201,162,39,0.3)]">
        {icon}
      </span>

      <div>
        <h3 className="font-display text-xl tracking-wide text-zone-text transition-colors group-hover:text-zone-amber">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zone-muted">
          {description}
        </p>
      </div>

      <span className="mt-auto text-[10px] uppercase tracking-[0.25em] text-zone-muted group-hover:text-zone-amber-dim">
        [ войти в раздел ]
      </span>
    </Link>
  )
}

export default ZoneButton

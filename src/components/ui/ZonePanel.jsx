function ZonePanel({ title, subtitle, children, className = '' }) {
  return (
    <section
      className={[
        'relative border border-zone-border bg-zone-panel/80 p-6 sm:p-8',
        'before:absolute before:left-0 before:top-0 before:h-1 before:w-16 before:bg-zone-amber',
        'after:absolute after:right-0 after:bottom-0 after:h-1 after:w-16 after:bg-zone-amber/40',
        className,
      ].join(' ')}
    >
      {(title || subtitle) && (
        <header className="mb-6 border-b border-zone-border/50 pb-4">
          {title && (
            <h2 className="font-display text-2xl tracking-wide text-zone-amber sm:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-zone-muted">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}

export default ZonePanel

function HideoutSidebar({
  benches,
  categories,
  activeBench,
  activeCategory,
  onBenchChange,
  onCategoryChange,
}) {
  return (
    <aside className="w-full shrink-0 border border-zone-border bg-zone-panel/60 lg:w-56">
      <p className="border-b border-zone-border px-3 py-2 text-[10px] uppercase tracking-widest text-zone-muted">
        Верстак
      </p>
      <nav className="border-b border-zone-border/50">
        <button
          type="button"
          onClick={() => onBenchChange('all')}
          className={[
            'flex w-full px-3 py-2 text-left text-sm transition-colors',
            activeBench === 'all'
              ? 'bg-zone-green/20 text-zone-green'
              : 'text-zone-text hover:bg-zone-dark/60',
          ].join(' ')}
        >
          Все
        </button>
        {benches.map((bench) => (
          <button
            key={bench.id}
            type="button"
            onClick={() => onBenchChange(bench.id)}
            className={[
              'flex w-full px-3 py-2 text-left text-sm transition-colors',
              activeBench === bench.id
                ? 'bg-zone-green/20 text-zone-green'
                : 'text-zone-text hover:bg-zone-dark/60',
            ].join(' ')}
          >
            {bench.label}
          </button>
        ))}
      </nav>

      <p className="border-b border-zone-border px-3 py-2 text-[10px] uppercase tracking-widest text-zone-muted">
        Категория
      </p>
      <nav className="max-h-[320px] overflow-y-auto">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={[
            'flex w-full border-b border-zone-border/30 px-3 py-2 text-left text-sm transition-colors',
            activeCategory === 'all'
              ? 'bg-zone-green/20 text-zone-green'
              : 'text-zone-text hover:bg-zone-dark/60',
          ].join(' ')}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={[
              'flex w-full items-center gap-2 border-b border-zone-border/30 px-3 py-2 text-left text-sm transition-colors',
              activeCategory === cat
                ? 'bg-zone-green/20 text-zone-green'
                : 'text-zone-text hover:bg-zone-dark/60',
            ].join(' ')}
          >
            <span className="text-zone-muted" aria-hidden="true">
              +
            </span>
            {cat}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default HideoutSidebar

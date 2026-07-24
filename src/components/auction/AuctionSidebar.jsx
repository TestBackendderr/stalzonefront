function AuctionSidebar({ categories, activeCategory, onCategoryChange }) {
  return (
    <aside className="w-full shrink-0 border border-zone-border bg-zone-panel/60 lg:w-56">
      <p className="border-b border-zone-border px-3 py-2 text-[10px] uppercase tracking-widest text-zone-muted">
        Категории
      </p>
      <nav className="max-h-[420px] overflow-y-auto">
        {categories.map((cat) => {
          const active = cat.id === activeCategory
          const isSub = cat.depth > 0

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={[
                'flex w-full items-center gap-2 border-b border-zone-border/30 py-2.5 text-left text-sm transition-colors',
                isSub ? 'pl-7 pr-3' : 'px-3',
                active
                  ? 'bg-zone-green/20 text-zone-green'
                  : 'text-zone-text hover:bg-zone-dark/60',
              ].join(' ')}
            >
              {!isSub && cat.id !== 'all' && (
                <span className="text-zone-muted" aria-hidden="true">
                  +
                </span>
              )}
              {isSub && (
                <span className="text-zone-muted" aria-hidden="true">
                  ·
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{cat.label}</span>
              {cat.count != null && (
                <span className="shrink-0 text-[10px] text-zone-muted">
                  {cat.count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default AuctionSidebar

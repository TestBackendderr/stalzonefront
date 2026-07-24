function AuctionToolbar({
  qualities,
  quality,
  onQualityChange,
  search,
  onSearchChange,
  onSearchSubmit,
  region,
  onRegionChange,
  loading,
}) {
  return (
    <div className="flex flex-col gap-3 border border-zone-border bg-zone-dark/40 p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-widest text-zone-muted">
          Качество
        </label>
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value)}
          className="border border-zone-border bg-zone-panel px-2 py-1.5 text-sm text-zone-text outline-none focus:border-zone-amber"
        >
          {qualities.map((q) => (
            <option key={q.id} value={q.id}>
              {q.label}
            </option>
          ))}
        </select>
      </div>

      <form
        className="flex flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSearchSubmit()
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск предмета..."
          className="min-w-0 flex-1 border border-zone-border bg-zone-panel px-3 py-1.5 text-sm text-zone-text outline-none focus:border-zone-amber"
        />
        <button
          type="submit"
          disabled={loading}
          className="border border-zone-border bg-zone-panel px-4 py-1.5 text-xs uppercase tracking-wider text-zone-amber transition-colors hover:border-zone-amber disabled:opacity-50"
        >
          Поиск
        </button>
      </form>

      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="border border-zone-border bg-zone-panel px-2 py-1.5 text-sm text-zone-text outline-none focus:border-zone-amber"
      >
        {['RU', 'EU', 'NA', 'SEA'].map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AuctionToolbar

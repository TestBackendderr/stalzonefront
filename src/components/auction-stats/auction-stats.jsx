import { useCallback, useEffect, useState } from 'react'
import { getAuctionMeta, getAuctionStats } from '../../api/client'
import AuctionSidebar from '../auction/AuctionSidebar'
import StatsItemCard from './StatsItemCard'

function AuctionStats() {
  const [meta, setMeta] = useState(null)
  const [region, setRegion] = useState('RU')
  const [category, setCategory] = useState('artefact')
  const [quality, setQuality] = useState('all')
  const [sort, setSort] = useState('desc')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState([])
  const [itemOffset, setItemOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const locale = region === 'RU' ? 'ru' : 'global'

  useEffect(() => {
    getAuctionMeta({ locale })
      .then((data) => {
        setMeta(data)
        setRegion(data.region || 'RU')
      })
      .catch((err) => setError(err.message))
  }, [locale])

  const fetchStats = useCallback(async (offset, append) => {
    const setBusy = append ? setLoadingMore : setLoading
    setBusy(true)
    if (!append) setError(null)

    try {
      const data = await getAuctionStats({
        region,
        locale,
        category,
        quality,
        q: searchQuery,
        itemOffset: offset,
        sort,
        historyLimit: 15,
      })

      setItems((prev) => {
        const next = append ? [...prev, ...data.items] : data.items
        const sorted = [...next].sort((a, b) => {
          const aPrice = a.minBuyoutPerUnit ?? a.avgPricePerUnit
          const bPrice = b.minBuyoutPerUnit ?? b.avgPricePerUnit
          if (aPrice == null && bPrice == null) return 0
          if (aPrice == null) return 1
          if (bPrice == null) return -1
          return sort === 'asc' ? aPrice - bPrice : bPrice - aPrice
        })
        setStats({
          apiMode: data.apiMode,
          totalItems: sorted.length,
          totalMatchingItems: data.totalMatchingItems,
        })
        return sorted
      })
      setItemOffset(data.nextItemOffset)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err.message)
      if (!append) setItems([])
    } finally {
      setBusy(false)
    }
  }, [region, locale, category, quality, searchQuery, sort])

  useEffect(() => {
    if (!meta) return
    setItemOffset(0)
    fetchStats(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, region, category, quality, searchQuery, sort])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  function handleLoadMore() {
    if (hasMore && !loadingMore) {
      fetchStats(itemOffset, true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-zone-border bg-zone-panel/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl text-zone-amber">Статистика аукциона</h2>
          {stats?.apiMode === 'production' && (
            <span className="text-xs text-zone-green">● live</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zone-muted">
          Качество · заточка (+0…+15) · мин. и средняя цена · последние продажи
        </p>
      </div>

      {error && (
        <div className="border border-zone-danger/50 bg-zone-danger/10 px-4 py-3 text-sm text-zone-danger">
          {error.includes('429')
            ? 'Превышен лимит запросов API. Подожди 1–2 минуты.'
            : error}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        {meta && (
          <AuctionSidebar
            categories={meta.categories}
            activeCategory={category}
            onCategoryChange={setCategory}
          />
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 border border-zone-border bg-zone-dark/40 p-3 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск предмета..."
              className="min-w-0 flex-1 border border-zone-border bg-zone-panel px-3 py-2 text-sm text-zone-text outline-none focus:border-zone-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="border border-zone-border bg-zone-panel px-4 py-2 text-xs uppercase tracking-wider text-zone-amber hover:border-zone-amber disabled:opacity-50"
            >
              Поиск
            </button>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              disabled={loading}
              className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
            >
              {(meta?.qualities ?? [{ id: 'all', label: 'Все' }]).map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              disabled={loading}
              className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
            >
              <option value="desc">Цена ↓</option>
              <option value="asc">Цена ↑</option>
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={loading}
              className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
            >
              {['RU', 'EU', 'NA', 'SEA'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </form>

          <p className="text-xs text-zone-muted">
            {loading
              ? 'Загрузка...'
              : `Показано: ${items.length}${
                  stats?.totalMatchingItems != null
                    ? ` из ${stats.totalMatchingItems}`
                    : ''
                }`}
          </p>

          {loading && (
            <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
              Загрузка цен и истории продаж...
            </p>
          )}

          {!loading && items.length === 0 && (
            <p className="py-12 text-center text-sm text-zone-muted">
              Предметы не найдены. Выбери категорию или измени поиск.
            </p>
          )}

          {!loading && items.length > 0 && (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {items.map((item) => (
                <StatsItemCard
                  key={item.itemId}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full border border-zone-border bg-zone-panel py-2 text-xs uppercase tracking-wider text-zone-amber hover:border-zone-amber disabled:opacity-50"
            >
              {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuctionStats

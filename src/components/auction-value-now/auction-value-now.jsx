import { useCallback, useEffect, useState } from 'react'
import { getAuctionMeta, getAuctionValueNow } from '../../api/client'
import ValueNowCard from './ValueNowCard'

function AuctionValueNow() {
  const [region, setRegion] = useState('RU')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState([])
  const [itemOffset, setItemOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [metaReady, setMetaReady] = useState(false)

  const locale = region === 'RU' ? 'ru' : 'global'

  useEffect(() => {
    getAuctionMeta({ locale })
      .then((data) => {
        setRegion(data.region || 'RU')
        setMetaReady(true)
      })
      .catch((err) => setError(err.message))
  }, [locale])

  const fetchDeals = useCallback(async (offset, append) => {
    const setBusy = append ? setLoadingMore : setLoading
    setBusy(true)
    if (!append) setError(null)

    try {
      const data = await getAuctionValueNow({
        region,
        locale,
        category: 'artefact',
        q: searchQuery,
        itemOffset: offset,
        minDiscount: 10,
      })

      setItems((prev) => {
        const next = append ? [...prev, ...(data.items || [])] : (data.items || [])
        next.sort((a, b) => b.bestDiscount - a.bestDiscount)
        setStats({
          apiMode: data.apiMode,
          totalDeals: data.totalDeals,
          totalItems: next.length,
          scannedItems: data.scannedItems,
          totalMatchingItems: data.totalMatchingItems,
          minDiscountPercent: data.minDiscountPercent,
        })
        return next
      })
      setItemOffset(data.nextItemOffset)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err.message)
      if (!append) setItems([])
    } finally {
      setBusy(false)
    }
  }, [region, locale, searchQuery])

  useEffect(() => {
    if (!metaReady) return
    setItemOffset(0)
    fetchDeals(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaReady, region, searchQuery])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  function handleLoadMore() {
    if (hasMore && !loadingMore) {
      fetchDeals(itemOffset, true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-zone-border bg-zone-panel/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl text-zone-amber">Выгода сейчас</h2>
          {stats?.apiMode === 'production' && (
            <span className="text-xs text-zone-green">● live</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zone-muted">
          Как в Статистике: сравнение мин. и средней отдельно для каждой пары
          качество + заточка (+0…+15). Порог −10%.
        </p>
      </div>

      {error && (
        <div className="border border-zone-danger/50 bg-zone-danger/10 px-4 py-3 text-sm text-zone-danger">
          {error.includes('429')
            ? 'Превышен лимит запросов API. Подожди 1–2 минуты.'
            : error}
        </div>
      )}

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-2 border border-zone-border bg-zone-dark/40 p-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск артефакта..."
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
          ? 'Сканирование...'
          : `Предметов: ${items.length} · выгодных пар: ${stats?.totalDeals ?? 0}${
              stats?.totalMatchingItems != null
                ? ` · проверено: ${itemOffset} / ${stats.totalMatchingItems}`
                : ''
            }`}
      </p>

      {loading && (
        <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
          Считаем выгоду по качеству и заточке...
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="py-12 text-center text-sm text-zone-muted">
          Нет пар качество+заточка со скидкой −10% и ниже. Нажми «Сканировать ещё».
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {items.map((item) => (
            <ValueNowCard key={item.itemId} item={item} locale={locale} />
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
          {loadingMore ? 'Сканирование...' : 'Сканировать ещё'}
        </button>
      )}
    </div>
  )
}

export default AuctionValueNow

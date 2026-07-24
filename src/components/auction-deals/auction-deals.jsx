import { useCallback, useEffect, useState } from 'react'
import { browseAuctionBargains, getAuctionMeta } from '../../api/client'
import AuctionSidebar from '../auction/AuctionSidebar'
import AuctionToolbar from '../auction/AuctionToolbar'
import BargainsTable from './BargainsTable'

const DISCOUNT_OPTIONS = [
  { value: 15, label: 'от 15%' },
  { value: 20, label: 'от 20%' },
  { value: 30, label: 'от 30%' },
  { value: 40, label: 'от 40%' },
]

function AuctionDeals() {
  const [meta, setMeta] = useState(null)
  const [region, setRegion] = useState('RU')
  const [category, setCategory] = useState('all')
  const [quality, setQuality] = useState('all')
  const [minDiscount, setMinDiscount] = useState(20)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deals, setDeals] = useState([])
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
        setCategory('all')
      })
      .catch((err) => setError(err.message))
  }, [locale])

  const fetchDeals = useCallback(async (offset, append) => {
    const setBusy = append ? setLoadingMore : setLoading
    setBusy(true)
    if (!append) setError(null)

    try {
      const data = await browseAuctionBargains({
        region,
        locale,
        category,
        quality,
        q: searchQuery,
        itemOffset: offset,
        minDiscount,
      })

      setDeals((prev) => {
        const next = append ? [...prev, ...data.deals] : data.deals
        setStats({
          apiMode: data.apiMode,
          totalDeals: next.length,
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
      if (!append) setDeals([])
    } finally {
      setBusy(false)
    }
  }, [region, locale, category, quality, searchQuery, minDiscount])

  useEffect(() => {
    if (!meta) return
    setItemOffset(0)
    fetchDeals(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, region, category, quality, searchQuery, minDiscount])

  function handleSearchSubmit() {
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
        <h2 className="font-display text-xl text-zone-amber">Скидки на аукционе</h2>
        <p className="mt-1 text-sm text-zone-muted">
          Лоты дешевле средней цены по истории продаж — для поиска выгодных покупок
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
          {meta && (
            <div className="space-y-2">
              <AuctionToolbar
                qualities={meta.qualities}
                quality={quality}
                onQualityChange={setQuality}
                search={searchInput}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearchSubmit}
                region={region}
                onRegionChange={setRegion}
                loading={loading}
              />
              <div className="flex items-center gap-2 border border-zone-border bg-zone-dark/40 px-3 py-2">
                <label className="text-[10px] uppercase tracking-widest text-zone-muted">
                  Мин. скидка
                </label>
                <select
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(Number(e.target.value))}
                  disabled={loading}
                  className="border border-zone-border bg-zone-panel px-2 py-1 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
                >
                  {DISCOUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="border border-zone-border bg-zone-panel/40">
            {loading && (
              <p className="px-4 py-8 text-center text-sm text-zone-amber animate-pulse-glow">
                Поиск дешёвых лотов...
                <br />
                <span className="text-xs text-zone-muted">
                  Сравниваем с историей продаж
                </span>
              </p>
            )}

            {!loading && (
              <>
                {stats && (
                  <p className="border-b border-zone-border/50 px-3 py-2 text-xs text-zone-muted">
                    Найдено: {deals.length} · скидка {stats.minDiscountPercent}%+
                    {stats.totalMatchingItems != null && (
                      <> · предметов в фильтре: {stats.totalMatchingItems}</>
                    )}
                    {stats.apiMode === 'production' && (
                      <span className="ml-2 text-zone-green">● live</span>
                    )}
                  </p>
                )}
                <BargainsTable deals={deals} locale={locale} />
              </>
            )}
          </div>

          {hasMore && !loading && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="border border-zone-border bg-zone-dark px-6 py-2 text-xs uppercase tracking-wider text-zone-amber transition-colors hover:border-zone-amber disabled:opacity-50"
              >
                {loadingMore ? 'Сканирование...' : 'Сканировать ещё'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuctionDeals

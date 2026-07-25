import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAuctionMeta, getAuctionValueNowGear } from '../../api/client'
import ValueNowGearCard from './ValueNowGearCard'

const CATEGORIES = [
  { id: 'equipment', label: 'Всё снаряжение' },
  { id: 'weapon', label: 'Оружие' },
  { id: 'armor', label: 'Костюмы' },
]

const RANKS = [
  { id: 'all', label: 'Все ранги' },
  { id: 'DEFAULT', label: 'Отмычка' },
  { id: 'RANK_NEWBIE', label: 'Новичок' },
  { id: 'RANK_STALKER', label: 'Сталкер' },
  { id: 'RANK_VETERAN', label: 'Ветеран' },
  { id: 'RANK_MASTER', label: 'Мастер' },
  { id: 'RANK_LEGEND', label: 'Легенда' },
]

const SORT_OPTIONS = [
  { id: 'discount', label: 'Скидка ↓' },
  { id: 'price-desc', label: 'Цена ↓' },
  { id: 'price-asc', label: 'Цена ↑' },
]

function filterAndSortItems(items, rank, sort) {
  const filtered = items.filter(
    (item) => rank === 'all' || item.color === rank || item.rankId === rank,
  )

  filtered.sort((a, b) => {
    if (sort === 'price-asc') {
      if (a.minBuyoutPerUnit == null && b.minBuyoutPerUnit == null) return 0
      if (a.minBuyoutPerUnit == null) return 1
      if (b.minBuyoutPerUnit == null) return -1
      return a.minBuyoutPerUnit - b.minBuyoutPerUnit
    }
    if (sort === 'price-desc') {
      if (a.minBuyoutPerUnit == null && b.minBuyoutPerUnit == null) return 0
      if (a.minBuyoutPerUnit == null) return 1
      if (b.minBuyoutPerUnit == null) return -1
      return b.minBuyoutPerUnit - a.minBuyoutPerUnit
    }
    return (b.discountPercent ?? 0) - (a.discountPercent ?? 0)
  })

  return filtered
}

function AuctionValueNowGear() {
  const [region, setRegion] = useState('RU')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('equipment')
  const [rank, setRank] = useState('all')
  const [sort, setSort] = useState('discount')
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
      const data = await getAuctionValueNowGear({
        region,
        locale,
        category,
        rank: 'all',
        q: searchQuery,
        itemOffset: offset,
        minDiscount: 10,
      })

      setItems((prev) => {
        const next = append ? [...prev, ...(data.items || [])] : (data.items || [])
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
  }, [region, locale, category, searchQuery])

  useEffect(() => {
    if (!metaReady) return
    setItemOffset(0)
    fetchDeals(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaReady, region, category, searchQuery])

  const displayItems = useMemo(
    () => filterAndSortItems(items, rank, sort),
    [items, rank, sort],
  )

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
          <h2 className="font-display text-xl text-zone-amber">
            Выгода сейчас(снаряжение)
          </h2>
          {stats?.apiMode === 'production' && (
            <span className="text-xs text-zone-green">● live</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zone-muted">
          Оружие и костюмы: мин. цена сейчас vs средняя по продажам. Ранги —
          Отмычка → Легенда. Порог −10%.
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
        className="flex flex-col gap-2 border border-zone-border bg-zone-dark/40 p-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Поиск оружия / костюма..."
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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber"
        >
          {RANKS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
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
          ? 'Сканирование...'
          : `Показано: ${displayItems.length} · загружено: ${items.length} · выгодных: ${stats?.totalDeals ?? 0}${
              stats?.totalMatchingItems != null
                ? ` · проверено: ${itemOffset} / ${stats.totalMatchingItems}`
                : ''
            }`}
      </p>

      {loading && (
        <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
          Считаем выгоду по снаряжению...
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="py-12 text-center text-sm text-zone-muted">
          Нет снаряжения со скидкой −10% и ниже. Нажми «Сканировать ещё».
        </p>
      )}

      {!loading && items.length > 0 && displayItems.length === 0 && (
        <p className="py-12 text-center text-sm text-zone-muted">
          Нет выгодных лотов под выбранный ранг.
        </p>
      )}

      {!loading && displayItems.length > 0 && (
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {displayItems.map((item) => (
            <ValueNowGearCard
              key={item.itemId}
              item={item}
              locale={locale}
              region={region}
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
          {loadingMore ? 'Сканирование...' : 'Сканировать ещё'}
        </button>
      )}
    </div>
  )
}

export default AuctionValueNowGear

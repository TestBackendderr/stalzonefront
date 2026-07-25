import { useCallback, useEffect, useMemo, useState } from 'react'
import { browseAuction, getAuctionMeta } from '../../api/client'
import AuctionSidebar from './AuctionSidebar'
import AuctionToolbar from './AuctionToolbar'
import AuctionTable from './AuctionTable'

const TABS = [
  { id: 'items', label: 'предметы', active: true },
  { id: 'my-lots', label: 'мои лоты', active: false },
  { id: 'my-bids', label: 'мои ставки', active: false },
]

function resolveFilterMode(categoryId = 'all') {
  if (categoryId === 'artefact' || categoryId.startsWith('artefact/')) return 'artefact'
  if (
    categoryId === 'equipment'
    || categoryId === 'weapon'
    || categoryId === 'armor'
    || categoryId.startsWith('weapon/')
    || categoryId.startsWith('armor/')
  ) {
    return 'equipment'
  }
  return 'generic'
}

function withEquipmentCategory(categories = []) {
  const hasEquipment = categories.some((c) => c.id === 'equipment')
  if (hasEquipment) return categories

  const weapon = categories.find((c) => c.id === 'weapon')
  const armor = categories.find((c) => c.id === 'armor')
  const count = (weapon?.count || 0) + (armor?.count || 0)
  if (!weapon && !armor) return categories

  const equipment = {
    id: 'equipment',
    label: 'Снаряжение',
    count,
    depth: 0,
  }

  const allIndex = categories.findIndex((c) => c.id === 'all')
  if (allIndex >= 0) {
    const next = [...categories]
    next.splice(allIndex + 1, 0, equipment)
    return next
  }
  return [equipment, ...categories]
}

function Auction() {
  const [meta, setMeta] = useState(null)
  const [region, setRegion] = useState('RU')
  const [category, setCategory] = useState('all')
  const [quality, setQuality] = useState('all')
  const [qlt, setQlt] = useState('all')
  const [ptn, setPtn] = useState('all')
  const [rank, setRank] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [lots, setLots] = useState([])
  const [itemOffset, setItemOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const locale = region === 'RU' ? 'ru' : 'global'
  const filterMode = resolveFilterMode(category)

  const categories = useMemo(
    () => withEquipmentCategory(meta?.categories ?? []),
    [meta],
  )

  useEffect(() => {
    getAuctionMeta({ locale })
      .then((data) => {
        setMeta(data)
        setRegion(data.region || 'RU')
        setCategory('all')
      })
      .catch((err) => setError(err.message))
  }, [locale])

  const fetchLots = useCallback(async (offset, append) => {
    const setBusy = append ? setLoadingMore : setLoading
    setBusy(true)
    if (!append) setError(null)

    try {
      const data = await browseAuction({
        region,
        locale,
        category,
        quality: filterMode === 'generic' ? quality : 'all',
        qlt: filterMode === 'artefact' ? qlt : 'all',
        ptn: filterMode === 'artefact' ? ptn : 'all',
        rank: filterMode === 'equipment' ? rank : 'all',
        q: searchQuery,
        itemOffset: offset,
      })

      setLots((prev) => {
        const next = append ? [...prev, ...data.lots] : data.lots
        setStats({
          apiMode: data.apiMode,
          filterMode: data.filterMode || filterMode,
          totalLots: next.length,
          scannedItems: data.scannedItems,
          totalMatchingItems: data.totalMatchingItems,
        })
        return next
      })
      setItemOffset(data.nextItemOffset)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err.message)
      if (!append) setLots([])
    } finally {
      setBusy(false)
    }
  }, [region, locale, category, quality, qlt, ptn, rank, searchQuery, filterMode])

  useEffect(() => {
    if (!meta) return
    setItemOffset(0)
    fetchLots(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, region, category, quality, qlt, ptn, rank, searchQuery])

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory)
    setQuality('all')
    setQlt('all')
    setPtn('all')
    setRank('all')
  }

  function handleSearchSubmit() {
    setSearchQuery(searchInput.trim())
  }

  function handleLoadMore() {
    if (hasMore && !loadingMore) {
      fetchLots(itemOffset, true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex border-b border-zone-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={!tab.active}
            className={[
              'px-5 py-2.5 text-sm uppercase tracking-wide transition-colors',
              tab.active
                ? 'border-b-2 border-zone-green text-zone-green'
                : 'cursor-not-allowed text-zone-muted/50',
            ].join(' ')}
            title={!tab.active ? 'Требуется авторизация EXBO' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {stats?.apiMode === 'demo' && (
        <div className="border border-zone-amber/40 bg-zone-amber/10 px-4 py-3 text-sm text-zone-amber">
          Сейчас используется <strong>Demo API</strong> — цены тестовые, не из игры.
          Для реальных цен укажи свои ключи в <code>back/.env</code> и переключи на{' '}
          <code>eapi.stalcraft.net</code>.
        </div>
      )}

      {error && (
        <div className="border border-zone-danger/50 bg-zone-danger/10 px-4 py-3 text-sm text-zone-danger">
          {error}
          <p className="mt-1 text-xs text-zone-muted">
            Запусти бэкенд: <code>cd back && npm run dev</code>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        {meta && (
          <AuctionSidebar
            categories={categories}
            activeCategory={category}
            onCategoryChange={handleCategoryChange}
          />
        )}

        <div className="min-w-0 flex-1 space-y-3">
          {meta && (
            <AuctionToolbar
              filterMode={filterMode}
              artefactQualities={meta.artefactQualities ?? []}
              equipmentRanks={meta.equipmentRanks ?? []}
              qualities={meta.qualities ?? []}
              qlt={qlt}
              onQltChange={setQlt}
              ptn={ptn}
              onPtnChange={setPtn}
              rank={rank}
              onRankChange={setRank}
              quality={quality}
              onQualityChange={setQuality}
              search={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearchSubmit}
              region={region}
              onRegionChange={setRegion}
              loading={loading}
            />
          )}

          <div className="border border-zone-border bg-zone-panel/40">
            {loading && (
              <p className="px-4 py-8 text-center text-sm text-zone-amber animate-pulse-glow">
                Сканирование аукциона...
              </p>
            )}

            {!loading && (
              <>
                {stats && (
                  <p className="border-b border-zone-border/50 px-3 py-2 text-xs text-zone-muted">
                    Лотов: {lots.length}
                    {stats.totalMatchingItems != null && (
                      <> · предметов в фильтре: {stats.totalMatchingItems}</>
                    )}
                    {stats.apiMode === 'production' && (
                      <span className="ml-2 text-zone-green">● live</span>
                    )}
                  </p>
                )}
                <AuctionTable
                  lots={lots}
                  locale={locale}
                  region={region}
                  filterMode={stats?.filterMode || filterMode}
                />
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
                {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auction

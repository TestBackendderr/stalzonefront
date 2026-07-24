import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getAuctionItemDetail, getItemIconUrl } from '../../api/client'
import HistoryChart from './HistoryChart'

const COLOR_CLASS = {
  RANK_NEWBIE: 'text-zone-text',
  RANK_STALKER: 'text-zone-green',
  RANK_VETERAN: 'text-zone-cyan',
  RANK_MASTER: 'text-zone-amber',
  RANK_LEGEND: 'text-orange-400',
  DEFAULT: 'text-purple-400',
}

const QLT_CLASS = {
  0: 'text-zone-text',
  1: 'text-zone-green',
  2: 'text-zone-cyan',
  3: 'text-zone-amber',
  4: 'text-orange-400',
  5: 'text-purple-400',
}

const PERIODS = [
  { id: '1', label: 'День' },
  { id: '2', label: '2 дня' },
  { id: '7', label: 'Неделя' },
]

function formatPrice(value) {
  if (value == null) return '—'
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function AuctionItemHistory() {
  const { itemId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const region = searchParams.get('region') || 'RU'
  const qlt = searchParams.get('qlt') || 'all'
  const ptn = searchParams.get('ptn') || 'all'
  const period = PERIODS.some((p) => p.id === searchParams.get('period'))
    ? searchParams.get('period')
    : '1'
  const locale = region === 'RU' ? 'ru' : 'global'

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getAuctionItemDetail({ itemId, region, locale, qlt, ptn, period: Number(period) })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [itemId, region, locale, qlt, ptn, period])

  const qualities = useMemo(() => {
    const list = data?.qualities ?? []
    return [{ id: 'all', label: 'Все качества' }, ...list]
  }, [data])

  const ptns = useMemo(() => {
    const list = Array.from({ length: 16 }, (_, i) => ({
      id: String(i),
      label: `+${i}`,
    }))
    return [{ id: 'all', label: 'Все заточки' }, ...list]
  }, [])

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value === 'all' || (key === 'period' && value === '1')) next.delete(key)
    else next.set(key, String(value))
    if (!next.get('region')) next.set('region', region)
    setSearchParams(next)
  }

  const item = data?.item
  const iconUrl = getItemIconUrl(item?.icon, locale)
  const name = item?.nameRu || item?.nameEn || itemId
  const colorClass = COLOR_CLASS[item?.color] ?? 'text-zone-text'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/auction-value-now"
          className="border border-zone-border bg-zone-panel px-3 py-1.5 text-xs uppercase tracking-wider text-zone-muted no-underline hover:border-zone-amber hover:text-zone-amber"
        >
          ← Выгода сейчас
        </Link>
      </div>

      <div className="border border-zone-border bg-zone-panel/60 px-4 py-3">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-zone-border bg-zone-black/50">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt=""
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <span className="text-zone-muted">?</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={`font-display text-xl ${colorClass}`}>{name}</h2>
            <p className="mt-1 text-sm text-zone-muted">
              История продаж · фильтр по качеству и заточке
            </p>
          </div>
          {data?.apiMode === 'production' && (
            <span className="text-xs text-zone-green">● live</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-zone-border bg-zone-dark/40 p-3 sm:flex-row sm:items-center">
        <label className="text-[10px] uppercase tracking-widest text-zone-muted">
          Качество
        </label>
        <select
          value={qlt}
          onChange={(e) => updateFilter('qlt', e.target.value)}
          disabled={loading}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
        >
          {qualities.map((q) => (
            <option key={q.id} value={q.id}>
              {q.label}
            </option>
          ))}
        </select>

        <label className="text-[10px] uppercase tracking-widest text-zone-muted sm:ml-2">
          Заточка
        </label>
        <select
          value={ptn}
          onChange={(e) => updateFilter('ptn', e.target.value)}
          disabled={loading}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
        >
          {ptns.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <label className="text-[10px] uppercase tracking-widest text-zone-muted sm:ml-2">
          Период
        </label>
        <select
          value={period}
          onChange={(e) => updateFilter('period', e.target.value)}
          disabled={loading}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
        >
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={region}
          onChange={(e) => updateFilter('region', e.target.value)}
          disabled={loading}
          className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50 sm:ml-auto"
        >
          {['RU', 'EU', 'NA', 'SEA'].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="border border-zone-danger/50 bg-zone-danger/10 px-4 py-3 text-sm text-zone-danger">
          {error}
        </div>
      )}

      {loading && (
        <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
          Загрузка истории продаж...
        </p>
      )}

      {!loading && data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-zone-border bg-zone-panel/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zone-muted">
                Мин. сейчас
              </p>
              <p className="mt-1 text-zone-amber">
                {formatPrice(data.summary.minBuyoutPerUnit)}
              </p>
            </div>
            <div className="border border-zone-border bg-zone-panel/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zone-muted">
                Средняя (фильтр)
              </p>
              <p className="mt-1 text-zone-text">
                {formatPrice(data.summary.avgPricePerUnit)}
              </p>
            </div>
            <div className="border border-zone-border bg-zone-panel/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zone-muted">
                Продаж в выборке
              </p>
              <p className="mt-1 text-zone-text">
                {data.summary.filteredSales}
                <span className="ml-1 text-xs text-zone-muted">
                  / {data.summary.totalSales} всего
                </span>
              </p>
            </div>
          </div>

          <div className="border border-zone-border bg-zone-panel/40 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-zone-muted">
              График цен · {
                period === '7' ? 'неделя' : period === '2' ? '2 дня' : 'день'
              } · слева старые · справа новые
              {data.summary.coveredPeriod === false && (
                <span className="ml-2 normal-case tracking-normal text-zone-amber">
                  (загружены не все продажи за период — арт очень активный)
                </span>
              )}
            </p>
            <HistoryChart sales={data.chart} />
          </div>

          <div className="border border-zone-border bg-zone-panel/40">
            <p className="border-b border-zone-border/50 px-4 py-2 text-[10px] uppercase tracking-widest text-zone-muted">
              Последние продажи
            </p>
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead className="sticky top-0 bg-zone-dark/90">
                  <tr className="border-b border-zone-border text-left text-[10px] uppercase tracking-widest text-zone-muted">
                    <th className="px-3 py-2 font-normal">Когда</th>
                    <th className="px-3 py-2 font-normal">Качество</th>
                    <th className="px-3 py-2 font-normal">Заточка</th>
                    <th className="px-3 py-2 font-normal">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sales.map((sale, i) => (
                    <tr
                      key={`${sale.time}-${i}`}
                      className="border-b border-zone-border/30"
                    >
                      <td className="px-3 py-2 text-zone-muted">
                        {formatTime(sale.time)}
                      </td>
                      <td className={`px-3 py-2 ${QLT_CLASS[sale.qlt] ?? 'text-zone-text'}`}>
                        {sale.qualityLabel}
                      </td>
                      <td className="px-3 py-2 text-zone-cyan">{sale.ptnLabel}</td>
                      <td className="px-3 py-2 text-zone-amber">
                        {formatPrice(sale.pricePerUnit)}
                        {sale.amount > 1 && (
                          <span className="ml-1 text-xs text-zone-muted">
                            ×{sale.amount}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AuctionItemHistory

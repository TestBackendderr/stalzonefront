import { useMemo, useState } from 'react'
import { getItemIconUrl } from '../../api/client'
import { useCountdown } from './useCountdown'

const COLOR_CLASS = {
  RANK_NEWBIE: 'text-zone-text',
  RANK_STALKER: 'text-zone-green',
  RANK_VETERAN: 'text-zone-cyan',
  RANK_MASTER: 'text-zone-amber',
  RANK_LEGEND: 'text-orange-400',
  DEFAULT: 'text-purple-400',
}

function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return `${new Intl.NumberFormat('ru-RU').format(value)} рублей`
}

function getBidValue(lot) {
  return lot.currentPrice ?? null
}

function getBuyoutValue(lot) {
  return lot.buyoutPrice ?? null
}

function comparePrices(a, b, direction) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return direction === 'asc' ? a - b : b - a
}

function sortLots(lots, sortField, sortDirection) {
  if (!sortField) return lots

  return [...lots].sort((a, b) => {
    const aVal = sortField === 'bid' ? getBidValue(a) : getBuyoutValue(a)
    const bVal = sortField === 'bid' ? getBidValue(b) : getBuyoutValue(b)
    const cmp = comparePrices(aVal, bVal, sortDirection)
    if (cmp !== 0) return cmp
    return new Date(a.endTime) - new Date(b.endTime)
  })
}

function SortableHeader({ label, field, activeField, direction, onSort }) {
  const active = activeField === field

  return (
    <th className="px-3 py-2.5 w-44">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={[
          'flex w-full items-center gap-1.5 text-left text-[10px] uppercase tracking-widest transition-colors',
          active ? 'text-zone-amber' : 'text-zone-muted hover:text-zone-text',
        ].join(' ')}
      >
        <span>{label}</span>
        <span className="text-xs leading-none" aria-hidden="true">
          {active ? (direction === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
      </button>
    </th>
  )
}

function LotRow({ lot, locale }) {
  const countdown = useCountdown(lot.endTime)
  const name = lot.nameRu || lot.nameEn || lot.itemId
  const colorClass = COLOR_CLASS[lot.color] ?? 'text-zone-text'
  const iconUrl = getItemIconUrl(lot.icon, locale)
  const bidPrice = getBidValue(lot)

  return (
    <tr className="border-b border-zone-border/30 hover:bg-zone-dark/40">
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-zone-border bg-zone-black/50">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt=""
                className="h-8 w-8 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <span className="text-xs text-zone-muted">?</span>
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${colorClass}`}>{name}</p>
            <p className="text-xs text-zone-amber">{countdown}</p>
            {lot.amount > 1 && (
              <p className="text-[10px] text-zone-muted">x{lot.amount}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-zone-text">
        {bidPrice != null ? formatPrice(bidPrice) : '—'}
      </td>
      <td className="px-3 py-3 text-sm text-zone-text">
        {formatPrice(lot.buyoutPrice)}
      </td>
    </tr>
  )
}

function AuctionTable({ lots, locale }) {
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const sortedLots = useMemo(
    () => sortLots(lots, sortField, sortDirection),
    [lots, sortField, sortDirection],
  )

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (!lots.length) {
    return (
      <p className="py-12 text-center text-sm text-zone-muted">
        Лоты не найдены. Попробуйте другую категорию или поиск.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-zone-border bg-zone-dark/60 text-left">
            <th className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-zone-muted">
              Предмет
            </th>
            <SortableHeader
              label="Цена ставки"
              field="bid"
              activeField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Цена выкупа"
              field="buyout"
              activeField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody>
          {sortedLots.map((lot, i) => (
            <LotRow key={`${lot.itemId}-${lot.endTime}-${i}`} lot={lot} locale={locale} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AuctionTable

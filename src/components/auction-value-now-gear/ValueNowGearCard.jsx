import { Link } from 'react-router-dom'
import { getItemIconUrl } from '../../api/client'

const COLOR_CLASS = {
  RANK_NEWBIE: 'text-zone-text',
  RANK_STALKER: 'text-zone-green',
  RANK_VETERAN: 'text-zone-cyan',
  RANK_MASTER: 'text-zone-amber',
  RANK_LEGEND: 'text-orange-400',
  DEFAULT: 'text-zone-muted',
}

function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

function buildItemLink(item, region) {
  const params = new URLSearchParams()
  if (region) params.set('region', region)
  params.set('from', 'gear')
  const query = params.toString()
  return `/auction/item/${encodeURIComponent(item.itemId)}${query ? `?${query}` : ''}`
}

function ValueNowGearCard({ item, locale, region = 'RU' }) {
  const name = item.nameRu || item.nameEn || item.itemId
  const colorClass = COLOR_CLASS[item.color] ?? 'text-zone-text'
  const iconUrl = getItemIconUrl(item.icon, locale)
  const itemLink = buildItemLink(item, region)

  return (
    <article className="border border-zone-border bg-zone-panel/40 p-4">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          to={itemLink}
          className="flex h-12 w-12 shrink-0 items-center justify-center border border-zone-border bg-zone-black/50 no-underline transition-colors hover:border-zone-amber"
        >
          {iconUrl ? (
            <img
              src={iconUrl}
              alt=""
              className="h-10 w-10 object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <span className="text-xs text-zone-muted">?</span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={itemLink}
            className={`text-base font-medium no-underline hover:underline ${colorClass}`}
          >
            {name}
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-zone-muted">
            {item.categoryLabel || item.category} · {item.rankLabel} · нажми для истории
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-medium text-zone-green">−{item.discountPercent}%</p>
          <p className="text-[10px] text-zone-muted">скидка</p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto border-t border-zone-border/40 pt-3">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zone-border/40 text-left text-[10px] uppercase tracking-widest text-zone-muted">
              <th className="py-1.5 pr-3 font-normal">Ранг</th>
              <th className="py-1.5 pr-3 font-normal">Мин. сейчас</th>
              <th className="py-1.5 pr-3 font-normal">Средняя</th>
              <th className="py-1.5 pr-3 font-normal">Скидка</th>
              <th className="py-1.5 font-normal">Лоты / продажи</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zone-border/20">
              <td className={`py-1.5 pr-3 ${colorClass}`}>
                <Link to={itemLink} className="no-underline hover:underline">
                  {item.rankLabel}
                </Link>
              </td>
              <td className="py-1.5 pr-3 text-zone-amber">
                {formatPrice(item.minBuyoutPerUnit)}
              </td>
              <td className="py-1.5 pr-3 text-zone-text">
                {formatPrice(item.avgPricePerUnit)}
              </td>
              <td className="py-1.5 pr-3 font-medium text-zone-green">
                −{item.discountPercent}%
              </td>
              <td className="py-1.5 text-xs text-zone-muted">
                {item.lotsCount || 0} / {item.salesCount || 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default ValueNowGearCard

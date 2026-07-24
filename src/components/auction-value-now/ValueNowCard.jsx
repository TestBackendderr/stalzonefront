import { Link } from 'react-router-dom'
import { getItemIconUrl } from '../../api/client'

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

function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

function buildItemLink(item, region, qlt, ptn) {
  const params = new URLSearchParams()
  if (region) params.set('region', region)
  if (qlt != null && qlt !== 'all') params.set('qlt', String(qlt))
  if (ptn != null && ptn !== 'all') params.set('ptn', String(ptn))
  const query = params.toString()
  return `/auction/item/${encodeURIComponent(item.itemId)}${query ? `?${query}` : ''}`
}

function ValueNowCard({ item, locale, region = 'RU' }) {
  const name = item.nameRu || item.nameEn || item.itemId
  const colorClass = COLOR_CLASS[item.color] ?? 'text-zone-text'
  const iconUrl = getItemIconUrl(item.icon, locale)
  const byQuality = item.byQuality ?? []
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
            {item.category} · нажми для истории
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-medium text-zone-green">−{item.bestDiscount}%</p>
          <p className="text-[10px] text-zone-muted">лучшая скидка</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-zone-border/40 pt-3">
        {byQuality.map((quality) => (
          <div
            key={`${item.itemId}-qlt-${quality.qlt}`}
            className="border border-zone-border/40 bg-zone-dark/30 p-3"
          >
            <p className={`mb-2 font-medium ${QLT_CLASS[quality.qlt] ?? 'text-zone-text'}`}>
              {quality.qualityLabel}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zone-border/40 text-left text-[10px] uppercase tracking-widest text-zone-muted">
                    <th className="py-1.5 pr-3 font-normal">Заточка</th>
                    <th className="py-1.5 pr-3 font-normal">Мин. сейчас</th>
                    <th className="py-1.5 pr-3 font-normal">Средняя</th>
                    <th className="py-1.5 pr-3 font-normal">Скидка</th>
                    <th className="py-1.5 font-normal">Лоты / продажи</th>
                  </tr>
                </thead>
                <tbody>
                  {quality.byPtn.map((row) => (
                    <tr
                      key={`${item.itemId}-qlt-${quality.qlt}-ptn-${row.ptn}`}
                      className="border-b border-zone-border/20"
                    >
                      <td className="py-1.5 pr-3">
                        <Link
                          to={buildItemLink(item, region, quality.qlt, row.ptn)}
                          className="text-zone-cyan no-underline hover:underline"
                        >
                          {row.ptnLabel}
                        </Link>
                      </td>
                      <td className="py-1.5 pr-3 text-zone-amber">
                        {formatPrice(row.minBuyoutPerUnit)}
                      </td>
                      <td className="py-1.5 pr-3 text-zone-text">
                        {formatPrice(row.avgPricePerUnit)}
                      </td>
                      <td className="py-1.5 pr-3 font-medium text-zone-green">
                        −{row.discountPercent}%
                      </td>
                      <td className="py-1.5 text-xs text-zone-muted">
                        {row.lotsCount || 0} / {row.salesCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export default ValueNowCard

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

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function StatsItemCard({ item, locale }) {
  const name = item.nameRu || item.nameEn || item.itemId
  const colorClass = COLOR_CLASS[item.color] ?? 'text-zone-text'
  const iconUrl = getItemIconUrl(item.icon, locale)
  const byQuality = item.byQuality ?? []

  return (
    <article className="border border-zone-border bg-zone-panel/40 p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-zone-border bg-zone-black/50">
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
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-base font-medium ${colorClass}`}>{name}</p>
          <p className="text-[10px] uppercase tracking-widest text-zone-muted">
            {item.category}
            {item.lotsCount > 0 && ` · ${item.lotsCount} лотов`}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-zone-border/40 pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-zone-muted">
          Цены: качество + заточка
        </p>

        {!byQuality.length ? (
          <p className="text-xs text-zone-muted">Нет данных по качеству</p>
        ) : (
          <div className="space-y-3">
            {byQuality.map((row) => (
              <div
                key={`${item.itemId}-qlt-${row.qlt}`}
                className="border border-zone-border/40 bg-zone-dark/30 p-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className={`font-medium ${QLT_CLASS[row.qlt] ?? 'text-zone-text'}`}>
                    {row.qualityLabel}
                  </p>
                  <p className="text-[10px] text-zone-muted">
                    лотов {row.lotsCount || 0} · продаж {row.salesCount || 0}
                  </p>
                </div>

                {row.byPtn?.length > 0 ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-zone-border/40 text-left text-[10px] uppercase tracking-widest text-zone-muted">
                          <th className="py-1.5 pr-3 font-normal">Заточка</th>
                          <th className="py-1.5 pr-3 font-normal">Мин. сейчас</th>
                          <th className="py-1.5 pr-3 font-normal">Средняя</th>
                          <th className="py-1.5 font-normal">Лоты / продажи</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.byPtn.map((ptnRow) => (
                          <tr
                            key={`${item.itemId}-qlt-${row.qlt}-ptn-${ptnRow.ptn}`}
                            className="border-b border-zone-border/20"
                          >
                            <td className="py-1.5 pr-3 text-zone-cyan">
                              {ptnRow.ptnLabel}
                            </td>
                            <td className="py-1.5 pr-3 text-zone-amber">
                              {formatPrice(ptnRow.minBuyoutPerUnit)}
                            </td>
                            <td className="py-1.5 pr-3 text-zone-text">
                              {formatPrice(ptnRow.avgPricePerUnit)}
                            </td>
                            <td className="py-1.5 text-xs text-zone-muted">
                              {ptnRow.lotsCount || 0} / {ptnRow.salesCount || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-zone-muted">Нет данных по заточке</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-zone-border/40 pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-zone-muted">
          Последние продажи ({item.recentSales?.length || 0})
        </p>

        {!item.recentSales?.length ? (
          <p className="text-xs text-zone-muted">История продаж пуста</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {item.recentSales.map((sale, i) => (
              <div
                key={`${sale.time}-${i}`}
                className="border border-zone-border/50 bg-zone-dark/50 px-2 py-1 text-xs"
                title={formatTime(sale.time)}
              >
                <span className={`mr-1 ${QLT_CLASS[sale.qlt] ?? 'text-zone-muted'}`}>
                  {sale.qualityShort || sale.qualityLabel || '—'}
                </span>
                <span className="mr-1.5 text-zone-cyan">
                  {sale.ptnLabel || `+${sale.ptn ?? 0}`}
                </span>
                <span className="text-zone-green">
                  {formatPrice(sale.pricePerUnit ?? sale.price)}
                </span>
                {sale.amount > 1 && (
                  <span className="ml-1 text-zone-muted">×{sale.amount}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default StatsItemCard

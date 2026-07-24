import { getItemIconUrl } from '../../api/client'
import { useCountdown } from '../auction/useCountdown'

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
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

function BargainRow({ deal, locale }) {
  const countdown = useCountdown(deal.endTime)
  const name = deal.nameRu || deal.nameEn || deal.itemId
  const colorClass = COLOR_CLASS[deal.color] ?? 'text-zone-text'
  const iconUrl = getItemIconUrl(deal.icon, locale)

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
            {deal.amount > 1 && (
              <p className="text-[10px] text-zone-muted">x{deal.amount}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm font-medium text-zone-green">
        {formatPrice(deal.pricePerUnit)}
        <span className="block text-[10px] font-normal text-zone-muted">за шт</span>
      </td>
      <td className="px-3 py-3 text-sm text-zone-muted">
        {formatPrice(deal.avgPricePerUnit)}
        <span className="block text-[10px]">ср. ({deal.salesCount} продаж)</span>
      </td>
      <td className="px-3 py-3">
        <span className="text-sm font-medium text-zone-green">−{deal.discountPercent}%</span>
        <span className="block text-[10px] text-zone-muted">
          −{formatPrice(deal.savingsPerUnit)}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-zone-text">
        {deal.buyoutPrice != null ? formatPrice(deal.buyoutPrice) : '—'}
      </td>
    </tr>
  )
}

function BargainsTable({ deals, locale }) {
  if (!deals.length) {
    return (
      <p className="py-12 text-center text-sm text-zone-muted">
        Выгодных лотов не найдено. Попробуй другую категорию или снизь порог скидки.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-zone-border bg-zone-dark/60 text-left">
            <th className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-zone-muted">
              Предмет
            </th>
            <th className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-zone-muted">
              Цена лота
            </th>
            <th className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-zone-muted">
              Средняя
            </th>
            <th className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-zone-muted">
              Скидка
            </th>
            <th className="px-3 py-2.5 text-[10px] uppercase tracking-widest text-zone-muted">
              Выкуп
            </th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => (
            <BargainRow
              key={`${deal.itemId}-${deal.endTime}-${i}`}
              deal={deal}
              locale={locale}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BargainsTable

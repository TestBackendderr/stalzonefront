import { getItemIconUrl } from '../../api/client'

const COLOR_CLASS = {
  RANK_NEWBIE: 'text-zone-text',
  RANK_STALKER: 'text-zone-green',
  RANK_VETERAN: 'text-zone-cyan',
  RANK_MASTER: 'text-zone-amber',
  RANK_LEGEND: 'text-orange-400',
  DEFAULT: 'text-purple-400',
}

function ItemChip({ item, locale, size = 'md' }) {
  const iconUrl = getItemIconUrl(item.icon, locale)
  const name = item.nameRu || item.nameEn || item.id
  const colorClass = COLOR_CLASS[item.color] ?? 'text-zone-text'
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const img = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`flex ${box} shrink-0 items-center justify-center border border-zone-border bg-zone-black/50`}
      >
        {iconUrl ? (
          <img
            src={iconUrl}
            alt=""
            className={`${img} object-contain`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="text-[10px] text-zone-muted">?</span>
        )}
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm ${colorClass}`}>{name}</p>
        <p className="text-xs text-zone-amber">x{item.amount}</p>
      </div>
    </div>
  )
}

export default ItemChip

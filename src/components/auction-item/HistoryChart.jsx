import { useMemo, useState } from 'react'

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

function formatAxisPrice(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}м`
  if (value >= 1_000) return `${Math.round(value / 1_000)}к`
  return String(value)
}

function HistoryChart({ sales }) {
  const [hover, setHover] = useState(null)

  const width = 720
  const height = 320
  const pad = { top: 20, right: 20, bottom: 44, left: 64 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const { points, minPrice, maxPrice, yTicks } = useMemo(() => {
    if (!sales?.length) {
      return { points: [], minPrice: 0, maxPrice: 1, yTicks: [0, 1] }
    }

    const prices = sales.map((s) => s.pricePerUnit)
    let minP = Math.min(...prices)
    let maxP = Math.max(...prices)
    if (minP === maxP) {
      minP = Math.max(0, minP * 0.9)
      maxP = maxP * 1.1 || 1
    }
    const padY = (maxP - minP) * 0.08
    minP = Math.max(0, minP - padY)
    maxP = maxP + padY

    const times = sales.map((s) => new Date(s.time).getTime())
    const minT = Math.min(...times)
    const maxT = Math.max(...times)
    const spanT = Math.max(maxT - minT, 1)

    const pts = sales.map((sale, index) => {
      const t = new Date(sale.time).getTime()
      const x = sales.length === 1
        ? pad.left + innerW / 2
        : pad.left + ((t - minT) / spanT) * innerW
      const y = pad.top + innerH - ((sale.pricePerUnit - minP) / (maxP - minP)) * innerH
      return { ...sale, x, y, index }
    })

    const tickCount = 5
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      return minP + ((maxP - minP) * i) / (tickCount - 1)
    })

    return { points: pts, minPrice: minP, maxPrice: maxP, yTicks: ticks }
  }, [sales, innerW, innerH, pad.left, pad.top])

  if (!sales?.length) {
    return (
      <p className="py-10 text-center text-sm text-zone-muted">
        Нет продаж для выбранных фильтров
      </p>
    )
  }

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const oldest = sales[0]
  const newest = sales[sales.length - 1]

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[560px] max-w-full"
        role="img"
        aria-label="График истории продаж"
      >
        <rect x="0" y="0" width={width} height={height} fill="transparent" />

        {yTicks.map((tick) => {
          const y = pad.top + innerH - ((tick - minPrice) / (maxPrice - minPrice)) * innerH
          return (
            <g key={`y-${tick}`}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                stroke="currentColor"
                className="text-zone-border/50"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-zone-muted"
                fontSize="10"
              >
                {formatAxisPrice(Math.round(tick))}
              </text>
            </g>
          )
        })}

        <line
          x1={pad.left}
          y1={pad.top + innerH}
          x2={width - pad.right}
          y2={pad.top + innerH}
          stroke="currentColor"
          className="text-zone-border"
          strokeWidth="1.5"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + innerH}
          stroke="currentColor"
          className="text-zone-border"
          strokeWidth="1.5"
        />

        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          className="text-zone-amber"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point) => (
          <circle
            key={`${point.time}-${point.index}`}
            cx={point.x}
            cy={point.y}
            r={hover?.index === point.index ? 5.5 : 3.5}
            className={
              hover?.index === point.index
                ? 'fill-zone-green'
                : 'fill-zone-amber'
            }
            onMouseEnter={() => setHover(point)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: 'pointer' }}
          />
        ))}

        <text
          x={pad.left}
          y={height - 12}
          className="fill-zone-muted"
          fontSize="10"
        >
          {formatTime(oldest.time)} · старые
        </text>
        <text
          x={width - pad.right}
          y={height - 12}
          textAnchor="end"
          className="fill-zone-muted"
          fontSize="10"
        >
          новые · {formatTime(newest.time)}
        </text>
      </svg>

      {hover && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 border border-zone-border bg-zone-dark/95 px-3 py-2 text-xs shadow-lg">
          <p className="text-zone-amber">{formatPrice(hover.pricePerUnit)}</p>
          <p className="text-zone-muted">{formatTime(hover.time)}</p>
          <p className="text-zone-text">
            {hover.qualityShort} · {hover.ptnLabel}
            {hover.amount > 1 ? ` · ×${hover.amount}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export default HistoryChart

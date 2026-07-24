import { useEffect, useState } from 'react'

export function formatCountdown(endTime) {
  const diff = new Date(endTime).getTime() - Date.now()
  if (diff <= 0) return 'Завершён'

  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  return `Осталось ${h} ч ${m} мин ${s} с`
}

export function useCountdown(endTime) {
  const [text, setText] = useState(() => formatCountdown(endTime))

  useEffect(() => {
    setText(formatCountdown(endTime))
    const id = setInterval(() => setText(formatCountdown(endTime)), 1000)
    return () => clearInterval(id)
  }, [endTime])

  return text
}

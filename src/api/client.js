const API_BASE = '/api'

async function request(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Request failed: ${response.status}`)
  }

  return response.json()
}

export function getAuctionMeta({ locale = 'ru' } = {}) {
  return request('/meta/auction', { locale })
}

export function getAuctionValueNow({
  region = 'RU',
  locale = 'ru',
  category = 'artefact',
  q = '',
  itemOffset = 0,
  maxItemsScan = 15,
  minDiscount = 10,
} = {}) {
  return request('/auction/value-now', {
    region,
    locale,
    category,
    q,
    itemOffset,
    maxItemsScan,
    minDiscount,
  })
}

export function getAuctionStats({
  region = 'RU',
  locale = 'ru',
  category = 'artefact',
  quality = 'all',
  q = '',
  itemOffset = 0,
  maxItemsScan = 12,
  historyLimit = 15,
  sort = 'desc',
} = {}) {
  return request('/auction/stats', {
    region,
    locale,
    category,
    quality,
    q,
    itemOffset,
    maxItemsScan,
    historyLimit,
    sort,
  })
}

export function browseAuctionBargains({
  region = 'RU',
  locale = 'ru',
  category = 'all',
  quality = 'all',
  q = '',
  itemOffset = 0,
  minDiscount = 20,
  maxItemsScan = 15,
} = {}) {
  return request('/auction/bargains', {
    region,
    locale,
    category,
    quality,
    q,
    itemOffset,
    minDiscount,
    maxItemsScan,
  })
}

export function browseAuction({
  region = 'RU',
  locale = 'ru',
  category = 'all',
  quality = 'all',
  q = '',
  itemOffset = 0,
  targetLots = 50,
  maxItemsScan = 25,
} = {}) {
  return request('/auction/browse', {
    region,
    locale,
    category,
    quality,
    q,
    itemOffset,
    targetLots,
    maxItemsScan,
  })
}

export function getHideoutMeta({ locale = 'ru' } = {}) {
  return request('/hideout/meta', { locale })
}

export function getHideoutRecipes({
  locale = 'ru',
  bench = 'all',
  category = 'all',
  q = '',
} = {}) {
  return request('/hideout/recipes', { locale, bench, category, q })
}

export function getCraftsMeta({ locale = 'ru' } = {}) {
  return request('/crafts/meta', { locale })
}

export function getCraftsRecipes({
  locale = 'ru',
  region = 'RU',
  bench = 'all',
  category = 'all',
  q = '',
  limit = 30,
  offset = 0,
} = {}) {
  return request('/crafts/recipes', { locale, region, bench, category, q, limit, offset })
}

export function getProfitableCrafts({
  locale = 'ru',
  region = 'RU',
  bench = 'all',
  category = 'all',
  q = '',
} = {}) {
  return request('/crafts/profitable', { locale, region, bench, category, q })
}

export function getItemIconUrl(icon, locale = 'ru') {
  if (!icon) return null
  const folder = locale === 'ru' ? 'ru' : 'global'
  return `https://raw.githubusercontent.com/EXBO-Studio/stalcraft-database/main/${folder}${icon}`
}

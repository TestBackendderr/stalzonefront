import { useCallback, useEffect, useState } from 'react'
import { getCraftsMeta, getCraftsRecipes } from '../../api/client'
import HideoutSidebar from '../hideout/HideoutSidebar'
import CraftsRecipeCard from './CraftsRecipeCard'

const PAGE_SIZE = 30

function Crafts() {
  const [meta, setMeta] = useState(null)
  const [bench, setBench] = useState('all')
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('RU')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [recipes, setRecipes] = useState([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [apiMode, setApiMode] = useState(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const locale = region === 'RU' ? 'ru' : 'global'

  useEffect(() => {
    getCraftsMeta({ locale })
      .then(setMeta)
      .catch((err) => setError(err.message))
  }, [locale])

  const loadRecipes = useCallback(async (pageIndex, append) => {
    const setBusy = append ? setLoadingMore : setLoading
    setBusy(true)
    if (!append) setError(null)

    try {
      const data = await getCraftsRecipes({
        locale,
        region,
        bench,
        category,
        q: searchQuery,
        limit: PAGE_SIZE,
        offset: pageIndex * PAGE_SIZE,
      })

      setRecipes((prev) => (append ? [...prev, ...data.recipes] : data.recipes))
      setTotal(data.total)
      setHasMore(data.hasMore)
      setApiMode(data.apiMode)
      setRateLimited(Boolean(data.rateLimited))
      setPage(pageIndex)
    } catch (err) {
      setRateLimited(false)
      setError(err.message)
      if (!append) setRecipes([])
    } finally {
      setBusy(false)
    }
  }, [bench, category, searchQuery, region, locale])

  useEffect(() => {
    if (meta) loadRecipes(0, false)
  }, [meta, loadRecipes])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  function handleLoadMore() {
    if (hasMore && !loadingMore && !loading) {
      loadRecipes(page + 1, true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-zone-border bg-zone-panel/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl text-zone-amber">Крафты</h2>
          {apiMode === 'production' && (
            <span className="text-xs text-zone-green">● live</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zone-muted">
          {meta
            ? `${meta.totalRecipes} рецептов · цены с аукциона (${region})`
            : 'Загрузка...'}
        </p>
      </div>

      {rateLimited && !error && (
        <div className="border border-zone-amber/50 bg-zone-amber/10 px-4 py-3 text-sm text-zone-amber">
          Лимит запросов API — часть цен недоступна. Подожди минуту и обнови страницу.
        </div>
      )}

      {error && (
        <div className="border border-zone-danger/50 bg-zone-danger/10 px-4 py-3 text-sm text-zone-danger">
          {error.includes('429')
            ? 'Превышен лимит запросов Stalcraft API. Подожди 1–2 минуты и попробуй снова.'
            : error}
          {!error.includes('429') && (
            <p className="mt-1 text-xs text-zone-muted">
              Запусти бэкенд: <code>cd back && npm run dev</code>
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        {meta && (
          <HideoutSidebar
            benches={meta.benches}
            categories={meta.categories}
            activeBench={bench}
            activeCategory={category}
            onBenchChange={setBench}
            onCategoryChange={setCategory}
          />
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 border border-zone-border bg-zone-dark/40 p-3 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по предмету или рецепту..."
              className="min-w-0 flex-1 border border-zone-border bg-zone-panel px-3 py-2 text-sm text-zone-text outline-none focus:border-zone-amber"
            />
            <button
              type="submit"
              disabled={loading}
              className="border border-zone-border bg-zone-panel px-4 py-2 text-xs uppercase tracking-wider text-zone-amber hover:border-zone-amber disabled:opacity-50"
            >
              Поиск
            </button>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={loading}
              className="border border-zone-border bg-zone-panel px-2 py-2 text-sm text-zone-text outline-none focus:border-zone-amber disabled:opacity-50"
            >
              {['RU', 'EU', 'NA', 'SEA'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </form>

          <p className="text-xs text-zone-muted">
            Показано: {loading ? '...' : `${recipes.length} из ${total}`}
            {!loading && recipes.length > 0 && (
              <span className="ml-2">· Мин. цена выкупа за штуку</span>
            )}
          </p>

          {loading && (
            <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
              Загрузка рецептов и цен...
            </p>
          )}

          {!loading && recipes.length === 0 && (
            <p className="py-12 text-center text-sm text-zone-muted">
              Рецепты не найдены
            </p>
          )}

          {!loading && recipes.length > 0 && (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {recipes.map((recipe) => (
                <CraftsRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  locale={locale}
                />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full border border-zone-border bg-zone-panel py-2 text-xs uppercase tracking-wider text-zone-amber hover:border-zone-amber disabled:opacity-50"
            >
              {loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Crafts

import { useCallback, useEffect, useState } from 'react'
import { getCraftsMeta, getProfitableCrafts } from '../../api/client'
import HideoutSidebar from '../hideout/HideoutSidebar'
import CraftsRecipeCard from '../crafts/CraftsRecipeCard'
import { formatPrice } from '../crafts/formatPrice'

function ProfitableCrafts() {
  const [meta, setMeta] = useState(null)
  const [bench, setBench] = useState('workbench')
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('RU')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [totalScanned, setTotalScanned] = useState(0)
  const [apiMode, setApiMode] = useState(null)
  const [rateLimited, setRateLimited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const locale = region === 'RU' ? 'ru' : 'global'

  useEffect(() => {
    getCraftsMeta({ locale })
      .then(setMeta)
      .catch((err) => setError(err.message))
  }, [locale])

  const loadRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProfitableCrafts({
        locale,
        region,
        bench,
        category,
        q: searchQuery,
      })
      setRecipes(data.recipes)
      setTotalScanned(data.totalScanned ?? data.total)
      setApiMode(data.apiMode)
      setRateLimited(Boolean(data.rateLimited))
    } catch (err) {
      setRateLimited(false)
      setError(err.message)
      setRecipes([])
      setTotalScanned(0)
    } finally {
      setLoading(false)
    }
  }, [bench, category, searchQuery, region, locale])

  useEffect(() => {
    if (meta) loadRecipes()
  }, [meta, loadRecipes])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  return (
    <div className="space-y-4">
      <div className="border border-zone-border bg-zone-panel/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl text-zone-amber">Выгодные крафты</h2>
          {apiMode === 'production' && (
            <span className="text-xs text-zone-green">● live</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zone-muted">
          Только с прибылью · все расходники с ценой на аукционе ({region})
          {bench === 'all' && ' · выбери верстак для быстрой загрузки'}
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
            {loading
              ? 'Загрузка...'
              : `Выгодных: ${recipes.length}${totalScanned ? ` из ${totalScanned} проверенных` : ''} · сортировка по прибыли`}
          </p>

          {loading && (
            <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
              Поиск выгодных крафтов...
              <br />
              <span className="text-xs text-zone-muted">
                Загружаются цены с аукциона (до 1–2 мин при «Все»)
              </span>
            </p>
          )}

          {!loading && recipes.length === 0 && (
            <p className="py-12 text-center text-sm text-zone-muted">
              Выгодных крафтов не найдено
            </p>
          )}

          {!loading && recipes.length > 0 && (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {recipes.map((recipe, index) => (
                <div key={recipe.id} className="relative">
                  <div className="absolute -left-1 top-4 z-10 flex h-7 w-7 items-center justify-center border border-zone-green/50 bg-zone-dark text-xs font-medium text-zone-green">
                    {index + 1}
                  </div>
                  <div className="pl-8">
                    <div className="mb-1 flex justify-end pr-1">
                      <span className="text-sm font-medium text-zone-green">
                        +{formatPrice(recipe.pricing.profit)}
                      </span>
                    </div>
                    <CraftsRecipeCard recipe={recipe} locale={locale} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfitableCrafts

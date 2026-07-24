import { useCallback, useEffect, useState } from 'react'
import { getHideoutMeta, getHideoutRecipes } from '../../api/client'
import HideoutSidebar from './HideoutSidebar'
import HideoutRecipeCard from './HideoutRecipeCard'

function Hideout() {
  const [meta, setMeta] = useState(null)
  const [bench, setBench] = useState('all')
  const [category, setCategory] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const locale = 'ru'

  useEffect(() => {
    getHideoutMeta({ locale })
      .then(setMeta)
      .catch((err) => setError(err.message))
  }, [])

  const loadRecipes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getHideoutRecipes({
        locale,
        bench,
        category,
        q: searchQuery,
      })
      setRecipes(data.recipes)
    } catch (err) {
      setError(err.message)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [bench, category, searchQuery])

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
        <h2 className="font-display text-xl text-zone-amber">Крафты убежища</h2>
        <p className="mt-1 text-sm text-zone-muted">
          {meta
            ? `${meta.totalRecipes} рецептов · ${meta.benches.length} верстака · ${meta.categories.length} категорий`
            : 'Загрузка...'}
        </p>
      </div>

      {error && (
        <div className="border border-zone-danger/50 bg-zone-danger/10 px-4 py-3 text-sm text-zone-danger">
          {error}
          <p className="mt-1 text-xs text-zone-muted">
            Запусти бэкенд: <code>cd back && npm run dev</code>
          </p>
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
            className="flex gap-2 border border-zone-border bg-zone-dark/40 p-3"
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
          </form>

          <p className="text-xs text-zone-muted">
            Найдено рецептов: {loading ? '...' : recipes.length}
          </p>

          {loading && (
            <p className="py-12 text-center text-sm text-zone-amber animate-pulse-glow">
              Загрузка рецептов...
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
                <HideoutRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Hideout

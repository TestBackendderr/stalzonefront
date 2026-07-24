import ItemChip from './ItemChip'

function HideoutRecipeCard({ recipe, locale }) {
  return (
    <article className="border border-zone-border bg-zone-panel/40 p-4 transition-colors hover:border-zone-border/80 hover:bg-zone-panel/60">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-zone-muted">
        <span className="text-zone-amber">{recipe.benchLabel}</span>
        <span>·</span>
        <span>{recipe.category}</span>
        {recipe.subcategory && (
          <>
            <span>·</span>
            <span>{recipe.subcategory}</span>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-zone-muted">
            Результат
          </p>
          <div className="space-y-2">
            {recipe.result.map((item) => (
              <ItemChip key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center text-zone-muted lg:flex">
          ←
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-zone-muted">
            Ингредиенты
          </p>
          <div className="space-y-2">
            {recipe.ingredients.map((item) => (
              <ItemChip key={`${item.id}-${item.amount}`} item={item} locale={locale} size="sm" />
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap gap-3 border-t border-zone-border/40 pt-3 text-xs text-zone-muted">
        <span>
          Энергия: <span className="text-zone-text">{recipe.energy}</span>
        </span>
        {recipe.perks.length > 0 && (
          <span>
            Навык:{' '}
            {recipe.perks.map((p) => (
              <span key={p.id} className="text-zone-green">
                {p.label} {p.level}
              </span>
            ))}
          </span>
        )}
        {recipe.features.length > 0 && (
          <span className="text-zone-muted/80">
            Модули: {recipe.features.join(', ')}
          </span>
        )}
      </footer>
    </article>
  )
}

export default HideoutRecipeCard

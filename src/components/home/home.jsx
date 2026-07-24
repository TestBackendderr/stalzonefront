import ZoneButton from '../ui/ZoneButton'

const sections = [
  {
    to: '/auction',
    icon: '◈',
    title: 'Аукцион',
    description: 'Цены, лоты и история продаж предметов из Зоны.',
  },
  {
    to: '/auction-deals',
    icon: '◇',
    title: 'Скидки',
    description: 'Лоты ниже средней цены — лови дешёвые вещи на аукционе.',
  },
  {
    to: '/auction-value-now',
    icon: '▼',
    title: 'Выгода сейчас',
    description: 'Артефакты, где мин. цена сейчас минимум на 10% ниже средней.',
  },
  {
    to: '/auction-stats',
    icon: '▣',
    title: 'Статистика',
    description: 'Цены по категориям и последние продажи предметов.',
  },
  {
    to: '/hideout',
    icon: '⌂',
    title: 'Убежище',
    description: 'Улучшения базы, модули и состояние вашего убежища.',
  },
  {
    to: '/crafts',
    icon: '⚙',
    title: 'Крафты',
    description: 'Рецепты, ресурсы и калькулятор крафта предметов.',
  },
  {
    to: '/profitable-crafts',
    icon: '▲',
    title: 'Выгодные крафты',
    description: 'Рейтинг крафтов по прибыли — где ресурсы дешевле, чем результат.',
  },
]

function Home() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-zone-muted">
          // система доступа к данным зоны
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-zone-amber sm:text-5xl">
          ДОБРО ПОЖАЛОВАТЬ, СТАЛКЕР
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zone-muted sm:text-base">
          Выберите раздел для работы с игровыми данными. Все модули подключены к
          базе предметов STALCRAFT.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {sections.map((section) => (
          <ZoneButton key={section.to} {...section} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest text-zone-muted">
        <span className="h-px w-12 bg-zone-border" />
        <span>сигнал стабилен</span>
        <span className="h-px w-12 bg-zone-border" />
      </div>
    </div>
  )
}

export default Home

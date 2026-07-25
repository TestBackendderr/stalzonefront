import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/auction', label: 'Аукцион', icon: '◈' },
  { to: '/auction-deals', label: 'Скидки(в работе)', icon: '◇' },
  { to: '/auction-value-now', label: 'Выгода сейчас(арты)', icon: '▼' },
  { to: '/auction-value-now-gear', label: 'Выгода сейчас(снаряжение)', icon: '◆' },
  { to: '/auction-stats', label: 'Статистика', icon: '▣' },
  { to: '/hideout', label: 'Убежище', icon: '⌂' },
  { to: '/crafts', label: 'Крафты', icon: '⚙' },
  { to: '/profitable-crafts', label: 'Выгодные крафты', icon: '▲' },
]

function Layout() {
  return (
    <div className="relative min-h-screen bg-zone-black">
      <div className="zone-atmosphere" aria-hidden="true" />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <header className="relative z-10 border-b border-zone-border/60 bg-zone-dark/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink
            to="/"
            className="group flex items-center gap-3 no-underline"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-zone-amber/50 bg-zone-panel text-zone-amber animate-pulse-glow">
              ☢
            </span>
            <div>
              <p className="font-display text-lg tracking-widest text-zone-amber animate-flicker sm:text-xl">
                STALCRAFT
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zone-muted">
                zone terminal v0.1
              </p>
            </div>
          </NavLink>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 border px-2.5 py-1.5 text-xs uppercase tracking-wider transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
                    isActive
                      ? 'border-zone-amber bg-zone-amber/15 text-zone-amber shadow-[0_0_12px_rgba(201,162,39,0.25)]'
                      : 'border-zone-border/50 bg-zone-panel/50 text-zone-muted hover:border-zone-olive hover:text-zone-text',
                  ].join(' ')
                }
              >
                <span aria-hidden="true">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-zone-border/40 bg-zone-dark/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest text-zone-muted sm:px-6">
          <span>Радиация: ▓▓▓░░ норма</span>
          <span className="animate-radiation text-zone-green">● online</span>
        </div>
      </footer>
    </div>
  )
}

export default Layout

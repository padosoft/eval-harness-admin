import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';
import { useI18n } from '@/hooks/useI18n';

const navItems = [
  { to: '/', key: 'nav_dashboard' },
  { to: '/reports', key: 'nav_reports' },
  { to: '/compare', key: 'nav_compare' },
  { to: '/trend', key: 'nav_trend' },
  { to: '/adversarial', key: 'nav_adversarial' },
  { to: '/live-batches', key: 'nav_live_batches' },
];

const AppShell = ({ title, version, children }: { title: string; version: string; children: ReactNode }) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-xs text-slate-500">v {version}</p>
          </div>
          <span className="text-xs text-slate-500">{t('nav_admin_label', 'Eval Harness Admin')}</span>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl gap-4 px-6 py-4">
        <aside className="w-56">
          <nav className="panel rounded-ui">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `block rounded-ui px-3 py-2 text-sm ${
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <section className="min-h-[calc(100vh-88px)] flex-1">
          <div className="panel min-h-full">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AppShell;

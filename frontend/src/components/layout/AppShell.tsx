import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/features/theme/ThemeContext';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SunIcon, MoonIcon } from '@/components/ui/icons';
import { getFullName } from '@/lib/user';

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col text-text">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/80 px-6 py-3 backdrop-blur-md">
        <Link to="/workspaces" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-hover text-xs font-bold text-white shadow-sm shadow-primary/30">
            C
          </span>
          Collabrix
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-full p-1.5 text-muted hover:bg-bg hover:text-text"
            >
              {theme === 'dark' ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
            </button>
            <NotificationBell />
            <Avatar user={user} />
            <span className="text-sm text-muted">{getFullName(user)}</span>
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

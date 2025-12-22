import type { LucideIcon } from 'lucide-react';
import { Briefcase, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Location } from 'react-router';
import { Link, useLocation } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import ThemeSwitcher from './theme-switcher';
import UserDropdown from './user-dropdown';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}

const NavItem = ({ item, isActive, collapsed }: NavItemProps) => {
  const { path, label, icon: Icon } = item;

  return collapsed ? (
    <Link
      key={uuidv4()}
      to={path}
      className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
      }`}
    >
      <Icon className='h-5 w-5' />
      <span className='sr-only'>{label}</span>
    </Link>
  ) : (
    <Link
      key={uuidv4()}
      to={path}
      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
      }`}
    >
      <Icon className='h-5 w-5 flex-shrink-0' />
      <span className='truncate'>{label}</span>
    </Link>
  );
};

interface SidebarProps {
  navItems: NavItem[];
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
}

export const Sidebar = ({ navItems, userEmail, onSignOut }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location: Location = useLocation();

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <>
      <aside
        className={`flex h-screen flex-col border-r transition-[width] duration-300 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div className='flex items-center justify-between border-b p-4'>
          {!collapsed && (
            <Link to='/' className='flex items-center gap-2 text-lg font-semibold'>
              <Briefcase className='h-5 w-5' />
              <span className='dark:text-white'>JobTracker</span>
            </Link>
          )}

          <button
            type='button'
            onClick={toggleSidebar}
            className={`rounded-md p-2 ${collapsed ? 'ml-auto' : ''}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className='h-5 w-5' /> : <ChevronLeft className='h-5 w-5' />}
          </button>
        </div>

        <div className='flex-1 p-3'>
          <nav className='flex flex-col items-start justify-center gap-5'>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavItem key={item.path} item={item} isActive={isActive} collapsed={collapsed} />
              );
            })}
          </nav>
        </div>

        <div className='border-t p-2'>
          {!collapsed ? (
            <div className='flex items-center justify-between gap-2'>
              <UserDropdown collapsed={collapsed} userEmail={userEmail} onSignOut={onSignOut} />
              <ThemeSwitcher
                themes={[
                  { value: 'light', icon: Sun, label: 'Switch to dark theme' },
                  { value: 'dark', icon: Moon, label: 'Switch to light theme' },
                ]}
                defaultTheme='light'
              />
            </div>
          ) : (
            <div className='flex flex-col-reverse items-center justify-center gap-3'>
              <UserDropdown collapsed={collapsed} userEmail={userEmail} onSignOut={onSignOut} />
              <ThemeSwitcher
                themes={[
                  { value: 'light', icon: Sun, label: 'Switch to dark theme' },
                  { value: 'dark', icon: Moon, label: 'Switch to light theme' },
                ]}
                defaultTheme='light'
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

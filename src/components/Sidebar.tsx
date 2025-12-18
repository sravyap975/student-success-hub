import { ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  LayoutDashboard,
  CheckSquare,
  Megaphone,
  StickyNote,
  Moon,
  Sun,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const navItems: { view: ViewMode; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'tasks', label: 'Tasks', icon: CheckSquare },
  { view: 'announcements', label: 'Events', icon: Megaphone },
  { view: 'notes', label: 'Notes', icon: StickyNote },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sidebar-foreground">StudyHub</h1>
            <p className="text-xs text-muted-foreground">Life Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ view, label, icon: Icon }) => (
          <Button
            key={view}
            variant={activeView === view ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-3 h-11 ${
              activeView === view
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
            onClick={() => onViewChange(view)}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Button>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
    </aside>
  );
}

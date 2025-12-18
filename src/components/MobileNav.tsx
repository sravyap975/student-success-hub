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
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface MobileNavProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const navItems: { view: ViewMode; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'tasks', label: 'Tasks', icon: CheckSquare },
  { view: 'announcements', label: 'Events', icon: Megaphone },
  { view: 'notes', label: 'Notes', icon: StickyNote },
];

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleViewChange = (view: ViewMode) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-b border-border z-50 lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">StudyHub</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <nav className="absolute top-16 left-0 right-0 bg-background border-b border-border p-4 space-y-1 animate-slide-up">
            {navItems.map(({ view, label, icon: Icon }) => (
              <Button
                key={view}
                variant={activeView === view ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 h-12 ${
                  activeView === view ? 'bg-accent font-medium' : ''
                }`}
                onClick={() => handleViewChange(view)}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Button>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={toggleTheme}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Bottom Tab Bar for quick access */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-t border-border z-50 lg:hidden">
        <div className="flex items-center justify-around h-full">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                activeView === view
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBannerProps {
  enabled: boolean;
  onEnable: () => void;
}

export function NotificationBanner({ enabled, onEnable }: NotificationBannerProps) {
  if (enabled) return null;

  return (
    <div className="bg-status-warning-bg border border-status-warning/20 rounded-xl p-4 mb-6 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-status-warning/20 flex items-center justify-center shrink-0">
          <BellOff className="w-5 h-5 text-status-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground">Enable Notifications</h4>
          <p className="text-sm text-muted-foreground">
            Get reminders for upcoming deadlines and events
          </p>
        </div>
        <Button onClick={onEnable} size="sm" className="shrink-0">
          <Bell className="w-4 h-4 mr-2" />
          Enable
        </Button>
      </div>
    </div>
  );
}

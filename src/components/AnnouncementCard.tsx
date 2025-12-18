import { Announcement } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO, isPast, isToday, isTomorrow } from 'date-fns';
import { Calendar, Trash2, Edit2, AlertCircle, CalendarCheck } from 'lucide-react';

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementCard({ announcement, onEdit, onDelete }: AnnouncementCardProps) {
  const regDeadline = parseISO(announcement.registrationDeadline);
  const participationDate = parseISO(announcement.participationDate);
  const isMissed = isPast(regDeadline) && !isToday(regDeadline);
  const isDeadlineToday = isToday(regDeadline);
  const isDeadlineTomorrow = isTomorrow(regDeadline);

  return (
    <div
      className={`group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:shadow-md animate-slide-up ${
        isMissed ? 'opacity-60 border-muted' : ''
      } ${isDeadlineToday ? 'border-status-warning/50 bg-status-warning-bg/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="category-event">Event</Badge>
            {isMissed && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Registration Closed
              </Badge>
            )}
            {isDeadlineToday && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Register Today!
              </Badge>
            )}
            {isDeadlineTomorrow && (
              <Badge variant="info" className="flex items-center gap-1">
                Deadline Tomorrow
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-card-foreground mb-2">
            {announcement.eventName}
          </h3>
          
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-status-warning" />
              <span>Register by: <span className={isMissed ? 'text-destructive' : 'font-medium text-foreground'}>{format(regDeadline, 'MMM d, yyyy')}</span></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="w-3.5 h-3.5 text-primary" />
              <span>Event: <span className="font-medium text-foreground">{format(participationDate, 'MMM d, yyyy')}</span></span>
            </div>
          </div>
          
          {announcement.notes && (
            <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
              {announcement.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(announcement)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(announcement.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

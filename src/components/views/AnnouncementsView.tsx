import { Announcement } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EmptyState } from '@/components/EmptyState';
import {
  getUpcomingAnnouncements,
  getMissedAnnouncements,
} from '@/utils/helpers';
import { Plus, Megaphone, Calendar, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

type AnnouncementFilter = 'all' | 'upcoming' | 'missed';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onAddAnnouncement: () => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementsView({
  announcements,
  onAddAnnouncement,
  onEdit,
  onDelete,
}: AnnouncementsViewProps) {
  const [filter, setFilter] = useState<AnnouncementFilter>('all');

  const getFilteredAnnouncements = (): Announcement[] => {
    switch (filter) {
      case 'upcoming':
        return getUpcomingAnnouncements(announcements);
      case 'missed':
        return getMissedAnnouncements(announcements);
      default:
        return announcements;
    }
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  const counts = {
    all: announcements.length,
    upcoming: getUpcomingAnnouncements(announcements).length,
    missed: getMissedAnnouncements(announcements).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Events & Announcements
          </h1>
          <p className="text-muted-foreground">
            Track hackathons, workshops, exams, and competitions
          </p>
        </div>
        <Button onClick={onAddAnnouncement} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="gap-2"
        >
          <Megaphone className="w-4 h-4" />
          All Events
          {counts.all > 0 && (
            <Badge variant={filter === 'all' ? 'secondary' : 'outline'}>
              {counts.all}
            </Badge>
          )}
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Upcoming
          {counts.upcoming > 0 && (
            <Badge variant={filter === 'upcoming' ? 'secondary' : 'outline'}>
              {counts.upcoming}
            </Badge>
          )}
        </Button>
        <Button
          variant={filter === 'missed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('missed')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Missed Registration
          {counts.missed > 0 && (
            <Badge variant={filter === 'missed' ? 'secondary' : 'destructive'}>
              {counts.missed}
            </Badge>
          )}
        </Button>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8">
          <EmptyState
            icon={<Megaphone className="w-10 h-10 text-muted-foreground" />}
            title={
              filter === 'missed'
                ? "No missed registrations"
                : `No ${filter === 'all' ? '' : filter} events`
            }
            description={
              filter === 'missed'
                ? "Great job! You haven't missed any registration deadlines."
                : "Add upcoming hackathons, workshops, or exams to stay on track."
            }
            action={
              filter !== 'missed' && (
                <Button onClick={onAddAnnouncement} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAnnouncements
            .sort((a, b) => {
              // Sort by registration deadline
              return (
                new Date(a.registrationDeadline).getTime() -
                new Date(b.registrationDeadline).getTime()
              );
            })
            .map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </div>
      )}
    </div>
  );
}

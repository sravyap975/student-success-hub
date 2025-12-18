import { Task, Announcement, Note } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { NoteCard } from '@/components/NoteCard';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { NotificationBanner } from '@/components/NotificationBanner';
import {
  getTodayTasks,
  getUpcomingTasks,
  getOverdueTasks,
  getUpcomingAnnouncements,
  calculateProgress,
} from '@/utils/helpers';
import {
  Plus,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Sparkles,
  Clock,
  Target,
  StickyNote,
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

interface DashboardViewProps {
  tasks: Task[];
  announcements: Announcement[];
  notes: Note[];
  onAddTask: () => void;
  onAddAnnouncement: () => void;
  onAddNote: () => void;
  onToggleTaskComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  notificationsEnabled: boolean;
  onEnableNotifications: () => void;
}

export function DashboardView({
  tasks,
  announcements,
  notes,
  onAddTask,
  onAddAnnouncement,
  onAddNote,
  onToggleTaskComplete,
  onEditTask,
  onDeleteTask,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onEditNote,
  onDeleteNote,
  notificationsEnabled,
  onEnableNotifications,
}: DashboardViewProps) {
  const todayTasks = getTodayTasks(tasks);
  const upcomingTasks = getUpcomingTasks(tasks);
  const overdueTasks = getOverdueTasks(tasks);
  const upcomingAnnouncements = getUpcomingAnnouncements(announcements);
  const todayNotes = notes.filter(n => isToday(parseISO(n.date)));
  const progress = calculateProgress(tasks);

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      <NotificationBanner enabled={notificationsEnabled} onEnable={onEnableNotifications} />

      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-accent via-accent/50 to-background rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Good {getTimeOfDay()}, Student!
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard
            icon={<Target className="w-5 h-5 text-primary" />}
            label="Pending"
            value={pendingCount}
            color="primary"
          />
          <StatCard
            icon={<CheckSquare className="w-5 h-5 text-status-success" />}
            label="Completed"
            value={completedCount}
            color="success"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
            label="Overdue"
            value={overdueTasks.length}
            color="destructive"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-category-event" />}
            label="Events"
            value={upcomingAnnouncements.length}
            color="event"
          />
        </div>

        {/* Progress */}
        <ProgressBar value={progress} label="Task Completion" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onAddTask} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
        <Button onClick={onAddAnnouncement} variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Add Event
        </Button>
        <Button onClick={onAddNote} variant="outline" className="gap-2">
          <StickyNote className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Overdue Tasks</h3>
            <Badge variant="destructive">{overdueTasks.length}</Badge>
          </div>
          <div className="space-y-3">
            {overdueTasks.slice(0, 3).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleTaskComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Today's Tasks</h2>
              {todayTasks.length > 0 && (
                <Badge variant="secondary">{todayTasks.length}</Badge>
              )}
            </div>
          </div>
          {todayTasks.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <EmptyState
                icon={<CheckSquare className="w-8 h-8 text-muted-foreground" />}
                title="No tasks for today"
                description="You're all caught up! Add a new task to stay organized."
                action={
                  <Button onClick={onAddTask} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleTaskComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-category-event" />
              <h2 className="font-display font-semibold text-foreground">Upcoming Events</h2>
              {upcomingAnnouncements.length > 0 && (
                <Badge variant="category-event">{upcomingAnnouncements.length}</Badge>
              )}
            </div>
          </div>
          {upcomingAnnouncements.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <EmptyState
                icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
                title="No upcoming events"
                description="Add hackathons, workshops, or exams to never miss an opportunity."
                action={
                  <Button onClick={onAddAnnouncement} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAnnouncements.slice(0, 3).map(announcement => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onEdit={onEditAnnouncement}
                  onDelete={onDeleteAnnouncement}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Notes */}
      {todayNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-accent-foreground" />
            <h2 className="font-display font-semibold text-foreground">Today's Notes</h2>
            <Badge variant="secondary">{todayNotes.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {todayNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-card/50 rounded-xl p-3 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold font-display text-foreground">{value}</p>
    </div>
  );
}

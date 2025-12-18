import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import {
  getTodayTasks,
  getUpcomingTasks,
  getOverdueTasks,
  getCompletedTasks,
  calculateProgress,
} from '@/utils/helpers';
import {
  Plus,
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const filterConfig: { key: TaskFilter; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: CheckSquare },
  { key: 'today', label: 'Today', icon: Clock },
  { key: 'upcoming', label: 'Upcoming', icon: Calendar },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export function TasksView({
  tasks,
  onAddTask,
  onToggleComplete,
  onEdit,
  onDelete,
}: TasksViewProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');

  const progress = calculateProgress(tasks);
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const getFilteredTasks = (): Task[] => {
    switch (filter) {
      case 'today':
        return getTodayTasks(tasks);
      case 'upcoming':
        return getUpcomingTasks(tasks);
      case 'overdue':
        return getOverdueTasks(tasks);
      case 'completed':
        return getCompletedTasks(tasks);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const getCounts = () => ({
    all: tasks.length,
    today: getTodayTasks(tasks).length,
    upcoming: getUpcomingTasks(tasks).length,
    overdue: getOverdueTasks(tasks).length,
    completed: getCompletedTasks(tasks).length,
  });

  const counts = getCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">
            {pendingTasks.length} pending tasks
          </p>
        </div>
        <Button onClick={onAddTask} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-4">
        <ProgressBar value={progress} label="Overall Progress" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterConfig.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
            {counts[key] > 0 && (
              <Badge
                variant={filter === key ? 'secondary' : 'outline'}
                className="ml-1"
              >
                {counts[key]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8">
          <EmptyState
            icon={<CheckSquare className="w-10 h-10 text-muted-foreground" />}
            title={`No ${filter === 'all' ? '' : filter} tasks`}
            description={
              filter === 'completed'
                ? "Complete some tasks to see them here!"
                : "Add a new task to get started."
            }
            action={
              filter !== 'completed' && (
                <Button onClick={onAddTask} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks
            .sort((a, b) => {
              // Sort by status (pending first), then by priority, then by due date
              if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </div>
      )}
    </div>
  );
}

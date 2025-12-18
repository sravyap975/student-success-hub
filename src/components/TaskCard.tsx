import { Task, Priority, Category } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Calendar, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityVariants: Record<Priority, "priority-high" | "priority-medium" | "priority-low"> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

const categoryVariants: Record<Category, "category-study" | "category-event" | "category-personal"> = {
  study: 'category-study',
  event: 'category-event',
  personal: 'category-personal',
};

const categoryLabels: Record<Category, string> = {
  study: 'Study',
  event: 'Event',
  personal: 'Personal',
};

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const dueDate = parseISO(task.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';
  const isDueToday = isToday(dueDate) && task.status !== 'completed';

  return (
    <div
      className={`group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:shadow-md animate-slide-up ${
        task.status === 'completed' ? 'opacity-60' : ''
      } ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant={categoryVariants[task.category]}>
              {categoryLabels[task.category]}
            </Badge>
            <Badge variant={priorityVariants[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </Badge>
            )}
            {isDueToday && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Due Today
              </Badge>
            )}
          </div>
          
          <h3
            className={`font-medium text-card-foreground mb-1 ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(dueDate, 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(task)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

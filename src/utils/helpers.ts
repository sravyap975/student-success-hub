import { Task, Announcement } from '@/types';
import { isToday, isTomorrow, isPast, isFuture, parseISO, startOfDay } from 'date-fns';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getTodayTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = parseISO(task.dueDate);
    return isToday(dueDate);
  });
};

export const getUpcomingTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = parseISO(task.dueDate);
    return isFuture(startOfDay(dueDate)) && !isToday(dueDate);
  });
};

export const getOverdueTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = parseISO(task.dueDate);
    return isPast(startOfDay(dueDate)) && !isToday(dueDate);
  });
};

export const getCompletedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => task.status === 'completed');
};

export const getUpcomingAnnouncements = (announcements: Announcement[]): Announcement[] => {
  return announcements.filter(announcement => {
    const regDeadline = parseISO(announcement.registrationDeadline);
    return !isPast(startOfDay(regDeadline)) || isToday(regDeadline);
  });
};

export const getMissedAnnouncements = (announcements: Announcement[]): Announcement[] => {
  return announcements.filter(announcement => {
    const regDeadline = parseISO(announcement.registrationDeadline);
    return isPast(startOfDay(regDeadline)) && !isToday(regDeadline);
  });
};

export const getUrgentCount = (tasks: Task[], announcements: Announcement[]): number => {
  const overdueTasks = getOverdueTasks(tasks);
  const todayTasks = getTodayTasks(tasks);
  const urgentAnnouncements = announcements.filter(a => {
    const regDeadline = parseISO(a.registrationDeadline);
    return isToday(regDeadline) || isTomorrow(regDeadline);
  });
  
  return overdueTasks.length + todayTasks.filter(t => t.priority === 'high').length + urgentAnnouncements.length;
};

export const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

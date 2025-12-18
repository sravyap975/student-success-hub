import { useState, useEffect, useCallback } from 'react';
import { Task, Announcement } from '@/types';
import { isToday, isTomorrow, isPast, parseISO } from 'date-fns';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setNotificationsEnabled(result === 'granted');
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    }
  }, [permission]);

  const checkDeadlines = useCallback((tasks: Task[], announcements: Announcement[]) => {
    if (permission !== 'granted') return;

    // Check tasks
    tasks.forEach(task => {
      if (task.status === 'completed') return;
      
      const dueDate = parseISO(task.dueDate);
      
      if (isToday(dueDate)) {
        sendNotification(`Task Due Today: ${task.title}`, {
          body: `Don't forget to complete "${task.title}" today!`,
          tag: `task-${task.id}-today`,
        });
      } else if (isTomorrow(dueDate)) {
        sendNotification(`Task Due Tomorrow: ${task.title}`, {
          body: `"${task.title}" is due tomorrow!`,
          tag: `task-${task.id}-tomorrow`,
        });
      } else if (isPast(dueDate)) {
        sendNotification(`Overdue Task: ${task.title}`, {
          body: `"${task.title}" is past its due date!`,
          tag: `task-${task.id}-overdue`,
        });
      }
    });

    // Check announcements
    announcements.forEach(announcement => {
      const regDeadline = parseISO(announcement.registrationDeadline);
      
      if (isToday(regDeadline)) {
        sendNotification(`Registration Deadline Today: ${announcement.eventName}`, {
          body: `Last day to register for "${announcement.eventName}"!`,
          tag: `announcement-${announcement.id}-today`,
        });
      } else if (isTomorrow(regDeadline)) {
        sendNotification(`Registration Deadline Tomorrow: ${announcement.eventName}`, {
          body: `Register for "${announcement.eventName}" before tomorrow!`,
          tag: `announcement-${announcement.id}-tomorrow`,
        });
      }
    });
  }, [permission, sendNotification]);

  const updateTabTitle = useCallback((urgentCount: number) => {
    if (urgentCount > 0) {
      document.title = `(${urgentCount}) Student Life Manager`;
    } else {
      document.title = 'Student Life Manager';
    }
  }, []);

  return {
    permission,
    notificationsEnabled,
    requestPermission,
    sendNotification,
    checkDeadlines,
    updateTabTitle,
  };
}

export type Priority = 'high' | 'medium' | 'low';
export type Category = 'study' | 'event' | 'personal';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Announcement {
  id: string;
  eventName: string;
  registrationDeadline: string;
  participationDate: string;
  notes: string;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'tasks' | 'announcements' | 'notes';

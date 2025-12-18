import { useState, useEffect } from 'react';
import { Task, Announcement, Note, ViewMode } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNotifications } from '@/hooks/useNotifications';
import { getUrgentCount } from '@/utils/helpers';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { TaskForm } from '@/components/TaskForm';
import { AnnouncementForm } from '@/components/AnnouncementForm';
import { NoteForm } from '@/components/NoteForm';
import { DashboardView } from '@/components/views/DashboardView';
import { TasksView } from '@/components/views/TasksView';
import { AnnouncementsView } from '@/components/views/AnnouncementsView';
import { NotesView } from '@/components/views/NotesView';
import { toast } from 'sonner';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [tasks, setTasks] = useLocalStorage<Task[]>('studyhub-tasks', []);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('studyhub-announcements', []);
  const [notes, setNotes] = useLocalStorage<Note[]>('studyhub-notes', []);

  // Forms
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [announcementFormOpen, setAnnouncementFormOpen] = useState(false);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);

  // Notifications
  const {
    notificationsEnabled,
    requestPermission,
    checkDeadlines,
    updateTabTitle,
  } = useNotifications();

  // Update tab title with urgent count
  useEffect(() => {
    const urgentCount = getUrgentCount(tasks, announcements);
    updateTabTitle(urgentCount);
  }, [tasks, announcements, updateTabTitle]);

  // Check deadlines periodically
  useEffect(() => {
    if (notificationsEnabled) {
      checkDeadlines(tasks, announcements);
      const interval = setInterval(() => {
        checkDeadlines(tasks, announcements);
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [tasks, announcements, notificationsEnabled, checkDeadlines]);

  // Task handlers
  const handleAddTask = () => {
    setEditTask(null);
    setTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setTaskFormOpen(true);
  };

  const handleSubmitTask = (task: Task) => {
    if (editTask) {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
      toast.success('Task updated successfully');
    } else {
      setTasks(prev => [...prev, task]);
      toast.success('Task added successfully');
    }
  };

  const handleToggleTaskComplete = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  // Announcement handlers
  const handleAddAnnouncement = () => {
    setEditAnnouncement(null);
    setAnnouncementFormOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditAnnouncement(announcement);
    setAnnouncementFormOpen(true);
  };

  const handleSubmitAnnouncement = (announcement: Announcement) => {
    if (editAnnouncement) {
      setAnnouncements(prev =>
        prev.map(a => (a.id === announcement.id ? announcement : a))
      );
      toast.success('Event updated successfully');
    } else {
      setAnnouncements(prev => [...prev, announcement]);
      toast.success('Event added successfully');
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('Event deleted');
  };

  // Note handlers
  const handleAddNote = () => {
    setEditNote(null);
    setNoteFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditNote(note);
    setNoteFormOpen(true);
  };

  const handleSubmitNote = (note: Note) => {
    if (editNote) {
      setNotes(prev => prev.map(n => (n.id === note.id ? note : n)));
      toast.success('Note updated successfully');
    } else {
      setNotes(prev => [...prev, note]);
      toast.success('Note added successfully');
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Note deleted');
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notifications enabled! You\'ll be notified of upcoming deadlines.');
    } else {
      toast.error('Notifications were denied. You can enable them in your browser settings.');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleComplete={handleToggleTaskComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsView
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onEdit={handleEditAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        );
      case 'notes':
        return (
          <NotesView
            notes={notes}
            onAddNote={handleAddNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        );
      default:
        return (
          <DashboardView
            tasks={tasks}
            announcements={announcements}
            notes={notes}
            onAddTask={handleAddTask}
            onAddAnnouncement={handleAddAnnouncement}
            onAddNote={handleAddNote}
            onToggleTaskComplete={handleToggleTaskComplete}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onEditAnnouncement={handleEditAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            notificationsEnabled={notificationsEnabled}
            onEnableNotifications={handleEnableNotifications}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-20 pb-24 lg:p-8 lg:pt-8 max-w-5xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Forms */}
      <TaskForm
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        onSubmit={handleSubmitTask}
        editTask={editTask}
      />
      <AnnouncementForm
        open={announcementFormOpen}
        onOpenChange={setAnnouncementFormOpen}
        onSubmit={handleSubmitAnnouncement}
        editAnnouncement={editAnnouncement}
      />
      <NoteForm
        open={noteFormOpen}
        onOpenChange={setNoteFormOpen}
        onSubmit={handleSubmitNote}
        editNote={editNote}
      />
    </div>
  );
};

export default Index;

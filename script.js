// ===== DATA MANAGEMENT =====
const STORAGE_KEYS = {
  TASKS: 'studyhub-tasks',
  EVENTS: 'studyhub-events',
  NOTES: 'studyhub-notes',
  THEME: 'studyhub-theme',
  NOTIFICATIONS: 'studyhub-notifications'
};

// State
let tasks = [];
let events = [];
let notes = [];
let currentTaskFilter = 'all';
let currentEventFilter = 'all';
let notificationsEnabled = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initTheme();
  initNavigation();
  initNotifications();
  setDefaultDates();
  updateGreeting();
  renderAll();
  checkDeadlines();
  
  // Check deadlines every minute
  setInterval(checkDeadlines, 60000);
});

// ===== STORAGE FUNCTIONS =====
function loadData() {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
  events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
  notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
  notificationsEnabled = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) === 'true';
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

// ===== THEME MANAGEMENT =====
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark');
  }
  
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
}

// ===== NAVIGATION =====
function initNavigation() {
  // Desktop nav
  document.querySelectorAll('.sidebar .nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  
  // Mobile nav
  document.querySelectorAll('.mobile-nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  
  // Task filters
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTaskFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasksList();
    });
  });
  
  // Event filters
  document.querySelectorAll('.filter-btn[data-event-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentEventFilter = btn.dataset.eventFilter;
      document.querySelectorAll('.filter-btn[data-event-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEventsList();
    });
  });
}

function switchView(viewName) {
  // Update active states
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  document.querySelectorAll('.mobile-nav-btn[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  
  // Show correct view
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.getElementById(`${viewName}View`).classList.add('active');
}

// ===== NOTIFICATIONS =====
function initNotifications() {
  const banner = document.getElementById('notificationBanner');
  const enableBtn = document.getElementById('enableNotifications');
  
  if (notificationsEnabled && Notification.permission === 'granted') {
    banner.classList.add('hidden');
  }
  
  enableBtn.addEventListener('click', requestNotificationPermission);
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Your browser does not support notifications', 'error');
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      notificationsEnabled = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, 'true');
      document.getElementById('notificationBanner').classList.add('hidden');
      showToast('Notifications enabled! You\'ll be notified of upcoming deadlines.', 'success');
    } else {
      showToast('Notifications were denied. Enable them in browser settings.', 'error');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

function sendNotification(title, body) {
  if (notificationsEnabled && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

function checkDeadlines() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let urgentCount = 0;
  
  // Check tasks
  tasks.forEach(task => {
    if (task.status === 'completed') return;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) {
      urgentCount++;
      if (task.priority === 'high') {
        sendNotification(`Task Due Today: ${task.title}`, 'Don\'t forget to complete this high priority task!');
      }
    } else if (dueDate < today) {
      urgentCount++;
    }
  });
  
  // Check events
  events.forEach(event => {
    const regDeadline = new Date(event.registrationDeadline);
    regDeadline.setHours(0, 0, 0, 0);
    
    if (regDeadline.getTime() === today.getTime()) {
      urgentCount++;
      sendNotification(`Registration Deadline Today: ${event.eventName}`, 'Last day to register!');
    } else if (regDeadline.getTime() === tomorrow.getTime()) {
      sendNotification(`Registration Deadline Tomorrow: ${event.eventName}`, 'Register before tomorrow!');
    }
  });
  
  // Update tab title
  if (urgentCount > 0) {
    document.title = `(${urgentCount}) StudyHub - Student Life Manager`;
  } else {
    document.title = 'StudyHub - Student Life Manager';
  }
}

// ===== DATE HELPERS =====
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('taskDueDate').value = today;
  document.getElementById('registrationDeadline').value = today;
  document.getElementById('participationDate').value = today;
  document.getElementById('noteDate').value = today;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isOverdue(dateString) {
  const date = new Date(dateString);
  date.setHours(23, 59, 59, 999);
  return date < new Date() && !isToday(dateString);
}

function isUpcoming(dateString) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

function isTomorrow(dateString) {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';
  
  document.getElementById('greeting').textContent = `${greeting}, Student!`;
  document.getElementById('currentDate').textContent = formatFullDate(new Date().toISOString());
}

// ===== TASK FUNCTIONS =====
function openTaskModal(taskId = null) {
  const modal = document.getElementById('taskModal');
  const title = document.getElementById('taskModalTitle');
  const submitBtn = document.getElementById('taskSubmitBtn');
  const form = document.getElementById('taskForm');
  
  form.reset();
  setDefaultDates();
  
  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskCategory').value = task.category;
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskDueDate').value = task.dueDate;
      title.textContent = 'Edit Task';
      submitBtn.textContent = 'Update Task';
    }
  } else {
    document.getElementById('taskId').value = '';
    title.textContent = 'Add New Task';
    submitBtn.textContent = 'Add Task';
  }
  
  modal.classList.add('active');
  document.getElementById('taskTitle').focus();
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('active');
}

function handleTaskSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('taskId').value;
  const taskData = {
    id: id || generateId(),
    title: document.getElementById('taskTitle').value.trim(),
    category: document.getElementById('taskCategory').value,
    priority: document.getElementById('taskPriority').value,
    dueDate: document.getElementById('taskDueDate').value,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  if (id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      taskData.status = tasks[index].status;
      taskData.createdAt = tasks[index].createdAt;
      tasks[index] = taskData;
      showToast('Task updated successfully', 'success');
    }
  } else {
    tasks.push(taskData);
    showToast('Task added successfully', 'success');
  }
  
  saveTasks();
  closeTaskModal();
  renderAll();
}

function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    saveTasks();
    renderAll();
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  showToast('Task deleted', 'success');
  renderAll();
}

// ===== EVENT FUNCTIONS =====
function openEventModal(eventId = null) {
  const modal = document.getElementById('eventModal');
  const title = document.getElementById('eventModalTitle');
  const submitBtn = document.getElementById('eventSubmitBtn');
  const form = document.getElementById('eventForm');
  
  form.reset();
  setDefaultDates();
  
  if (eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) {
      document.getElementById('eventId').value = event.id;
      document.getElementById('eventName').value = event.eventName;
      document.getElementById('registrationDeadline').value = event.registrationDeadline;
      document.getElementById('participationDate').value = event.participationDate;
      document.getElementById('eventNotes').value = event.notes || '';
      title.textContent = 'Edit Event';
      submitBtn.textContent = 'Update Event';
    }
  } else {
    document.getElementById('eventId').value = '';
    title.textContent = 'Add New Event';
    submitBtn.textContent = 'Add Event';
  }
  
  modal.classList.add('active');
  document.getElementById('eventName').focus();
}

function closeEventModal() {
  document.getElementById('eventModal').classList.remove('active');
}

function handleEventSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('eventId').value;
  const eventData = {
    id: id || generateId(),
    eventName: document.getElementById('eventName').value.trim(),
    registrationDeadline: document.getElementById('registrationDeadline').value,
    participationDate: document.getElementById('participationDate').value,
    notes: document.getElementById('eventNotes').value.trim(),
    createdAt: new Date().toISOString()
  };
  
  if (id) {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      eventData.createdAt = events[index].createdAt;
      events[index] = eventData;
      showToast('Event updated successfully', 'success');
    }
  } else {
    events.push(eventData);
    showToast('Event added successfully', 'success');
  }
  
  saveEvents();
  closeEventModal();
  renderAll();
}

function deleteEvent(eventId) {
  events = events.filter(e => e.id !== eventId);
  saveEvents();
  showToast('Event deleted', 'success');
  renderAll();
}

// ===== NOTE FUNCTIONS =====
function openNoteModal(noteId = null) {
  const modal = document.getElementById('noteModal');
  const title = document.getElementById('noteModalTitle');
  const submitBtn = document.getElementById('noteSubmitBtn');
  const form = document.getElementById('noteForm');
  
  form.reset();
  setDefaultDates();
  
  if (noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      document.getElementById('noteId').value = note.id;
      document.getElementById('noteDate').value = note.date;
      document.getElementById('noteContent').value = note.content;
      title.textContent = 'Edit Note';
      submitBtn.textContent = 'Update Note';
    }
  } else {
    document.getElementById('noteId').value = '';
    title.textContent = 'Add New Note';
    submitBtn.textContent = 'Add Note';
  }
  
  modal.classList.add('active');
  document.getElementById('noteContent').focus();
}

function closeNoteModal() {
  document.getElementById('noteModal').classList.remove('active');
}

function handleNoteSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('noteId').value;
  const noteData = {
    id: id || generateId(),
    date: document.getElementById('noteDate').value,
    content: document.getElementById('noteContent').value.trim(),
    createdAt: new Date().toISOString()
  };
  
  if (id) {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      noteData.createdAt = notes[index].createdAt;
      notes[index] = noteData;
      showToast('Note updated successfully', 'success');
    }
  } else {
    notes.push(noteData);
    showToast('Note added successfully', 'success');
  }
  
  saveNotes();
  closeNoteModal();
  renderAll();
}

function deleteNote(noteId) {
  notes = notes.filter(n => n.id !== noteId);
  saveNotes();
  showToast('Note deleted', 'success');
  renderAll();
}

// ===== RENDER FUNCTIONS =====
function renderAll() {
  renderDashboard();
  renderTasksList();
  renderEventsList();
  renderNotesList();
  updateFilterCounts();
  checkDeadlines();
}

function renderDashboard() {
  // Stats
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => t.status === 'pending' && isOverdue(t.dueDate));
  const upcomingEvents = events.filter(e => !isOverdue(e.registrationDeadline));
  
  document.getElementById('pendingCount').textContent = pendingTasks.length;
  document.getElementById('completedCount').textContent = completedTasks.length;
  document.getElementById('overdueCount').textContent = overdueTasks.length;
  document.getElementById('eventsCount').textContent = upcomingEvents.length;
  
  // Progress
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  document.getElementById('progressPercent').textContent = `${progress}%`;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('tasksProgressPercent').textContent = `${progress}%`;
  document.getElementById('tasksProgressFill').style.width = `${progress}%`;
  
  // Pending tasks text
  document.getElementById('pendingTasksText').textContent = `${pendingTasks.length} pending tasks`;
  
  // Overdue alert
  const overdueAlert = document.getElementById('overdueAlert');
  const overdueAlertList = document.getElementById('overdueTasksList');
  if (overdueTasks.length > 0) {
    overdueAlert.classList.remove('hidden');
    document.getElementById('overdueAlertCount').textContent = overdueTasks.length;
    overdueAlertList.innerHTML = overdueTasks.slice(0, 3).map(task => renderTaskCard(task)).join('');
  } else {
    overdueAlert.classList.add('hidden');
  }
  
  // Today's tasks
  const todayTasks = tasks.filter(t => t.status === 'pending' && isToday(t.dueDate));
  document.getElementById('todayTasksCount').textContent = todayTasks.length;
  const todayTasksList = document.getElementById('todayTasksList');
  
  if (todayTasks.length > 0) {
    todayTasksList.innerHTML = todayTasks.map(task => renderTaskCard(task)).join('');
  } else {
    todayTasksList.innerHTML = renderEmptyState('tasks', 'No tasks for today', 'You\'re all caught up! Add a new task to stay organized.');
  }
  
  // Upcoming events
  document.getElementById('upcomingEventsCount').textContent = upcomingEvents.length;
  const upcomingEventsList = document.getElementById('upcomingEventsList');
  
  if (upcomingEvents.length > 0) {
    upcomingEventsList.innerHTML = upcomingEvents.slice(0, 3).map(event => renderEventCard(event)).join('');
  } else {
    upcomingEventsList.innerHTML = renderEmptyState('events', 'No upcoming events', 'Add hackathons, workshops, or exams to never miss an opportunity.');
  }
}

function renderTasksList() {
  let filteredTasks = [...tasks];
  
  switch (currentTaskFilter) {
    case 'today':
      filteredTasks = tasks.filter(t => t.status === 'pending' && isToday(t.dueDate));
      break;
    case 'upcoming':
      filteredTasks = tasks.filter(t => t.status === 'pending' && isUpcoming(t.dueDate));
      break;
    case 'overdue':
      filteredTasks = tasks.filter(t => t.status === 'pending' && isOverdue(t.dueDate));
      break;
    case 'completed':
      filteredTasks = tasks.filter(t => t.status === 'completed');
      break;
  }
  
  // Sort tasks
  filteredTasks.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  const tasksList = document.getElementById('allTasksList');
  
  if (filteredTasks.length > 0) {
    tasksList.innerHTML = filteredTasks.map(task => renderTaskCard(task)).join('');
  } else {
    const emptyMessage = currentTaskFilter === 'completed' 
      ? 'Complete some tasks to see them here!'
      : 'Add a new task to get started.';
    tasksList.innerHTML = renderEmptyState('tasks', `No ${currentTaskFilter === 'all' ? '' : currentTaskFilter + ' '}tasks`, emptyMessage);
  }
}

function renderEventsList() {
  let filteredEvents = [...events];
  
  switch (currentEventFilter) {
    case 'upcoming':
      filteredEvents = events.filter(e => !isOverdue(e.registrationDeadline));
      break;
    case 'missed':
      filteredEvents = events.filter(e => isOverdue(e.registrationDeadline));
      break;
  }
  
  // Sort by registration deadline
  filteredEvents.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
  
  const eventsList = document.getElementById('allEventsList');
  
  if (filteredEvents.length > 0) {
    eventsList.innerHTML = filteredEvents.map(event => renderEventCard(event)).join('');
  } else {
    const emptyTitle = currentEventFilter === 'missed' ? 'No missed registrations' : `No ${currentEventFilter === 'all' ? '' : currentEventFilter + ' '}events`;
    const emptyMessage = currentEventFilter === 'missed'
      ? 'Great job! You haven\'t missed any registration deadlines.'
      : 'Add upcoming hackathons, workshops, or exams to stay on track.';
    eventsList.innerHTML = `<div class="empty-state full-width">${renderEmptyState('events', emptyTitle, emptyMessage)}</div>`;
  }
}

function renderNotesList() {
  const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const notesContainer = document.getElementById('allNotesList');
  
  if (sortedNotes.length > 0) {
    // Group notes by date category
    const groups = groupNotesByDate(sortedNotes);
    notesContainer.innerHTML = groups.map(group => `
      <div class="notes-group">
        <h3>${group.label}</h3>
        <div class="notes-grid">
          ${group.notes.map(note => renderNoteCard(note)).join('')}
        </div>
      </div>
    `).join('');
  } else {
    notesContainer.innerHTML = renderEmptyState('notes', 'No notes yet', 'Start capturing your thoughts, reminders, and daily observations.');
  }
}

function groupNotesByDate(notes) {
  const groups = [];
  const today = [];
  const yesterday = [];
  const thisWeek = [];
  const older = [];
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  
  notes.forEach(note => {
    const noteDate = new Date(note.date);
    if (noteDate >= todayStart) {
      today.push(note);
    } else if (noteDate >= yesterdayStart) {
      yesterday.push(note);
    } else if (noteDate >= weekStart) {
      thisWeek.push(note);
    } else {
      older.push(note);
    }
  });
  
  if (today.length > 0) groups.push({ label: 'Today', notes: today });
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', notes: yesterday });
  if (thisWeek.length > 0) groups.push({ label: 'This Week', notes: thisWeek });
  if (older.length > 0) groups.push({ label: 'Older', notes: older });
  
  return groups;
}

function updateFilterCounts() {
  // Task filters
  document.getElementById('filterAllCount').textContent = tasks.length;
  document.getElementById('filterTodayCount').textContent = tasks.filter(t => t.status === 'pending' && isToday(t.dueDate)).length;
  document.getElementById('filterUpcomingCount').textContent = tasks.filter(t => t.status === 'pending' && isUpcoming(t.dueDate)).length;
  document.getElementById('filterOverdueCount').textContent = tasks.filter(t => t.status === 'pending' && isOverdue(t.dueDate)).length;
  document.getElementById('filterCompletedCount').textContent = tasks.filter(t => t.status === 'completed').length;
  
  // Event filters
  document.getElementById('eventFilterAllCount').textContent = events.length;
  document.getElementById('eventFilterUpcomingCount').textContent = events.filter(e => !isOverdue(e.registrationDeadline)).length;
  document.getElementById('eventFilterMissedCount').textContent = events.filter(e => isOverdue(e.registrationDeadline)).length;
}

// ===== CARD RENDERERS =====
function renderTaskCard(task) {
  const isTaskOverdue = task.status === 'pending' && isOverdue(task.dueDate);
  const isTaskToday = task.status === 'pending' && isToday(task.dueDate);
  
  const categoryLabels = { study: 'Study', event: 'Event', personal: 'Personal' };
  const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };
  
  let statusBadges = '';
  if (isTaskOverdue) {
    statusBadges += `<span class="badge badge-destructive">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Overdue
    </span>`;
  }
  if (isTaskToday && task.status === 'pending') {
    statusBadges += `<span class="badge badge-warning">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Due Today
    </span>`;
  }
  
  return `
    <div class="task-card ${task.status === 'completed' ? 'completed' : ''} ${isTaskOverdue ? 'overdue' : ''}">
      <button class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </button>
      <div class="task-content">
        <div class="task-badges">
          <span class="badge badge-category-${task.category}">${categoryLabels[task.category]}</span>
          <span class="badge badge-priority-${task.priority}">${priorityLabels[task.priority]}</span>
          ${statusBadges}
        </div>
        <h4 class="task-title">${escapeHtml(task.title)}</h4>
        <div class="task-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
            <path d="M16 2v4M8 2v4M3 10h18"></path>
          </svg>
          ${formatDate(task.dueDate)}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-ghost" onclick="openTaskModal('${task.id}')" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn btn-destructive" onclick="deleteTask('${task.id}')" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function renderEventCard(event) {
  const isMissed = isOverdue(event.registrationDeadline);
  const isDeadlineToday = isToday(event.registrationDeadline);
  const isDeadlineTomorrow = isTomorrow(event.registrationDeadline);
  
  let statusBadges = '<span class="badge badge-category-event">Event</span>';
  if (isMissed) {
    statusBadges += `<span class="badge badge-destructive">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Registration Closed
    </span>`;
  }
  if (isDeadlineToday) {
    statusBadges += `<span class="badge badge-warning">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      Register Today!
    </span>`;
  }
  if (isDeadlineTomorrow && !isMissed) {
    statusBadges += '<span class="badge badge-info">Deadline Tomorrow</span>';
  }
  
  return `
    <div class="event-card ${isMissed ? 'missed' : ''} ${isDeadlineToday ? 'deadline-today' : ''}">
      <div class="event-header">
        <div class="event-badges">${statusBadges}</div>
        <div class="event-actions">
          <button class="btn btn-ghost" onclick="openEventModal('${event.id}')" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn btn-destructive" onclick="deleteEvent('${event.id}')" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <h4 class="event-title">${escapeHtml(event.eventName)}</h4>
      <div class="event-dates">
        <div class="event-date-row warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
            <path d="M16 2v4M8 2v4M3 10h18"></path>
          </svg>
          <span>Register by: <strong class="${isMissed ? 'missed' : ''}">${formatDate(event.registrationDeadline)}</strong></span>
        </div>
        <div class="event-date-row primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <span>Event: <strong>${formatDate(event.participationDate)}</strong></span>
        </div>
      </div>
      ${event.notes ? `<div class="event-notes">${escapeHtml(event.notes)}</div>` : ''}
    </div>
  `;
}

function renderNoteCard(note) {
  return `
    <div class="note-card">
      <div class="note-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
        </svg>
      </div>
      <div class="note-content">
        <p class="note-date">${formatFullDate(note.date)}</p>
        <p class="note-text">${escapeHtml(note.content)}</p>
      </div>
      <div class="note-actions">
        <button class="btn btn-ghost" onclick="openNoteModal('${note.id}')" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn btn-destructive" onclick="deleteNote('${note.id}')" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function renderEmptyState(type, title, description) {
  const icons = {
    tasks: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M9 11l3 3L22 4"></path>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
    </svg>`,
    events: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
      <path d="M16 2v4M8 2v4M3 10h18"></path>
    </svg>`,
    notes: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"></path>
      <polyline points="14,2 14,8 20,8"></polyline>
    </svg>`
  };
  
  const actions = {
    tasks: `<button class="btn btn-outline btn-sm" onclick="openTaskModal()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Add Task
    </button>`,
    events: `<button class="btn btn-outline btn-sm" onclick="openEventModal()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Add Event
    </button>`,
    notes: `<button class="btn btn-outline btn-sm" onclick="openNoteModal()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Add Note
    </button>`
  };
  
  return `
    <div class="empty-state">
      <div class="empty-icon">${icons[type]}</div>
      <h4>${title}</h4>
      <p>${description}</p>
      ${actions[type]}
    </div>
  `;
}

// ===== UTILITY FUNCTIONS =====
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-message">${escapeHtml(message)}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== MODAL CLOSE ON ESCAPE & OUTSIDE CLICK =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTaskModal();
    closeEventModal();
    closeNoteModal();
  }
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeTaskModal();
      closeEventModal();
      closeNoteModal();
    }
  });
});

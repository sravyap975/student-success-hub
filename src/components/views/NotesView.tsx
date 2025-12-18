import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/NoteCard';
import { EmptyState } from '@/components/EmptyState';
import { Plus, StickyNote } from 'lucide-react';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

interface NotesViewProps {
  notes: Note[];
  onAddNote: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

interface GroupedNotes {
  label: string;
  notes: Note[];
}

function groupNotesByDate(notes: Note[]): GroupedNotes[] {
  const groups: GroupedNotes[] = [];
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today: Note[] = [];
  const yesterday: Note[] = [];
  const thisWeek: Note[] = [];
  const thisMonth: Note[] = [];
  const older: Note[] = [];

  sortedNotes.forEach(note => {
    const date = parseISO(note.date);
    if (isToday(date)) {
      today.push(note);
    } else if (isYesterday(date)) {
      yesterday.push(note);
    } else if (isThisWeek(date)) {
      thisWeek.push(note);
    } else if (isThisMonth(date)) {
      thisMonth.push(note);
    } else {
      older.push(note);
    }
  });

  if (today.length > 0) groups.push({ label: 'Today', notes: today });
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', notes: yesterday });
  if (thisWeek.length > 0) groups.push({ label: 'This Week', notes: thisWeek });
  if (thisMonth.length > 0) groups.push({ label: 'This Month', notes: thisMonth });
  if (older.length > 0) groups.push({ label: 'Older', notes: older });

  return groups;
}

export function NotesView({ notes, onAddNote, onEdit, onDelete }: NotesViewProps) {
  const groupedNotes = groupNotesByDate(notes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Daily Notes</h1>
          <p className="text-muted-foreground">
            Capture thoughts, reminders, and ideas
          </p>
        </div>
        <Button onClick={onAddNote} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8">
          <EmptyState
            icon={<StickyNote className="w-10 h-10 text-muted-foreground" />}
            title="No notes yet"
            description="Start capturing your thoughts, reminders, and daily observations."
            action={
              <Button onClick={onAddNote} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {groupedNotes.map(group => (
            <div key={group.label} className="space-y-4">
              <h2 className="font-display font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                {group.label}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {group.notes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

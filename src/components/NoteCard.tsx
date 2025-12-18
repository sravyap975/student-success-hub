import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Trash2, Edit2, StickyNote } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:shadow-md animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <StickyNote className="w-4 h-4 text-accent-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-2">
            {format(parseISO(note.date), 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-card-foreground whitespace-pre-wrap">{note.content}</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(note)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

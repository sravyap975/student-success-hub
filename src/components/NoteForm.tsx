import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateId, getTodayDateString } from '@/utils/helpers';

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: Note) => void;
  editNote?: Note | null;
}

export function NoteForm({ open, onOpenChange, onSubmit, editNote }: NoteFormProps) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(getTodayDateString());

  useEffect(() => {
    if (editNote) {
      setContent(editNote.content);
      setDate(editNote.date);
    } else {
      setContent('');
      setDate(getTodayDateString());
    }
  }, [editNote, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const note: Note = {
      id: editNote?.id || generateId(),
      content: content.trim(),
      date,
      createdAt: editNote?.createdAt || new Date().toISOString(),
    };

    onSubmit(note);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Note</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts, reminders, or anything you want to remember..."
                rows={5}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim()}>
              {editNote ? 'Update' : 'Add'} Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

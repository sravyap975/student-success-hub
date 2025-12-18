import { useState, useEffect } from 'react';
import { Announcement } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateId, getTodayDateString } from '@/utils/helpers';

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (announcement: Announcement) => void;
  editAnnouncement?: Announcement | null;
}

export function AnnouncementForm({ open, onOpenChange, onSubmit, editAnnouncement }: AnnouncementFormProps) {
  const [eventName, setEventName] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState(getTodayDateString());
  const [participationDate, setParticipationDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editAnnouncement) {
      setEventName(editAnnouncement.eventName);
      setRegistrationDeadline(editAnnouncement.registrationDeadline);
      setParticipationDate(editAnnouncement.participationDate);
      setNotes(editAnnouncement.notes);
    } else {
      setEventName('');
      setRegistrationDeadline(getTodayDateString());
      setParticipationDate(getTodayDateString());
      setNotes('');
    }
  }, [editAnnouncement, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    const announcement: Announcement = {
      id: editAnnouncement?.id || generateId(),
      eventName: eventName.trim(),
      registrationDeadline,
      participationDate,
      notes: notes.trim(),
      createdAt: editAnnouncement?.createdAt || new Date().toISOString(),
    };

    onSubmit(announcement);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editAnnouncement ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Hackathon 2024, Workshop on AI..."
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regDeadline">Registration Deadline</Label>
                <Input
                  id="regDeadline"
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="participationDate">Event Date</Label>
                <Input
                  id="participationDate"
                  type="date"
                  value={participationDate}
                  onChange={(e) => setParticipationDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about the event..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!eventName.trim()}>
              {editAnnouncement ? 'Update' : 'Add'} Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

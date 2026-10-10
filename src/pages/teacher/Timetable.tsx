import { useState, useEffect } from 'react';
import { Clock, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTimetable, TimetableEntry } from '@/hooks/useTimetable';
import { Skeleton } from '@/components/ui/skeleton';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '12:15 - 01:15', '02:00 - 03:00', '03:00 - 04:00'];

const Timetable = () => {
  const { timetable, updateTimetable, isLoading } = useTimetable();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTimetable, setEditedTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => { setEditedTimetable([...timetable]); }, [timetable]);

  const getEntry = (day: string, time: string, source: TimetableEntry[]) => source.find((e) => e.day === day && e.time === time);
  const handleEdit = (day: string, time: string, field: 'subject' | 'teacher' | 'room', value: string) => {
    setEditedTimetable((prev) => { const i = prev.findIndex((e) => e.day === day && e.time === time); if (i >= 0) { const u = [...prev]; u[i] = { ...u[i], [field]: value }; return u; } return prev; });
  };
  const handleSave = () => { updateTimetable(editedTimetable); setIsEditing(false); };
  const handleCancel = () => { setEditedTimetable([...timetable]); setIsEditing(false); };

  if (isLoading) return <DashboardLayout><Skeleton className="h-96 w-full" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-foreground">Timetable</h1><p className="text-muted-foreground mt-1">Manage class schedule</p></div>
          <div className="flex gap-2">{isEditing ? <><Button variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-2" />Cancel</Button><Button variant="gradient" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button></> : <Button variant="gradient" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>}</div>
        </div>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Weekly Schedule</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Time</TableHead>{days.map((d) => <TableHead key={d} className="text-center">{d}</TableHead>)}</TableRow></TableHeader><TableBody>
          {times.map((time) => <TableRow key={time}><TableCell className="font-medium text-sm">{time}</TableCell>{days.map((day) => {
            const entry = getEntry(day, time, isEditing ? editedTimetable : timetable);
            if (entry?.subject === 'Break') return <TableCell key={day} className="text-center bg-muted/50"><span className="text-muted-foreground">Break</span></TableCell>;
            return <TableCell key={day} className="p-2">{isEditing ? <div className="space-y-1"><Input placeholder="Subject" value={entry?.subject || ''} onChange={(e) => handleEdit(day, time, 'subject', e.target.value)} className="h-8 text-xs" /><Input placeholder="Teacher" value={entry?.teacher || ''} onChange={(e) => handleEdit(day, time, 'teacher', e.target.value)} className="h-8 text-xs" /><Input placeholder="Room" value={entry?.room || ''} onChange={(e) => handleEdit(day, time, 'room', e.target.value)} className="h-8 text-xs" /></div> : <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/10"><p className="font-medium text-sm">{entry?.subject}</p><p className="text-xs text-muted-foreground">{entry?.teacher}</p><p className="text-xs text-muted-foreground">{entry?.room}</p></div>}</TableCell>;
          })}</TableRow>)}
        </TableBody></Table></div></CardContent></Card>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;

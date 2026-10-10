import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, Clock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuthContext } from '@/contexts/AuthContext';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Attendance = () => {
  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, bulkMarkAttendance, isLoading: attendanceLoading } = useAttendance();
  const { profile } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState('Data Structures');
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const subjects = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Web Development'];
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    const dayAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
    attendance.filter((a) => a.date === dateStr && a.subject === selectedSubject).forEach((a) => { dayAttendance[a.student_id] = a.status; });
    setLocalAttendance(dayAttendance);
  }, [dateStr, selectedSubject, attendance]);

  const handleStatusChange = (rollNumber: string, status: 'present' | 'absent' | 'late') => setLocalAttendance((prev) => ({ ...prev, [rollNumber]: status }));
  const handleSaveAttendance = () => {
    const records = Object.entries(localAttendance).map(([student_id, status]) => ({ student_id, date: dateStr, status, subject: selectedSubject, marked_by: profile?.email || '' }));
    if (records.length > 0) bulkMarkAttendance(records);
  };
  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    const allMarked: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach((s) => { allMarked[s.roll_number] = status; });
    setLocalAttendance(allMarked);
  };

  const stats = useMemo(() => {
    const values = Object.values(localAttendance);
    return { present: values.filter((v) => v === 'present').length, absent: values.filter((v) => v === 'absent').length, late: values.filter((v) => v === 'late').length, unmarked: students.length - values.length };
  }, [localAttendance, students]);

  if (studentsLoading || attendanceLoading) return <DashboardLayout><Skeleton className="h-64 w-full" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1><p className="text-muted-foreground mt-1">Record daily attendance</p></div>
        <Card><CardContent className="p-4"><div className="flex flex-wrap gap-4">
          <Popover><PopoverTrigger asChild><Button variant="outline" className="w-[240px] justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(selectedDate, 'PPP')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} /></PopoverContent></Popover>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent>{subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <div className="flex-1" /><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}><Check className="w-4 h-4 mr-1" />All Present</Button><Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}><X className="w-4 h-4 mr-1" />All Absent</Button></div>
        </div></CardContent></Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-success/10"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">{stats.present}</p><p className="text-sm text-success/80">Present</p></CardContent></Card>
          <Card className="bg-destructive/10"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-destructive">{stats.absent}</p><p className="text-sm text-destructive/80">Absent</p></CardContent></Card>
          <Card className="bg-warning/10"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{stats.late}</p><p className="text-sm text-warning/80">Late</p></CardContent></Card>
          <Card className="bg-muted"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-muted-foreground">{stats.unmarked}</p><p className="text-sm text-muted-foreground">Unmarked</p></CardContent></Card>
        </div>
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Student Attendance</CardTitle><Button variant="gradient" onClick={handleSaveAttendance}><Save className="w-4 h-4 mr-2" />Save</Button></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Roll Number</TableHead><TableHead>Name</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader><TableBody>
          {students.map((student) => {
            const status = localAttendance[student.roll_number];
            return (<TableRow key={student.id}><TableCell className="font-medium">{student.roll_number}</TableCell><TableCell>{student.name}</TableCell><TableCell className="text-center"><span className={cn('px-3 py-1 rounded-full text-xs font-medium', status === 'present' ? 'bg-success text-success-foreground' : status === 'absent' ? 'bg-destructive text-destructive-foreground' : status === 'late' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground')}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not Marked'}</span></TableCell><TableCell><div className="flex justify-center gap-2"><Button size="sm" variant={status === 'present' ? 'default' : 'outline'} className={status === 'present' ? 'bg-success hover:bg-success/90' : ''} onClick={() => handleStatusChange(student.roll_number, 'present')}><Check className="w-4 h-4" /></Button><Button size="sm" variant={status === 'absent' ? 'default' : 'outline'} className={status === 'absent' ? 'bg-destructive hover:bg-destructive/90' : ''} onClick={() => handleStatusChange(student.roll_number, 'absent')}><X className="w-4 h-4" /></Button><Button size="sm" variant={status === 'late' ? 'default' : 'outline'} className={status === 'late' ? 'bg-warning hover:bg-warning/90' : ''} onClick={() => handleStatusChange(student.roll_number, 'late')}><Clock className="w-4 h-4" /></Button></div></TableCell></TableRow>);
          })}
        </TableBody></Table></CardContent></Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;

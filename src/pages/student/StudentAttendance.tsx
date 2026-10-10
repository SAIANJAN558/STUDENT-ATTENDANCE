import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend } from 'date-fns';
import { BarChart3, Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const StudentAttendance = () => {
  const { profile, currentUser } = useAuthContext();
  const { attendance, isLoading } = useAttendance();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState('all');

  const rollNumber = profile?.roll_number || currentUser?.rollNumber || '';

  // Filter attendance for current student
  const attendanceRecords = useMemo(() => {
    return attendance.filter((a) => a.student_id === rollNumber);
  }, [attendance, rollNumber]);

  // Get unique subjects from records
  const subjects = useMemo(() => {
    const uniqueSubjects = [...new Set(attendanceRecords.map((r) => r.subject).filter(Boolean))];
    return ['all', ...uniqueSubjects];
  }, [attendanceRecords]);

  const filteredRecords = useMemo(() => {
    if (selectedSubject === 'all') return attendanceRecords;
    return attendanceRecords.filter((r) => r.subject === selectedSubject);
  }, [attendanceRecords, selectedSubject]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const monthStats = useMemo(() => {
    const monthRecords = filteredRecords.filter((r) => {
      const date = new Date(r.date);
      return isSameMonth(date, currentMonth);
    });

    const total = monthRecords.length;
    const present = monthRecords.filter((r) => r.status === 'present').length;
    const absent = monthRecords.filter((r) => r.status === 'absent').length;
    const late = monthRecords.filter((r) => r.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, percentage };
  }, [filteredRecords, currentMonth]);

  // Subject-wise breakdown
  const subjectStats = useMemo(() => {
    const stats: Record<string, { present: number; total: number }> = {};
    
    attendanceRecords.forEach((record) => {
      const subject = record.subject || 'Unknown';
      if (!stats[subject]) {
        stats[subject] = { present: 0, total: 0 };
      }
      stats[subject].total++;
      if (record.status === 'present') {
        stats[subject].present++;
      }
    });

    return Object.entries(stats).map(([subject, data]) => ({
      subject,
      attendance: Math.round((data.present / data.total) * 100),
      present: data.present,
      total: data.total,
    }));
  }, [attendanceRecords]);

  const getAttendanceForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredRecords.find((r) => r.date === dateStr);
  };

  const pieData = [
    { name: 'Present', value: monthStats.present, color: 'hsl(142, 76%, 36%)' },
    { name: 'Absent', value: monthStats.absent, color: 'hsl(0, 84%, 60%)' },
    { name: 'Late', value: monthStats.late, color: 'hsl(38, 92%, 50%)' },
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
            <p className="text-muted-foreground mt-1">View your attendance records and statistics</p>
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold text-success">{monthStats.present}</p>
                  <p className="text-sm text-success/80">Present</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-destructive">{monthStats.absent}</p>
                  <p className="text-sm text-destructive/80">Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-warning">{monthStats.late}</p>
                  <p className="text-sm text-warning/80">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-primary">{monthStats.percentage}%</p>
                  <p className="text-sm text-primary/80">Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: monthDays[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {monthDays.map((day) => {
                const attendance = getAttendanceForDay(day);
                const isWeekendDay = isWeekend(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors',
                      isWeekendDay && 'bg-muted/50 text-muted-foreground',
                      !isWeekendDay && !attendance && 'bg-muted/30',
                      attendance?.status === 'present' && 'bg-success/20 text-success',
                      attendance?.status === 'absent' && 'bg-destructive/20 text-destructive',
                      attendance?.status === 'late' && 'bg-warning/20 text-warning'
                    )}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    {attendance && (
                      <span className="text-[10px] mt-0.5">
                        {attendance.status === 'present' ? 'P' : attendance.status === 'absent' ? 'A' : 'L'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/20" />
                <span className="text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/20" />
                <span className="text-muted-foreground">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning/20" />
                <span className="text-muted-foreground">Late</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Subject-wise Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Subject-wise Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {subjectStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="subject" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Attendance']}
                      />
                      <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No attendance data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Monthly Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {monthStats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No attendance data for this month</p>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;

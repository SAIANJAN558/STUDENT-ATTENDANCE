import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Clock, MessageSquare, TrendingUp, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { useMessages } from '@/hooks/useMessages';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const StudentDashboard = () => {
  const { currentUser, profile } = useAuthContext();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { getStudentMessages, isLoading: messagesLoading } = useMessages();

  const rollNumber = profile?.roll_number || currentUser?.rollNumber || '';
  
  // Filter attendance for current student
  const attendanceRecords = useMemo(() => {
    return attendance.filter((a) => a.student_id === rollNumber);
  }, [attendance, rollNumber]);

  // Get messages for current student
  const messages = useMemo(() => {
    return getStudentMessages(rollNumber);
  }, [getStudentMessages, rollNumber]);

  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((a) => a.status === 'present').length;
    const absent = attendanceRecords.filter((a) => a.status === 'absent').length;
    const late = attendanceRecords.filter((a) => a.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Monthly attendance for current month
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthRecords = attendanceRecords.filter((a) => {
      const date = new Date(a.date);
      return date >= monthStart && date <= monthEnd;
    });
    const monthPresent = monthRecords.filter((a) => a.status === 'present').length;
    const monthTotal = monthRecords.length;
    const monthPercentage = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

    // Last 14 days trend
    const trendData = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = attendanceRecords.find((a) => a.date === dateStr);
      trendData.push({
        date: format(date, 'MMM d'),
        value: record ? (record.status === 'present' ? 100 : record.status === 'late' ? 50 : 0) : null,
        status: record?.status || 'no-class',
      });
    }

    return {
      total,
      present,
      absent,
      late,
      percentage,
      monthPercentage,
      trendData,
      unreadMessages: messages.filter((m) => !m.read).length,
    };
  }, [attendanceRecords, messages]);

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 75) return <TrendingUp className="w-6 h-6 text-success" />;
    if (percentage >= 60) return <AlertCircle className="w-6 h-6 text-warning" />;
    return <XCircle className="w-6 h-6 text-destructive" />;
  };

  const getStatusMessage = (percentage: number) => {
    if (percentage >= 85) return 'Excellent attendance! Keep it up!';
    if (percentage >= 75) return 'Good attendance. Stay consistent!';
    if (percentage >= 60) return 'Attendance needs improvement';
    return 'Critical! Attendance below minimum required';
  };

  const isLoading = attendanceLoading || messagesLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {currentUser?.name || profile?.name}!</h1>
          <p className="text-muted-foreground mt-1">Roll Number: {rollNumber}</p>
        </div>

        {/* Overall Attendance Card */}
        <Card className="gradient-bg text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-foreground/10" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-primary-foreground/80 mb-2">Overall Attendance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{stats.percentage}%</span>
                  {getStatusIcon(stats.percentage)}
                </div>
                <p className="text-primary-foreground/80 mt-2">{getStatusMessage(stats.percentage)}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.present}</p>
                  <p className="text-xs text-primary-foreground/80">Present</p>
                </div>
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                  <XCircle className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.absent}</p>
                  <p className="text-xs text-primary-foreground/80">Absent</p>
                </div>
                <div className="text-center p-4 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                  <Clock className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.late}</p>
                  <p className="text-xs text-primary-foreground/80">Late</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.monthPercentage}%</p>
              <Progress value={stats.monthPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-2">Classes recorded</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <MessageSquare className="w-5 h-5 text-warning" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.unreadMessages}</p>
              <Link to="/student/messages" className="text-sm text-primary hover:underline mt-2 inline-block">
                View messages
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Attendance Trend (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value === 100 ? 'Present' : value === 50 ? 'Late' : 'Absent', 'Status']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/student/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>View Full Attendance</span>
                </Button>
              </Link>
              <Link to="/student/timetable">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Clock className="w-6 h-6" />
                  <span>View Timetable</span>
                </Button>
              </Link>
              <Link to="/student/messages">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <MessageSquare className="w-6 h-6" />
                  <span>Check Messages</span>
                </Button>
              </Link>
              <Link to="/student/profile">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Calendar className="w-6 h-6" />
                  <span>Update Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;

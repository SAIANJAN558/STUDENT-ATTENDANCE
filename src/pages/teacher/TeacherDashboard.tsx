import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, MessageSquare, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance } from '@/hooks/useAttendance';
import { useMessages } from '@/hooks/useMessages';
import { useAuthContext } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const TeacherDashboard = () => {
  const { currentUser } = useAuthContext();
  const { students, isLoading: studentsLoading } = useStudents();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { messages, isLoading: messagesLoading } = useMessages();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter((a) => a.date === today);

    const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
    const absentToday = todayAttendance.filter((a) => a.status === 'absent').length;
    const lateToday = todayAttendance.filter((a) => a.status === 'late').length;

    // Weekly attendance
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayAttendance = attendance.filter((a) => a.date === dateStr);
      const present = dayAttendance.filter((a) => a.status === 'present').length;
      const total = dayAttendance.length || 1;
      
      last7Days.push({
        day: dayName,
        attendance: Math.round((present / total) * 100),
      });
    }

    const totalAttendance = attendance.length;
    const totalPresent = attendance.filter((a) => a.status === 'present').length;
    const overallRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

    return {
      totalStudents: students.length,
      presentToday,
      absentToday,
      lateToday,
      unreadMessages: messages.filter((m) => !m.read).length,
      weeklyData: last7Days,
      overallRate,
    };
  }, [students, attendance, messages]);

  if (studentsLoading || attendanceLoading || messagesLoading) {
    return <DashboardLayout><Skeleton className="h-96 w-full" /></DashboardLayout>;
  }

  const pieData = [
    { name: 'Present', value: stats.presentToday, color: 'hsl(142, 76%, 36%)' },
    { name: 'Absent', value: stats.absentToday, color: 'hsl(0, 84%, 60%)' },
    { name: 'Late', value: stats.lateToday, color: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {currentUser?.name}!</h1>
          <p className="text-muted-foreground mt-1">Here's your attendance overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-3xl font-bold text-success mt-2">{stats.presentToday}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                  <p className="text-3xl font-bold text-destructive mt-2">{stats.absentToday}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.overallRate}%</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Weekly Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Today's Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Attendance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {stats.presentToday + stats.absentToday + stats.lateToday > 0 ? (
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
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No attendance marked today</p>
                  </div>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/teacher/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <ClipboardList className="w-6 h-6" />
                  <span>Mark Attendance</span>
                </Button>
              </Link>
              <Link to="/teacher/students">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span>Manage Students</span>
                </Button>
              </Link>
              <Link to="/teacher/timetable">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Clock className="w-6 h-6" />
                  <span>Update Timetable</span>
                </Button>
              </Link>
              <Link to="/teacher/messages">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <MessageSquare className="w-6 h-6" />
                  <span>Send Message</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;

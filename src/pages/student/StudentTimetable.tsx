import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTimetable } from '@/hooks/useTimetable';
import { Skeleton } from '@/components/ui/skeleton';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '12:15 - 01:15', '02:00 - 03:00', '03:00 - 04:00'];

const StudentTimetable = () => {
  const { timetable, isLoading } = useTimetable();

  const getEntry = (day: string, time: string) => {
    return timetable.find((entry) => entry.day === day && entry.time === time);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Class Timetable</h1>
          <p className="text-muted-foreground mt-1">View your weekly class schedule</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Time</TableHead>
                    {days.map((day) => (
                      <TableHead
                        key={day}
                        className={`min-w-[150px] text-center ${
                          day === today ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className={day === today ? 'text-primary font-semibold' : ''}>
                          {day}
                          {day === today && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              Today
                            </span>
                          )}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {times.map((time) => (
                    <TableRow key={time}>
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {time}
                      </TableCell>
                      {days.map((day) => {
                        const entry = getEntry(day, time);
                        const isBreak = entry?.subject === 'Break';
                        const isToday = day === today;

                        if (isBreak) {
                          return (
                            <TableCell
                              key={day}
                              className={`text-center ${isToday ? 'bg-primary/5' : 'bg-muted/50'}`}
                            >
                              <span className="text-muted-foreground font-medium">Break</span>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={day} className={`p-2 ${isToday ? 'bg-primary/5' : ''}`}>
                            {entry ? (
                              <div
                                className={`text-center p-3 rounded-lg transition-colors ${
                                  isToday
                                    ? 'bg-primary/10 border border-primary/20'
                                    : 'bg-muted/50 border border-border'
                                }`}
                              >
                                <p className={`font-medium text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>
                                  {entry?.subject}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{entry?.teacher}</p>
                                <p className="text-xs text-muted-foreground">{entry?.room}</p>
                              </div>
                            ) : (
                              <div className="text-center p-3 text-muted-foreground text-sm">
                                -
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
                <span className="text-muted-foreground">Today's Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/50 border border-border" />
                <span className="text-muted-foreground">Other Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/50" />
                <span className="text-muted-foreground">Break</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;

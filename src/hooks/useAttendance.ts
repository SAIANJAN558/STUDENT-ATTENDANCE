import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiAttendanceRecord } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export type AttendanceRecord = ApiAttendanceRecord;

export const useAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      return await api.attendance.getAll();
    },
  });

  const markAttendance = useMutation({
    mutationFn: async (record: Omit<AttendanceRecord, 'id' | 'created_at'>) => {
      return await api.attendance.mark(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const bulkMarkAttendance = useMutation({
    mutationFn: async (records: Omit<AttendanceRecord, 'id' | 'created_at'>[]) => {
      return await api.attendance.bulkMark(records);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Success', description: 'Attendance saved successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const getStudentAttendance = (rollNumber: string) => {
    return attendance.filter((a) => a.student_id?.toUpperCase() === rollNumber?.toUpperCase());
  };

  return {
    attendance,
    isLoading,
    markAttendance: markAttendance.mutate,
    bulkMarkAttendance: bulkMarkAttendance.mutate,
    getStudentAttendance,
  };
};

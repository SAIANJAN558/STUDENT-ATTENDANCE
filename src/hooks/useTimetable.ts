import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiTimetableEntry } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export type TimetableEntry = ApiTimetableEntry;

export const useTimetable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timetable = [], isLoading } = useQuery({
    queryKey: ['timetable'],
    queryFn: async () => {
      return await api.timetable.getAll();
    },
  });

  const updateTimetable = useMutation({
    mutationFn: async (entries: TimetableEntry[]) => {
      return await api.timetable.updateAll(entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Timetable updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ day, time, ...updates }: Partial<TimetableEntry> & { day: string; time: string }) => {
      return await api.timetable.updateEntry({ day, time, ...updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });

  const getEntry = (day: string, time: string) => {
    return timetable.find((entry) => entry.day === day && entry.time === time);
  };

  return {
    timetable,
    isLoading,
    updateTimetable: updateTimetable.mutate,
    updateEntry: updateEntry.mutate,
    getEntry,
  };
};

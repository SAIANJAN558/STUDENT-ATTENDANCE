import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiStudent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export type Student = ApiStudent;

export const useStudents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      return await api.students.getAll();
    },
  });

  const addStudent = useMutation({
    mutationFn: async (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
      return await api.students.add(student);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Success', description: 'Student added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Student> & { id: string }) => {
      return await api.students.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Success', description: 'Student updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      return await api.students.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({ title: 'Success', description: 'Student deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    students,
    isLoading,
    addStudent: addStudent.mutate,
    updateStudent: updateStudent.mutate,
    deleteStudent: deleteStudent.mutate,
  };
};

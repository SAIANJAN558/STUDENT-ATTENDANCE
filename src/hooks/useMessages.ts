import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export type Message = ApiMessage;

export const useMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      return await api.messages.getAll();
    },
    refetchInterval: 10000, // Poll every 10s for new messages
  });

  const sendMessage = useMutation({
    mutationFn: async (message: Omit<Message, 'id' | 'created_at' | 'read'>) => {
      return await api.messages.send(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({ title: 'Success', description: 'Message sent successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      return await api.messages.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const getStudentMessages = (rollNumber: string) => {
    return messages.filter(
      (m) =>
        m.recipient_id?.toUpperCase() === rollNumber?.toUpperCase() ||
        m.recipient_id === 'all'
    );
  };

  const getSentMessages = (senderId: string) => {
    return messages.filter((m) => m.sender_id?.toLowerCase() === senderId?.toLowerCase());
  };

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate,
    markAsRead: markAsRead.mutate,
    getStudentMessages,
    getSentMessages,
  };
};

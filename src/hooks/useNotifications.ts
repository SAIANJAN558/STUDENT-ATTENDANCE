import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'message' | 'attendance' | 'timetable';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { profile, role } = useAuthContext();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);

  const fetchUnreadMessages = useCallback(async () => {
    if (!profile) return;

    try {
      const messages = await api.messages.getAll();
      const rollNumber = profile.roll_number?.toUpperCase();
      const email = profile.email?.toLowerCase();

      const unread = messages.filter((m) => {
        if (m.read) return false;
        const recipient = m.recipient_id?.toUpperCase();
        return (
          recipient === 'ALL' ||
          recipient === rollNumber ||
          m.recipient_id?.toLowerCase() === email
        );
      });

      setUnreadMessages(unread.length);
    } catch (err) {
      // Ignore polling errors
    }
  }, [profile]);

  useEffect(() => {
    if (role === 'student' && profile) {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [profile, role, fetchUnreadMessages]);

  const markMessagesRead = () => {
    fetchUnreadMessages();
  };

  const clearUpdates = () => {
    setHasNewUpdates(false);
  };

  return {
    unreadMessages,
    hasNewUpdates,
    markMessagesRead,
    clearUpdates,
    refetch: fetchUnreadMessages,
  };
};

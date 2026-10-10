import { useMemo } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Mail, MailOpen, Users, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Skeleton } from '@/components/ui/skeleton';

const StudentMessages = () => {
  const { profile, currentUser } = useAuthContext();
  const { getStudentMessages, markAsRead, isLoading } = useMessages();

  const rollNumber = profile?.roll_number || currentUser?.rollNumber || '';

  const messages = useMemo(() => {
    return getStudentMessages(rollNumber).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [getStudentMessages, rollNumber]);

  const handleMessageClick = (messageId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(messageId);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Inbox ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm mt-1">Messages from teachers will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message.id, message.read)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      message.read
                        ? 'border-border bg-card hover:bg-muted/50'
                        : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          message.read ? 'bg-muted' : 'bg-primary/10'
                        }`}
                      >
                        {message.read ? (
                          <MailOpen className={`w-5 h-5 ${message.read ? 'text-muted-foreground' : 'text-primary'}`} />
                        ) : (
                          <Mail className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {message.recipient_id === 'all' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                              <Users className="w-3 h-3" />
                              Announcement
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              <User className="w-3 h-3" />
                              Direct Message
                            </span>
                          )}
                          {!message.read && (
                            <span className="inline-flex items-center text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <h3 className={`font-semibold ${message.read ? 'text-foreground' : 'text-primary'}`}>
                          {message.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          From: {message.sender_id} • {format(new Date(message.created_at), 'MMMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentMessages;

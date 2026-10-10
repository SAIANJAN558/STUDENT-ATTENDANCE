import { useState } from 'react';
import { Send, Users, User, MessageSquare, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useStudents } from '@/hooks/useStudents';
import { useMessages } from '@/hooks/useMessages';
import { useAuthContext } from '@/contexts/AuthContext';

import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const Messages = () => {
  const { students, isLoading: studentsLoading } = useStudents();
  const { sendMessage, getSentMessages, isLoading: messagesLoading } = useMessages();
  const { profile } = useAuthContext();
  const [recipientType, setRecipientType] = useState<'all' | 'individual'>('all');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const sentMessages = getSentMessages(profile?.email || '');

  const handleSendMessage = () => {
    if (!subject.trim() || !content.trim()) return;
    if (recipientType === 'individual' && !selectedStudent) return;
    sendMessage({ sender_id: profile?.email || '', recipient_id: recipientType === 'all' ? 'all' : selectedStudent, subject: subject.trim(), content: content.trim() });
    setSubject(''); setContent(''); setSelectedStudent('');
  };

  if (studentsLoading || messagesLoading) return <DashboardLayout><Skeleton className="h-64 w-full" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-3xl font-bold text-foreground">Messages</h1><p className="text-muted-foreground mt-1">Send messages to students</p></div>
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="compose"><Send className="w-4 h-4 mr-2" />Compose</TabsTrigger><TabsTrigger value="sent"><Inbox className="w-4 h-4 mr-2" />Sent ({sentMessages.length})</TabsTrigger></TabsList>
          <TabsContent value="compose" className="mt-6"><Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />New Message</CardTitle></CardHeader><CardContent className="space-y-6">
            <div className="space-y-4"><Label>Send To</Label><div className="flex gap-3"><Button variant={recipientType === 'all' ? 'default' : 'outline'} onClick={() => setRecipientType('all')}><Users className="w-4 h-4 mr-2" />All Students</Button><Button variant={recipientType === 'individual' ? 'default' : 'outline'} onClick={() => setRecipientType('individual')}><User className="w-4 h-4 mr-2" />Individual</Button></div></div>
            {recipientType === 'individual' && <div className="space-y-2"><Label>Select Student</Label><Select value={selectedStudent} onValueChange={setSelectedStudent}><SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger><SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.roll_number}>{s.roll_number} - {s.name}</SelectItem>)}</SelectContent></Select></div>}
            <div className="space-y-2"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} /></div>
            <Button variant="gradient" onClick={handleSendMessage}><Send className="w-4 h-4 mr-2" />Send Message</Button>
          </CardContent></Card></TabsContent>
          <TabsContent value="sent" className="mt-6"><Card><CardHeader><CardTitle>Sent Messages</CardTitle></CardHeader><CardContent>
            {sentMessages.length === 0 ? <div className="text-center py-12 text-muted-foreground"><MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No messages sent yet</p></div> : <div className="space-y-4">{sentMessages.map((m) => <div key={m.id} className="p-4 rounded-xl border border-border"><div className="flex justify-between"><div><div className="flex items-center gap-2 mb-1">{m.recipient_id === 'all' ? <Users className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-accent" />}<span className="text-sm text-muted-foreground">To: {m.recipient_id === 'all' ? 'All Students' : students.find(s => s.roll_number === m.recipient_id)?.name || m.recipient_id}</span></div><h3 className="font-semibold">{m.subject}</h3><p className="text-sm text-muted-foreground line-clamp-2">{m.content}</p></div><span className="text-xs text-muted-foreground">{format(new Date(m.created_at), 'MMM d, h:mm a')}</span></div></div>)}</div>}
          </CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Messages;

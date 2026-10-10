-- Fix students table: students can only see their own record, teachers can see all
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;

-- Students can only view their own record (matching by email from their profile)
CREATE POLICY "Students can view their own record"
ON public.students FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'teacher')
);

-- Fix messages table: users can only see messages they sent or received
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  sender_id = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
  OR recipient_id = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
  OR recipient_id = 'all'
);

-- Also fix message updates - users can only update messages they received (to mark as read)
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;

CREATE POLICY "Recipients can update their messages"
ON public.messages FOR UPDATE
TO authenticated
USING (
  recipient_id = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
  OR recipient_id = 'all'
);
-- Fix messages sender spoofing: validate sender_id matches authenticated user's email
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;

CREATE POLICY "Authenticated users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
);
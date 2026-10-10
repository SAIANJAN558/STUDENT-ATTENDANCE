-- Drop existing SELECT policy for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;

-- Create updated SELECT policy that checks both email and roll_number
CREATE POLICY "Users can view their own messages" 
ON messages 
FOR SELECT 
USING (
  sender_id = (SELECT profiles.email FROM profiles WHERE profiles.user_id = auth.uid())
  OR recipient_id = (SELECT profiles.email FROM profiles WHERE profiles.user_id = auth.uid())
  OR recipient_id = (SELECT profiles.roll_number FROM profiles WHERE profiles.user_id = auth.uid())
  OR recipient_id = 'all'
);

-- Drop existing UPDATE policy for messages
DROP POLICY IF EXISTS "Recipients can update their messages" ON messages;

-- Create updated UPDATE policy that checks both email and roll_number
CREATE POLICY "Recipients can update their messages" 
ON messages 
FOR UPDATE 
USING (
  recipient_id = (SELECT profiles.email FROM profiles WHERE profiles.user_id = auth.uid())
  OR recipient_id = (SELECT profiles.roll_number FROM profiles WHERE profiles.user_id = auth.uid())
  OR recipient_id = 'all'
);
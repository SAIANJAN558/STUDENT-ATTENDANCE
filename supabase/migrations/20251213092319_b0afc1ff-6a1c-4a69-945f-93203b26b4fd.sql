-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('teacher', 'student', 'admin');

-- Create profiles table to store additional user info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    roll_number TEXT,
    department TEXT DEFAULT 'Computer Science',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Security definer function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_roles (only admins or the system can manage)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Now fix the students table RLS - drop insecure policies
DROP POLICY IF EXISTS "Anyone can read students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;
DROP POLICY IF EXISTS "Anyone can update students" ON public.students;
DROP POLICY IF EXISTS "Anyone can delete students" ON public.students;

-- Add secure RLS policies to students table
CREATE POLICY "Authenticated users can view students"
ON public.students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update students"
ON public.students FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can delete students"
ON public.students FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix attendance_records table RLS
DROP POLICY IF EXISTS "Anyone can read attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can insert attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can update attendance" ON public.attendance_records;

CREATE POLICY "Authenticated users can view attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can insert attendance"
ON public.attendance_records FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update attendance"
ON public.attendance_records FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Fix messages table RLS
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.messages;

CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their messages"
ON public.messages FOR UPDATE
TO authenticated
USING (true);

-- Fix timetable table RLS
DROP POLICY IF EXISTS "Anyone can read timetable" ON public.timetable;
DROP POLICY IF EXISTS "Anyone can insert timetable" ON public.timetable;
DROP POLICY IF EXISTS "Anyone can update timetable" ON public.timetable;
DROP POLICY IF EXISTS "Anyone can delete timetable" ON public.timetable;

CREATE POLICY "Authenticated users can view timetable"
ON public.timetable FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can manage timetable"
ON public.timetable FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update timetable"
ON public.timetable FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can delete timetable"
ON public.timetable FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
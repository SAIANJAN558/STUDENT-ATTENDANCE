CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id text NOT NULL,
    date date NOT NULL,
    status text NOT NULL,
    subject text,
    marked_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT attendance_records_status_check CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id text NOT NULL,
    recipient_id text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    roll_number text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    department text DEFAULT 'Computer Science'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: timetable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timetable (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    day text NOT NULL,
    "time" text NOT NULL,
    subject text NOT NULL,
    teacher text NOT NULL,
    room text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_student_id_date_subject_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_student_id_date_subject_key UNIQUE (student_id, date, subject);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_roll_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_roll_number_key UNIQUE (roll_number);


--
-- Name: timetable timetable_day_time_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_day_time_key UNIQUE (day, "time");


--
-- Name: timetable timetable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (id);


--
-- Name: students Anyone can delete students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete students" ON public.students FOR DELETE USING (true);


--
-- Name: timetable Anyone can delete timetable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete timetable" ON public.timetable FOR DELETE USING (true);


--
-- Name: attendance_records Anyone can insert attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert attendance" ON public.attendance_records FOR INSERT WITH CHECK (true);


--
-- Name: messages Anyone can insert messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);


--
-- Name: students Anyone can insert students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert students" ON public.students FOR INSERT WITH CHECK (true);


--
-- Name: timetable Anyone can insert timetable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert timetable" ON public.timetable FOR INSERT WITH CHECK (true);


--
-- Name: attendance_records Anyone can read attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read attendance" ON public.attendance_records FOR SELECT USING (true);


--
-- Name: messages Anyone can read messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT USING (true);


--
-- Name: students Anyone can read students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read students" ON public.students FOR SELECT USING (true);


--
-- Name: timetable Anyone can read timetable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read timetable" ON public.timetable FOR SELECT USING (true);


--
-- Name: attendance_records Anyone can update attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update attendance" ON public.attendance_records FOR UPDATE USING (true);


--
-- Name: messages Anyone can update messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update messages" ON public.messages FOR UPDATE USING (true);


--
-- Name: students Anyone can update students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update students" ON public.students FOR UPDATE USING (true);


--
-- Name: timetable Anyone can update timetable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update timetable" ON public.timetable FOR UPDATE USING (true);


--
-- Name: attendance_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: timetable; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--



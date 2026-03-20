-- Run this in your Supabase SQL Editor to support editing and the 3 distinct constraints

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_1 TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_2 TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_3 TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- AI Feature Columns
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS ai_suggestion TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS ai_suggestion_published BOOLEAN DEFAULT false;

-- Constraint / Mini-Game Titles
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_1_title TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_2_title TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_3_title TEXT;

-- Dedicated AI Feature Columns for individual Constraints
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_1_ai TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_1_ai_published BOOLEAN DEFAULT false;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_2_ai TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_2_ai_published BOOLEAN DEFAULT false;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_3_ai TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_3_ai_published BOOLEAN DEFAULT false;

-- Create profiles table for role management
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('coach', 'member')) default 'member'
);

-- Run this in your Supabase SQL Editor to support editing and the 3 distinct constraints

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_1 TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_2 TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS constraint_3 TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS youtube_url TEXT;

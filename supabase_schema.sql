-- Run this in the Supabase SQL Editor

-- 1. Create Students Table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rank TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create Classes Table
CREATE TABLE public.classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    class_type TEXT NOT NULL,
    topic TEXT,
    constraints TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Attendance Junction Table
CREATE TABLE public.class_attendance (
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (class_id, student_id)
);

-- 4. Enable Row Level Security (RLS) - Allow all operations for now (assuming Coach is the only user)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write access to students" ON public.students FOR ALL USING (true);
CREATE POLICY "Allow anon read/write access to classes" ON public.classes FOR ALL USING (true);
CREATE POLICY "Allow anon read/write access to class_attendance" ON public.class_attendance FOR ALL USING (true);

-- 5. Insert Initial Mock Data
INSERT INTO public.students (name, rank, avatar_url) VALUES 
('Marcus', 'Brown Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'),
('Sarah', 'Purple Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
('John', 'Blue Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
('Jessica', 'White Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica'),
('David', 'Black Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
('Chris', 'White Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris'),
('Amanda', 'Blue Belt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda');

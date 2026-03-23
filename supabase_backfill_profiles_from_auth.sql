-- Run once in Supabase SQL Editor (Production) if users see "Role not set" / Pending.
-- Creates a public.profiles row for every auth.users row that is missing one (default role: member).
-- Promote coaches afterward (Auth metadata, or UPDATE public.profiles SET role = 'coach' WHERE id = '…').

INSERT INTO public.profiles (id, role)
SELECT u.id, 'member'::text
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Optional: verify
-- SELECT u.id, u.email, p.role FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id;

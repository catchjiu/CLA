-- Run in Supabase SQL Editor (Production).
-- Makes user e0eaa27e-b162-4010-86af-b60bffada597 a coach in profiles + JWT metadata.

-- 1) App table (source of truth for many flows)
INSERT INTO public.profiles (id, role)
VALUES ('e0eaa27e-b162-4010-86af-b60bffada597'::uuid, 'coach')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 2) Auth user metadata so the SPA sees role immediately after next sign-in
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'coach')
WHERE id = 'e0eaa27e-b162-4010-86af-b60bffada597'::uuid;

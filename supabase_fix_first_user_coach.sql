-- Run in Supabase SQL Editor (Production).
-- First account (catchjiujitsu) — UUID 4d0cf250-ad7d-47fe-b4ca-092fe1126e26
-- Use this if the *second* user works as coach but the *first* still shows Pending / wrong role.
-- After running: sign OUT of the app, then sign in again (or use Incognito) so the JWT picks up metadata.

-- 1) profiles
INSERT INTO public.profiles (id, role)
VALUES ('4d0cf250-ad7d-47fe-b4ca-092fe1126e26'::uuid, 'coach')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 2) JWT user_metadata (merged with existing keys like email_verified)
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'coach')
WHERE id = '4d0cf250-ad7d-47fe-b4ca-092fe1126e26'::uuid;

-- Optional checks:
-- SELECT id, role FROM public.profiles WHERE id = '4d0cf250-ad7d-47fe-b4ca-092fe1126e26';
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE id = '4d0cf250-ad7d-47fe-b4ca-092fe1126e26';

-- Run in Supabase SQL Editor (Production).
-- Replace YOUR_USER_UUID with the id from: Authentication → Users, OR copy "Your user id" from the app dashboard.
-- This fixes "Role not set" when profiles has other rows but none for this account.

-- 1) profiles row for this login
INSERT INTO public.profiles (id, role)
VALUES ('YOUR_USER_UUID'::uuid, 'coach')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 2) Optional: JWT user_metadata so the SPA sees role after next sign-in
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'coach')
WHERE id = 'YOUR_USER_UUID'::uuid;

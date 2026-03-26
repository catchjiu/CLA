-- Run in Supabase SQL Editor (Production).
-- ONE edit: in the DECLARE block below, replace ONLY the nil UUID with your real user id
-- (Authentication → Users → your user → Raw JSON → copy "id", e.g. 4d0cf250-ad7d-47fe-b4ca-092fe1126e26).
-- Do not run with the all-zeros UUID — the script will refuse until you paste yours.

DO $$
DECLARE
  uid uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  IF uid = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION
      'Edit this script: set uid to your real user UUID from Authentication → Users (replace the 00000000-... line).';
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (uid, 'coach')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE auth.users
  SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'coach')
  WHERE id = uid;
END $$;

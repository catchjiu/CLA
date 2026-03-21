-- Run in Supabase SQL Editor (Production).
-- When RLS blocks direct SELECT from the browser, the app falls back to this RPC.
-- It only returns the row for auth.uid(), so it stays safe.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Help PostgREST pick up the function without waiting (safe in SQL Editor).
NOTIFY pgrst, 'reload schema';

-- Run in Supabase SQL Editor if SIGNED-IN users see no classes but anon / SQL still shows rows.
-- PostgREST uses the `authenticated` role when a JWT is present; some projects only had policies for `anon`.

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_full_access_classes" ON public.classes;
CREATE POLICY "authenticated_full_access_classes"
  ON public.classes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- If you still rely on anon (e.g. public embeds), keep your existing anon policy; this only adds authenticated.

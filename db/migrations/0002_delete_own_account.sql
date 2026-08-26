-- Self-service account deletion without a service-role key.
--
-- The admin API (auth.admin.deleteUser) needs the service key, which would then
-- have to live in the app's environment — a key that can impersonate anyone,
-- carried around for one rarely-used feature. A SECURITY DEFINER function is
-- narrower: it runs with the owner's rights but takes no argument, so the only
-- account it can ever delete is the caller's own.
--
-- The FK cascades from 0001 clear all 7 tables, so there is no application-side
-- sweep that could miss one.

CREATE OR REPLACE FUNCTION public.delete_own_account() RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
-- Pinned: a SECURITY DEFINER function that resolves names through the caller's
-- search_path can be tricked into running their objects with owner rights.
SET search_path = public, auth, pg_temp
AS $fn$
DECLARE
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'delete_own_account requires an authenticated caller';
  END IF;
  DELETE FROM auth.users WHERE id = caller;
END
$fn$;--> statement-breakpoint

-- Nobody may call it as an anonymous visitor.
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

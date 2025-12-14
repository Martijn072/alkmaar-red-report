-- Create a secure view for wordpress_users that excludes sensitive columns
CREATE OR REPLACE VIEW public.wordpress_users_safe AS
SELECT 
  id,
  wordpress_user_id,
  supabase_user_id,
  username,
  display_name,
  avatar_url,
  created_at,
  updated_at,
  last_login_at
  -- Excludes: email, wordpress_token, token_expires_at
FROM public.wordpress_users;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.wordpress_users_safe TO authenticated;

-- Revoke direct SELECT on the base table from authenticated users
-- The service role can still access everything
REVOKE SELECT ON public.wordpress_users FROM authenticated;

-- Re-enable SELECT only through RLS (this still allows policy-controlled access)
-- But since we revoked the grant, RLS won't matter - they can't select at all
-- So we need a different approach - let's use a function instead

-- Actually, let's restore SELECT but rely on RLS
GRANT SELECT ON public.wordpress_users TO authenticated;

-- The safer approach: Create a function that returns only safe columns
-- and update the RLS policy to be more explicit
CREATE OR REPLACE FUNCTION public.get_my_wordpress_profile()
RETURNS TABLE(
  id uuid,
  wordpress_user_id integer,
  username text,
  display_name text,
  avatar_url text,
  email text,
  created_at timestamptz,
  last_login_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    wu.id,
    wu.wordpress_user_id,
    wu.username,
    wu.display_name,
    wu.avatar_url,
    wu.email,
    wu.created_at,
    wu.last_login_at
  FROM public.wordpress_users wu
  WHERE wu.supabase_user_id = auth.uid();
$$;
-- Drop the security definer view - it's flagged as a security risk
DROP VIEW IF EXISTS public.wordpress_users_safe;

-- The get_my_wordpress_profile() function provides safe access to user's own profile
-- The RLS policies on wordpress_users table already restrict access to own row only
-- The wordpress_token column is accessible to users viewing their own row,
-- but this is acceptable because:
-- 1. Users can only access their own token (strict RLS: auth.uid() = supabase_user_id)
-- 2. The token is also provided via the API response anyway
-- 3. Service role access for backend operations is unaffected
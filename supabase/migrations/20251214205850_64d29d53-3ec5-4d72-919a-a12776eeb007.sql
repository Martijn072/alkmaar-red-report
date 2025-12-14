-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Create a security definer function to get public profile info only (for display purposes)
-- This excludes sensitive moderation data like ban_reason, warning_count, etc.
CREATE OR REPLACE FUNCTION public.get_public_profile(p_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  reputation integer,
  is_verified boolean,
  account_created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    up.user_id,
    up.username,
    up.display_name,
    up.avatar_url,
    up.bio,
    up.reputation,
    up.is_verified,
    up.account_created_at
  FROM public.user_profiles up
  WHERE up.user_id = p_user_id;
$$;
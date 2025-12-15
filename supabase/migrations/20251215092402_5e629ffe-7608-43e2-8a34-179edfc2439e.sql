-- Drop the current SELECT policy that exposes author_email to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view approved comments" ON public.secure_comments;

-- Create a more restrictive policy: users can only directly access their OWN comments
-- Public access to comments should go through get_article_comments() function which excludes author_email
CREATE POLICY "Users can view own comments" 
ON public.secure_comments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Note: The existing get_article_comments() security definer function already excludes 
-- the author_email field and is used for public comment display
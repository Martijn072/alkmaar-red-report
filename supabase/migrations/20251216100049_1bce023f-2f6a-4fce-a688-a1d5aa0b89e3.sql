-- Drop functions with CASCADE to remove dependent triggers
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_reaction_counts() CASCADE;
DROP FUNCTION IF EXISTS public.update_reply_counts() CASCADE;
DROP FUNCTION IF EXISTS public.get_article_comments(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_public_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_wordpress_profile() CASCADE;
DROP FUNCTION IF EXISTS public.get_wordpress_public_profile(integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_wordpress_safe_profile(integer) CASCADE;
DROP FUNCTION IF EXISTS public.check_rate_limit(uuid, inet, text, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.record_rate_limit_action(uuid, inet, text) CASCADE;

-- Drop tables with CASCADE
DROP TABLE IF EXISTS public.comment_reactions CASCADE;
DROP TABLE IF EXISTS public.comment_reports CASCADE;
DROP TABLE IF EXISTS public.secure_notifications CASCADE;
DROP TABLE IF EXISTS public.secure_comments CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.wordpress_users CASCADE;
DROP TABLE IF EXISTS public.user_rate_limits CASCADE;

-- Check if the social media cron job exists and recreate if needed
DO $$
BEGIN
    -- First, try to unschedule the job if it exists (no error if it doesn't exist)
    BEGIN
        PERFORM cron.unschedule('fetch-social-media-posts');
    EXCEPTION WHEN OTHERS THEN
        -- Job doesn't exist, that's fine
        NULL;
    END;
    
    -- Create the cron job to fetch social media posts every 15 minutes
    PERFORM cron.schedule(
        'fetch-social-media-posts',
        '*/15 * * * *', -- every 15 minutes
        $$
        SELECT
            net.http_post(
                url:='https://vweraucnekeucrryqjlo.supabase.co/functions/v1/social-media-fetcher',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlqamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc"}'::jsonb,
                body:='{}'::jsonb
            ) as request_id;
        $$
    );
    
    RAISE NOTICE 'Social media cron job has been recreated successfully';
END $$;

-- Also check and fix the article fetcher cron job to make sure it's working
DO $$
BEGIN
    -- First, try to unschedule the job if it exists
    BEGIN
        PERFORM cron.unschedule('fetch-new-articles-for-notifications');
    EXCEPTION WHEN OTHERS THEN
        -- Job doesn't exist, that's fine
        NULL;
    END;
    
    -- Recreate the articles cron job
    PERFORM cron.schedule(
        'fetch-new-articles-for-notifications',
        '*/30 * * * *', -- every 30 minutes
        $$
        SELECT
            net.http_post(
                url:='https://vweraucnekeucrryqjlo.supabase.co/functions/v1/fetch-articles',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc"}'::jsonb,
                body:='{"mode": "notifications", "perPage": 20}'::jsonb
            ) as request_id;
        $$
    );
    
    RAISE NOTICE 'Articles cron job has been recreated successfully';
END $$;

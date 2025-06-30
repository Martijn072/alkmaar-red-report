
-- Fix the JSON syntax error in cron jobs by recreating them with proper formatting
-- Remove existing cron jobs first
DO $$
BEGIN
    -- Unschedule existing jobs to avoid conflicts
    BEGIN
        PERFORM cron.unschedule('fetch-social-media-posts');
        RAISE NOTICE 'Unscheduled existing social media cron job';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No existing social media cron job to unschedule';
    END;
    
    BEGIN
        PERFORM cron.unschedule('fetch-new-articles-for-notifications');
        RAISE NOTICE 'Unscheduled existing articles cron job';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No existing articles cron job to unschedule';
    END;
END $$;

-- Create social media cron job with CORRECT JSON formatting (no double escaping)
SELECT cron.schedule(
    'fetch-social-media-posts',
    '*/15 * * * *',
    'SELECT net.http_post(url:=''https://vweraucnekeucrryqjlo.supabase.co/functions/v1/social-media-fetcher'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc\"}''::jsonb, body:=''{}''::jsonb) as request_id;'
);

-- Create articles cron job with CORRECT JSON formatting (no double escaping)  
SELECT cron.schedule(
    'fetch-new-articles-for-notifications',
    '*/30 * * * *',
    'SELECT net.http_post(url:=''https://vweraucnekeucrryqjlo.supabase.co/functions/v1/fetch-articles'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc\"}''::jsonb, body:=''{\"mode\": \"notifications\", \"perPage\": 20}''::jsonb) as request_id;'
);


-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily cleanup at 3:00 AM UTC
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * *', -- Daily at 3:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vweraucnekeucrryqjlo.supabase.co/functions/v1/cleanup-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZXJhdWNuZWtldWNycnlxamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzI3OTMsImV4cCI6MjA2NjcwODc5M30.Cy65kblAI4P6GP1ANUHFNdsLma-Hb1lCp5g6w5hRGHc"}'::jsonb,
        body:='{"action": "cleanup"}'::jsonb
    ) as request_id;
  $$
);

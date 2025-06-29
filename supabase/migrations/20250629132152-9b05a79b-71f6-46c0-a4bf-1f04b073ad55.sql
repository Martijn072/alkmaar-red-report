
-- Create a table to track which articles we've already processed for notifications
CREATE TABLE public.processed_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id INTEGER NOT NULL UNIQUE,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  article_title TEXT NOT NULL,
  article_url TEXT
);

-- Add index for faster lookups
CREATE INDEX idx_processed_articles_article_id ON public.processed_articles(article_id);
CREATE INDEX idx_processed_articles_processed_at ON public.processed_articles(processed_at);

-- Enable the pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to check for new articles every 30 minutes
SELECT cron.schedule(
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

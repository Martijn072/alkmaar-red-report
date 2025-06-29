
-- Extend the notifications table for social media
ALTER TABLE public.notifications 
ADD COLUMN social_media_url TEXT,
ADD COLUMN thumbnail_url TEXT;

-- Update the type constraint to include social media types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('article', 'goal', 'match', 'breaking', 'instagram', 'twitter'));

-- Insert some sample social media notifications for testing
INSERT INTO public.notifications (type, title, description, icon, social_media_url, thumbnail_url) VALUES
('instagram', 'Nieuwe Instagram post', 'AZ trainingssessie vandaag! De spelers bereiden zich voor op de volgende wedstrijd tegen...', '📷', 'https://instagram.com/p/sample123', 'https://picsum.photos/300/300?random=1'),
('twitter', 'Nieuwe Tweet', 'BREAKING: AZ heeft een nieuwe speler aangetrokken! Welkom bij de club 🔴⚪ #AZ #Transfer', '🐦', 'https://twitter.com/azfanpage/status/sample456', null),
('instagram', 'Nieuwe Instagram post', 'Matchday! AZ vs PSV vanavond in het AFAS Stadion. Kom allemaal naar het stadion! ⚽', '📷', 'https://instagram.com/p/sample789', 'https://picsum.photos/300/300?random=2');

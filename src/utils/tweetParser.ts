export interface TweetData {
  id: string;
  text: string;
  username: string;
  displayName: string;
  createdAt: Date;
  url: string;
  hashtags: string[];
  mentions: string[];
}

// Parse tweet URL to extract basic information
export const parseTweetUrl = (url: string): { username: string; tweetId: string } | null => {
  // Support both twitter.com and x.com URLs
  const tweetUrlRegex = /(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/i;
  const match = url.match(tweetUrlRegex);
  
  if (match) {
    return {
      username: match[1],
      tweetId: match[2]
    };
  }
  
  return null;
};

// Extract hashtags from tweet text
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
};

// Extract mentions from tweet text
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Create mock tweet data from URL (since we can't access Twitter API without keys)
export const createMockTweetData = (url: string): TweetData | null => {
  const parsed = parseTweetUrl(url);
  if (!parsed) return null;

  // Create realistic mock data
  const mockTweets: Record<string, Partial<TweetData>> = {
    'azfanpage': {
      displayName: 'AZ Fanpage',
      text: 'Wat een wedstrijd! AZ laat weer zien waarom ze thuishoren in de top van de Eredivisie. 🔴⚪ #AZ #Eredivisie #PMUAZ',
    },
    'az_alkmaar': {
      displayName: 'AZ',
      text: 'DOELPUNT! Wat een prachtige aanval! De bal gaat erin en het publiek gaat los! ⚽ #AZ #AlkmaarZaanstreek #VoorAltijd',
    },
    // Add more mock data as needed
  };

  const mockData = mockTweets[parsed.username.toLowerCase()] || {
    displayName: parsed.username,
    text: 'Deze tweet kon niet worden geladen. Klik om de originele tweet te bekijken.',
  };

  return {
    id: parsed.tweetId,
    username: parsed.username,
    displayName: mockData.displayName || parsed.username,
    text: mockData.text || 'Tweet content could not be loaded.',
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
    url: url,
    hashtags: extractHashtags(mockData.text || ''),
    mentions: extractMentions(mockData.text || ''),
  };
};

// Detect Twitter URLs in content
export const detectTweetUrls = (content: string): string[] => {
  const tweetUrlRegex = /https?:\/\/(?:twitter\.com|x\.com)\/[^\/]+\/status\/\d+/gi;
  return content.match(tweetUrlRegex) || [];
};

// Replace Twitter embeds in HTML content
export const replaceTweetEmbeds = (content: string): { content: string; tweets: TweetData[] } => {
  const tweets: TweetData[] = [];
  let processedContent = content;

  // Replace Twitter iframe embeds
  processedContent = processedContent.replace(
    /<iframe[^>]*src="[^"]*(?:twitter\.com|x\.com)[^"]*"[^>]*><\/iframe>/gi,
    (match) => {
      // Try to extract URL from iframe src
      const srcMatch = match.match(/src="([^"]*)/);
      if (srcMatch) {
        const fullUrl = srcMatch[1];
        const tweetUrlMatch = fullUrl.match(/url=([^&]*)/);
        if (tweetUrlMatch) {
          const tweetUrl = decodeURIComponent(tweetUrlMatch[1]);
          const tweetData = createMockTweetData(tweetUrl);
          if (tweetData) {
            tweets.push(tweetData);
            return `<div data-tweet-replacement="${tweetData.id}" data-tweet-url="${tweetUrl}"></div>`;
          }
        }
      }
      return match;
    }
  );

  // Replace Twitter blockquote embeds
  processedContent = processedContent.replace(
    /<blockquote[^>]*class="[^"]*twitter-tweet[^"]*"[^>]*>.*?<\/blockquote>/gis,
    (match) => {
      // Try to extract URL from blockquote content
      const urlMatch = match.match(/<a[^>]*href="([^"]*(?:twitter\.com|x\.com)[^"]*)"[^>]*>/i);
      if (urlMatch) {
        const tweetUrl = urlMatch[1];
        const tweetData = createMockTweetData(tweetUrl);
        if (tweetData) {
          tweets.push(tweetData);
          return `<div data-tweet-replacement="${tweetData.id}" data-tweet-url="${tweetUrl}"></div>`;
        }
      }
      return match;
    }
  );

  // Replace standalone Twitter URLs
  const tweetUrls = detectTweetUrls(processedContent);
  tweetUrls.forEach(url => {
    const tweetData = createMockTweetData(url);
    if (tweetData) {
      tweets.push(tweetData);
      // Replace URL with placeholder if it's not already part of a link
      const urlRegex = new RegExp(`(?<!href=")${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!")`, 'g');
      processedContent = processedContent.replace(
        urlRegex,
        `<div data-tweet-replacement="${tweetData.id}" data-tweet-url="${url}"></div>`
      );
    }
  });

  return { content: processedContent, tweets };
};
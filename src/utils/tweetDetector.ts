import { TweetData, replaceTweetEmbeds } from './tweetParser';

// Scan entire content for Twitter references
export const scanForTwitterContent = (content: string): {
  hasTwitterContent: boolean;
  tweetCount: number;
  processedContent: string;
  tweets: TweetData[];
} => {
  const { content: processedContent, tweets } = replaceTweetEmbeds(content);
  
  return {
    hasTwitterContent: tweets.length > 0,
    tweetCount: tweets.length,
    processedContent,
    tweets
  };
};

// Process content and return both processed content and tweet data
export const processTwitterContent = (htmlContent: string) => {
  console.log('🔍 Scanning content for Twitter embeds and URLs...');
  
  const result = scanForTwitterContent(htmlContent);
  
  if (result.hasTwitterContent) {
    console.log(`✅ Found ${result.tweetCount} Twitter embed(s), replacing with custom components`);
    result.tweets.forEach((tweet, index) => {
      console.log(`📝 Tweet ${index + 1}: @${tweet.username} - "${tweet.text.substring(0, 50)}..."`);
    });
  } else {
    console.log('ℹ️ No Twitter content found in this article');
  }
  
  return result;
};
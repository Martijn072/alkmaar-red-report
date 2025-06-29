
export interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  author: number;
  date: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  slug: string;
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description: string;
      avatar_urls: {
        24: string;
        48: string;
        96: string;
      };
      meta?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
      };
    }>;
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ name: string; taxonomy: string }>>;
  };
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AuthorInfo {
  id: number;
  name: string;
  description: string;
  avatar: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorInfo?: AuthorInfo;
  publishedAt: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  readTime: string;
  slug: string;
}

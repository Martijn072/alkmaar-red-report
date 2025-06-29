
export const getCategoryIdByName = (categories: any[], categoryName: string): number | null => {
  // Category mapping with WordPress slugs
  const categoryMappings: { [key: string]: string } = {
    'Elftal en Technische staf': 'elftal-technisch',
    'Wedstrijden': 'wedstrijden',
    'Transfergeruchten': 'transfergeruchten',
    'Europees Voetbal': 'europees-voetbal',
    'AZ Jeugd': 'azjeugd',
    'Fotoreportages': 'fotoreportages',
    'Columns': 'columns',
    'Memory Lane': 'memory-lane',
    'Overig nieuws': 'overig-nieuws'
  };

  // Get the slug for the category
  const targetSlug = categoryMappings[categoryName];
  
  if (!targetSlug) {
    return null;
  }

  // Find category by slug
  const category = categories.find(cat => cat.slug === targetSlug);
  
  return category?.id || null;
};

// Get excluded category IDs (categories that should be hidden)
export const getExcludedCategoryIds = (): number[] => {
  return [2477]; // Ingezonden category ID
};

export const formatPublishedDate = (dateString: string): string => {
  const publishedDate = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return 'Zojuist';
  } else if (diffHours < 24) {
    return `${diffHours} uur geleden`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? '1 dag geleden' : `${diffDays} dagen geleden`;
  }
};

export const cleanHtmlContent = (htmlString: string): string => {
  return htmlString
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .trim();
};

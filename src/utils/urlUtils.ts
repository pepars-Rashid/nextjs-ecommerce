export interface ShopFilters {
  category?: string[];
  price?: string;
  sort?: string;
  [key: string]: any;
}

export const parseUrlFilters = (searchParams: URLSearchParams): Partial<ShopFilters> => {
  const filters: Partial<ShopFilters> = {};

  // Parse categories (comma-separated values)
  const categoryParam = searchParams.get('category');
  if (categoryParam) {
    filters.category = categoryParam.split(',').map(cat => decodeURIComponent(cat));
  }

  // Parse price range (format: "min-max")
  const priceParam = searchParams.get('price');
  if (priceParam) {
    filters.price = priceParam;
  }

  // Parse sort option
  const sortParam = searchParams.get('sort');
  if (sortParam) {
    filters.sort = sortParam;
  }

  return filters;
};

export const buildUrlFilters = (filters: Partial<ShopFilters>): URLSearchParams => {
  const params = new URLSearchParams();

  // Add categories (comma-separated)
  if (filters.category && filters.category.length > 0) {
    const encodedCategories = filters.category.map(cat => encodeURIComponent(cat));
    params.set('category', encodedCategories.join(','));
  }

  // Add price range
  if (filters.price) {
    params.set('price', filters.price);
  }

  // Add sort option
  if (filters.sort) {
    params.set('sort', filters.sort);
  }

  return params;
};

export const updateUrlWithFilters = (filters: Partial<ShopFilters>, pathname: string) => {
  const params = buildUrlFilters(filters);
  const queryString = params.toString();
  const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
  
  // Update URL without page reload
  window.history.pushState({}, '', newUrl);
};

export const categorySlugsToIds = (categorySlugs: string[], categories: any[]): number[] => {
  return categorySlugs
    .map(slug => {
      const category = categories.find(cat => cat.slug === slug || cat.name.toLowerCase().replace(/\s+/g, '-') === slug);
      return category?.id;
    })
    .filter(id => id !== undefined) as number[];
};

export const categoryIdsToSlugs = (categoryIds: number[], categories: any[]): string[] => {
  return categoryIds
    .map(id => {
      const category = categories.find(cat => cat.id === id);
      return category?.slug || category?.name?.toLowerCase().replace(/\s+/g, '-');
    })
    .filter(slug => slug !== undefined) as string[];
};

export const parsePriceRange = (priceRange: string): { min: number; max: number } | null => {
  const match = priceRange.match(/^(\d+)-(\d+)$/);
  if (match) {
    return {
      min: parseInt(match[1], 10),
      max: parseInt(match[2], 10)
    };
  }
  return null;
};

export const buildPriceRange = (min: number, max: number): string => {
  return `${min}-${max}`;
};
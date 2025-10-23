/**
 * Image URL utilities with Unsplash stock photos as fallbacks
 */

// Unsplash stock images by category
const STOCK_IMAGES: Record<string, string> = {
  'Technology': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
  'Music': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=400&fit=crop',
  'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
  'Art': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop',
  'Arts & Crafts': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=400&fit=crop',
  'Cultural': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
  'Workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  'Workshops': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  'Conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
  'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
  'Gaming': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=400&fit=crop',
  'Food': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
  'Social': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop'
};

const COLLEGE_STOCK_IMAGE = 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop';

/**
 * Fixes and validates image URLs with Unsplash fallbacks
 * @param url - The image URL to fix
 * @param fallbackText - Category name for stock image selection
 * @returns A valid image URL or stock photo
 */
export function getValidImageUrl(url: string | null | undefined, fallbackText: string = 'Event'): string {
  // If no URL provided or it's a placeholder URL, return stock image
  if (!url || url.trim() === '' || url.includes('placeholder')) {
    return STOCK_IMAGES[fallbackText] || STOCK_IMAGES.default;
  }

  // If already a valid HTTP/HTTPS URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path, assume it's from public folder
  if (url.startsWith('/')) {
    return url;
  }

  // If it's a Supabase storage path
  if (url.includes('supabase')) {
    return url;
  }

  // Otherwise, return stock image
  return STOCK_IMAGES[fallbackText] || STOCK_IMAGES.default;
}

/**
 * Handles image loading errors by setting a stock photo
 * @param fallbackText - Category for stock image selection
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, fallbackText: string = 'Event') {
  const target = e.currentTarget;
  target.src = STOCK_IMAGES[fallbackText] || STOCK_IMAGES.default;
  target.onerror = null; // Prevent infinite loop
}

/**
 * Gets a category-specific stock photo
 */
export function getCategoryPlaceholder(categoryName: string): string {
  return STOCK_IMAGES[categoryName] || STOCK_IMAGES.default;
}

/**
 * Gets a college logo with fallback to stock college image
 */
export function getCollegeLogo(url: string | null | undefined, collegeName?: string): string {
  if (!url || url.trim() === '' || url.includes('placeholder')) {
    return COLLEGE_STOCK_IMAGE;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return url;
  }

  return COLLEGE_STOCK_IMAGE;
}

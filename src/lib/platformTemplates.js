/**
 * Platform Templates for AI Studio
 * Pre-configured canvas sizes and settings for social media platforms
 */

// Platform preset definitions with dimensions and metadata
export const platformPresets = {
  // Square formats
  'instagram-post': {
    width: 1080,
    height: 1080,
    label: 'Instagram Post',
    icon: 'instagram',
    aspectRatio: '1:1',
    category: 'square',
    description: 'Perfect for Instagram feed posts',
  },
  'facebook-post-square': {
    width: 1080,
    height: 1080,
    label: 'Facebook Square',
    icon: 'facebook',
    aspectRatio: '1:1',
    category: 'square',
    description: 'Square format for Facebook feed',
  },

  // Vertical/Story formats (9:16)
  'instagram-story': {
    width: 1080,
    height: 1920,
    label: 'Instagram Story',
    icon: 'instagram',
    aspectRatio: '9:16',
    category: 'vertical',
    description: 'Stories and Reels',
  },
  tiktok: {
    width: 1080,
    height: 1920,
    label: 'TikTok',
    icon: 'tiktok',
    aspectRatio: '9:16',
    category: 'vertical',
    description: 'TikTok videos and images',
  },
  'facebook-story': {
    width: 1080,
    height: 1920,
    label: 'Facebook Story',
    icon: 'facebook',
    aspectRatio: '9:16',
    category: 'vertical',
    description: 'Facebook Stories',
  },
  pinterest: {
    width: 1000,
    height: 1500,
    label: 'Pinterest',
    icon: 'pinterest',
    aspectRatio: '2:3',
    category: 'vertical',
    description: 'Pinterest pins',
  },

  // Horizontal/Landscape formats
  'facebook-post': {
    width: 1200,
    height: 628,
    label: 'Facebook Post',
    icon: 'facebook',
    aspectRatio: '1.91:1',
    category: 'horizontal',
    description: 'Facebook feed and ads',
  },
  twitter: {
    width: 1200,
    height: 675,
    label: 'Twitter/X',
    icon: 'twitter',
    aspectRatio: '16:9',
    category: 'horizontal',
    description: 'Twitter/X posts',
  },
  'youtube-thumbnail': {
    width: 1280,
    height: 720,
    label: 'YouTube Thumbnail',
    icon: 'youtube',
    aspectRatio: '16:9',
    category: 'horizontal',
    description: 'Video thumbnails',
  },
  linkedin: {
    width: 1200,
    height: 627,
    label: 'LinkedIn',
    icon: 'linkedin',
    aspectRatio: '1.91:1',
    category: 'horizontal',
    description: 'LinkedIn posts',
  },

  // Custom
  custom: {
    width: 1080,
    height: 1080,
    label: 'Custom Size',
    icon: 'custom',
    aspectRatio: 'custom',
    category: 'custom',
    description: 'Set your own dimensions',
  },
}

// Platform categories for grouping in UI
export const platformCategories = [
  { id: 'vertical', label: 'Stories & Reels', icon: 'smartphone' },
  { id: 'square', label: 'Square Posts', icon: 'square' },
  { id: 'horizontal', label: 'Landscape', icon: 'monitor' },
  { id: 'custom', label: 'Custom', icon: 'edit' },
]

// Marketing template definitions
export const marketingTemplates = [
  {
    id: 'sale-banner',
    name: 'Sale Banner',
    category: 'promotions',
    thumbnail: null, // Will be generated
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#ff6b6b', '#feca57'],
      },
      {
        type: 'text',
        content: 'SALE',
        fontSize: 120,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '30%' },
      },
      {
        type: 'text',
        content: 'UP TO 50% OFF',
        fontSize: 48,
        fontWeight: '600',
        color: '#ffffff',
        position: { x: 'center', y: '50%' },
      },
      {
        type: 'text',
        content: 'Limited Time Only',
        fontSize: 24,
        color: '#ffffff',
        position: { x: 'center', y: '70%' },
      },
    ],
  },
  {
    id: 'new-arrival',
    name: 'New Arrival',
    category: 'products',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'solid',
        color: '#1a1a2e',
      },
      {
        type: 'text',
        content: 'NEW',
        fontSize: 32,
        fontWeight: '600',
        color: '#00d4ff',
        position: { x: 'center', y: '15%' },
      },
      {
        type: 'placeholder',
        placeholderType: 'product-image',
        position: { x: 'center', y: '50%' },
        size: { width: '70%', height: '50%' },
      },
      {
        type: 'text',
        content: 'JUST DROPPED',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '85%' },
      },
    ],
  },
  {
    id: 'holiday-promo',
    name: 'Holiday Sale',
    category: 'seasonal',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#1e3a5f', '#2d5a87'],
      },
      {
        type: 'text',
        content: '🎄 HOLIDAY SALE 🎄',
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: '25% OFF',
        fontSize: 96,
        fontWeight: 'bold',
        color: '#ffd700',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: 'Everything Storewide',
        fontSize: 28,
        color: '#ffffff',
        position: { x: 'center', y: '65%' },
      },
      {
        type: 'text',
        content: 'Use code: HOLIDAY25',
        fontSize: 24,
        fontWeight: '600',
        color: '#00d4ff',
        position: { x: 'center', y: '80%' },
      },
    ],
  },
  {
    id: 'testimonial',
    name: 'Customer Review',
    category: 'social-proof',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'solid',
        color: '#ffffff',
      },
      {
        type: 'text',
        content: '⭐⭐⭐⭐⭐',
        fontSize: 36,
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: '"Best purchase I\'ve ever made!"',
        fontSize: 32,
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#333333',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: '— Happy Customer',
        fontSize: 20,
        color: '#666666',
        position: { x: 'center', y: '65%' },
      },
    ],
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale',
    category: 'promotions',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#000000', '#1a1a1a'],
      },
      {
        type: 'text',
        content: '⚡ FLASH SALE ⚡',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffcc00',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: '24 HOURS ONLY',
        fontSize: 28,
        fontWeight: '600',
        color: '#ff4444',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: 'SHOP NOW',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '75%' },
        style: {
          background: '#ff4444',
          padding: '12px 32px',
          borderRadius: '8px',
        },
      },
    ],
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    category: 'products',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#f8f9fa', '#e9ecef'],
      },
      {
        type: 'placeholder',
        placeholderType: 'product-image',
        position: { x: 'center', y: '40%' },
        size: { width: '80%', height: '60%' },
      },
      {
        type: 'text',
        content: 'Product Name',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#212529',
        position: { x: 'center', y: '80%' },
      },
      {
        type: 'text',
        content: '$99.99',
        fontSize: 28,
        fontWeight: '600',
        color: '#28a745',
        position: { x: 'center', y: '90%' },
      },
    ],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    category: 'announcements',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#667eea', '#764ba2'],
      },
      {
        type: 'text',
        content: 'COMING SOON',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'Something exciting is on the way...',
        fontSize: 24,
        color: '#ffffff',
        opacity: 0.9,
        position: { x: 'center', y: '55%' },
      },
      {
        type: 'text',
        content: 'Stay Tuned',
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        position: { x: 'center', y: '75%' },
      },
    ],
  },
  {
    id: 'bogo',
    name: 'Buy One Get One',
    category: 'promotions',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#11998e', '#38ef7d'],
      },
      {
        type: 'text',
        content: 'BUY ONE',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '30%' },
      },
      {
        type: 'text',
        content: 'GET ONE',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: 'FREE',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffff00',
        position: { x: 'center', y: '65%' },
      },
      {
        type: 'text',
        content: 'While supplies last',
        fontSize: 18,
        color: '#ffffff',
        position: { x: 'center', y: '85%' },
      },
    ],
  },
]

// Template categories for filtering
export const templateCategories = [
  { id: 'all', label: 'All Templates' },
  { id: 'promotions', label: 'Sales & Promos' },
  { id: 'products', label: 'Products' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'social-proof', label: 'Reviews' },
  { id: 'announcements', label: 'Announcements' },
]

// Gradient presets for backgrounds
export const gradientPresets = [
  { id: 'sunset', colors: ['#ff6b6b', '#feca57'], label: 'Sunset' },
  { id: 'ocean', colors: ['#00d4ff', '#0099ff'], label: 'Ocean' },
  { id: 'forest', colors: ['#11998e', '#38ef7d'], label: 'Forest' },
  { id: 'royal', colors: ['#667eea', '#764ba2'], label: 'Royal' },
  { id: 'fire', colors: ['#f12711', '#f5af19'], label: 'Fire' },
  { id: 'midnight', colors: ['#232526', '#414345'], label: 'Midnight' },
  { id: 'cotton-candy', colors: ['#ff9a9e', '#fecfef'], label: 'Cotton Candy' },
  { id: 'emerald', colors: ['#134e5e', '#71b280'], label: 'Emerald' },
]

// Helper function to get preset by ID
export const getPresetById = (id) => platformPresets[id] || platformPresets['instagram-post']

// Helper function to get presets by category
export const getPresetsByCategory = (category) => {
  return Object.entries(platformPresets)
    .filter(([, preset]) => preset.category === category)
    .map(([id, preset]) => ({ id, ...preset }))
}

// Helper to scale canvas dimensions to fit container while maintaining aspect ratio
export const scaleToFit = (width, height, maxWidth, maxHeight) => {
  const aspectRatio = width / height
  let scaledWidth = maxWidth
  let scaledHeight = maxWidth / aspectRatio

  if (scaledHeight > maxHeight) {
    scaledHeight = maxHeight
    scaledWidth = maxHeight * aspectRatio
  }

  return {
    width: Math.round(scaledWidth),
    height: Math.round(scaledHeight),
    scale: scaledWidth / width,
  }
}

export default platformPresets

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

  // ==========================================
  // BLACK FRIDAY / CYBER MONDAY TEMPLATES
  // ==========================================
  {
    id: 'black-friday-mega',
    name: 'Black Friday Mega',
    category: 'black-friday',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'solid',
        color: '#000000',
      },
      {
        type: 'text',
        content: 'BLACK',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'FRIDAY',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffcc00',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'UP TO 70% OFF',
        fontSize: 36,
        fontWeight: '600',
        color: '#ff4444',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'SHOP NOW',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        position: { x: 'center', y: '80%' },
        style: {
          background: '#ffcc00',
          padding: '12px 32px',
          borderRadius: '4px',
        },
      },
    ],
  },
  {
    id: 'cyber-monday',
    name: 'Cyber Monday',
    category: 'black-friday',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#0a0a0a', '#1a1a3e'],
      },
      {
        type: 'text',
        content: 'CYBER MONDAY',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#00ffff',
        position: { x: 'center', y: '30%' },
      },
      {
        type: 'text',
        content: 'DEALS',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '50%' },
      },
      {
        type: 'text',
        content: 'Online Only | 24 Hours',
        fontSize: 24,
        color: '#00ffff',
        position: { x: 'center', y: '70%' },
      },
    ],
  },
  {
    id: 'black-friday-doorbusters',
    name: 'Doorbusters',
    category: 'black-friday',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#1a1a1a', '#333333'],
      },
      {
        type: 'text',
        content: 'DOORBUSTER',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ff0000',
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: 'DEALS',
        fontSize: 64,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'While Supplies Last',
        fontSize: 24,
        color: '#cccccc',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'FIRST COME, FIRST SERVED',
        fontSize: 20,
        fontWeight: '600',
        color: '#ffcc00',
        position: { x: 'center', y: '80%' },
      },
    ],
  },

  // ==========================================
  // CHRISTMAS / HOLIDAY TEMPLATES
  // ==========================================
  {
    id: 'christmas-magic',
    name: 'Christmas Magic',
    category: 'holiday',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#165B33', '#146B3A'],
      },
      {
        type: 'text',
        content: 'MERRY',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'CHRISTMAS',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffd700',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'SALE',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ff0000',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'Gift the perfect present',
        fontSize: 24,
        color: '#ffffff',
        position: { x: 'center', y: '80%' },
      },
    ],
  },
  {
    id: 'holiday-gift-guide',
    name: 'Gift Guide',
    category: 'holiday',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#c41e3a', '#8b0000'],
      },
      {
        type: 'text',
        content: 'HOLIDAY',
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: 'GIFT GUIDE',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffd700',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'Find the perfect gift',
        fontSize: 28,
        color: '#ffffff',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'SHOP NOW',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#c41e3a',
        position: { x: 'center', y: '80%' },
        style: {
          background: '#ffffff',
          padding: '12px 32px',
          borderRadius: '8px',
        },
      },
    ],
  },
  {
    id: 'new-year-sale',
    name: 'New Year Sale',
    category: 'holiday',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#000428', '#004e92'],
      },
      {
        type: 'text',
        content: 'NEW YEAR',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffd700',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'NEW DEALS',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: 'Start 2025 with savings!',
        fontSize: 24,
        color: '#ffffff',
        position: { x: 'center', y: '65%' },
      },
      {
        type: 'text',
        content: '30% OFF',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#00ff88',
        position: { x: 'center', y: '82%' },
      },
    ],
  },

  // ==========================================
  // VALENTINE'S DAY TEMPLATES
  // ==========================================
  {
    id: 'valentines-love',
    name: "Valentine's Sale",
    category: 'valentines',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#ff6b81', '#ee5a70'],
      },
      {
        type: 'text',
        content: "VALENTINE'S",
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'DAY SALE',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '42%' },
      },
      {
        type: 'text',
        content: 'Show your love with the perfect gift',
        fontSize: 22,
        color: '#ffffff',
        position: { x: 'center', y: '62%' },
      },
      {
        type: 'text',
        content: 'SHOP GIFTS',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff6b81',
        position: { x: 'center', y: '82%' },
        style: {
          background: '#ffffff',
          padding: '12px 32px',
          borderRadius: '24px',
        },
      },
    ],
  },
  {
    id: 'valentines-gifts',
    name: 'Gifts for Her/Him',
    category: 'valentines',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'solid',
        color: '#1a1a2e',
      },
      {
        type: 'text',
        content: "GIFTS THEY'LL",
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'LOVE',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ff6b81',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: "Valentine's Collection",
        fontSize: 24,
        color: '#cccccc',
        position: { x: 'center', y: '65%' },
      },
      {
        type: 'text',
        content: '20% OFF',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '82%' },
      },
    ],
  },

  // ==========================================
  // SUMMER SALE TEMPLATES
  // ==========================================
  {
    id: 'summer-vibes',
    name: 'Summer Vibes',
    category: 'summer',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#ff9a56', '#ff6b6b'],
      },
      {
        type: 'text',
        content: 'SUMMER',
        fontSize: 64,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '30%' },
      },
      {
        type: 'text',
        content: 'SALE',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffff00',
        position: { x: 'center', y: '50%' },
      },
      {
        type: 'text',
        content: 'Hot deals for hot days',
        fontSize: 24,
        color: '#ffffff',
        position: { x: 'center', y: '70%' },
      },
      {
        type: 'text',
        content: 'UP TO 50% OFF',
        fontSize: 28,
        fontWeight: '600',
        color: '#ffffff',
        position: { x: 'center', y: '85%' },
      },
    ],
  },
  {
    id: 'summer-clearance',
    name: 'Summer Clearance',
    category: 'summer',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#00b4db', '#0083b0'],
      },
      {
        type: 'text',
        content: 'END OF SUMMER',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: 'CLEARANCE',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffff00',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'Everything Must Go!',
        fontSize: 28,
        color: '#ffffff',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: '70% OFF',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ff4444',
        position: { x: 'center', y: '80%' },
      },
    ],
  },

  // ==========================================
  // BACK TO SCHOOL TEMPLATES
  // ==========================================
  {
    id: 'back-to-school',
    name: 'Back to School',
    category: 'back-to-school',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#3498db', '#2c3e50'],
      },
      {
        type: 'text',
        content: 'BACK TO',
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'SCHOOL',
        fontSize: 64,
        fontWeight: 'bold',
        color: '#ffcc00',
        position: { x: 'center', y: '42%' },
      },
      {
        type: 'text',
        content: 'SALE',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'Gear up for success!',
        fontSize: 24,
        color: '#ffffff',
        position: { x: 'center', y: '80%' },
      },
    ],
  },
  {
    id: 'school-supplies',
    name: 'School Supplies',
    category: 'back-to-school',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'solid',
        color: '#2ecc71',
      },
      {
        type: 'text',
        content: 'SCHOOL SUPPLIES',
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'BLOWOUT',
        fontSize: 64,
        fontWeight: 'bold',
        color: '#ffff00',
        position: { x: 'center', y: '45%' },
      },
      {
        type: 'text',
        content: 'Stock up & save big!',
        fontSize: 28,
        color: '#ffffff',
        position: { x: 'center', y: '65%' },
      },
      {
        type: 'text',
        content: 'STARTING AT $0.99',
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
        position: { x: 'center', y: '82%' },
      },
    ],
  },

  // ==========================================
  // CLEARANCE / FLASH SALE TEMPLATES
  // ==========================================
  {
    id: 'final-clearance',
    name: 'Final Clearance',
    category: 'promotions',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#c0392b', '#8e44ad'],
      },
      {
        type: 'text',
        content: 'FINAL',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '25%' },
      },
      {
        type: 'text',
        content: 'CLEARANCE',
        fontSize: 56,
        fontWeight: 'bold',
        color: '#ffcc00',
        position: { x: 'center', y: '42%' },
      },
      {
        type: 'text',
        content: 'LAST CHANCE TO SAVE',
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'UP TO 80% OFF',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '78%' },
      },
    ],
  },
  {
    id: 'limited-time',
    name: 'Limited Time',
    category: 'promotions',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#e74c3c', '#c0392b'],
      },
      {
        type: 'text',
        content: 'LIMITED TIME',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: 'OFFER',
        fontSize: 72,
        fontWeight: 'bold',
        color: '#ffff00',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: "Don't Miss Out!",
        fontSize: 28,
        color: '#ffffff',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'ENDS TONIGHT',
        fontSize: 24,
        fontWeight: '600',
        color: '#ffcc00',
        position: { x: 'center', y: '80%' },
      },
    ],
  },
  {
    id: 'member-exclusive',
    name: 'Member Exclusive',
    category: 'promotions',
    thumbnail: null,
    elements: [
      {
        type: 'background',
        style: 'gradient',
        colors: ['#2c3e50', '#34495e'],
      },
      {
        type: 'text',
        content: 'VIP',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffd700',
        position: { x: 'center', y: '20%' },
      },
      {
        type: 'text',
        content: 'MEMBERS ONLY',
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        position: { x: 'center', y: '40%' },
      },
      {
        type: 'text',
        content: 'EXCLUSIVE DEAL',
        fontSize: 32,
        fontWeight: '600',
        color: '#ffd700',
        position: { x: 'center', y: '60%' },
      },
      {
        type: 'text',
        content: 'Extra 15% Off',
        fontSize: 28,
        color: '#ffffff',
        position: { x: 'center', y: '80%' },
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
  { id: 'black-friday', label: 'Black Friday' },
  { id: 'holiday', label: 'Holiday' },
  { id: 'valentines', label: "Valentine's" },
  { id: 'summer', label: 'Summer' },
  { id: 'back-to-school', label: 'Back to School' },
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

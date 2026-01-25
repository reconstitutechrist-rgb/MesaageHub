# AI Studio - Documentation

## Overview

AI Studio is a marketing content creation suite within MessageHub designed to help retail businesses create professional marketing images and videos for social media platforms like TikTok, Instagram, Facebook, and more.

**Location:** Dashboard → AI Studio button (or directly via the AI Studio card)

---

## Current Status

### What's Implemented (Working Now)

| Feature                   | Status      | Description                                |
| ------------------------- | ----------- | ------------------------------------------ |
| Canvas Editor             | ✅ Complete | HTML5 canvas-based image editor            |
| Platform Templates        | ✅ Complete | Pre-sized canvases for 11 social platforms |
| Marketing Templates       | ✅ Complete | 8 pre-designed promotional layouts         |
| Background Customization  | ✅ Complete | Solid colors + gradient presets            |
| Text Overlays             | ✅ Complete | Add custom text to images                  |
| Image Upload              | ✅ Complete | Upload product photos                      |
| High-Res Export           | ✅ Complete | Export at full platform resolution         |
| Media Library Integration | ✅ Complete | Saved exports appear in Media Library      |

### What's NOT Implemented (Planned)

| Feature               | Status     | Description                       |
| --------------------- | ---------- | --------------------------------- |
| Background Removal    | 🔄 Planned | AI-powered background removal     |
| Image Enhancement     | 📋 Future  | Auto-enhance product photos       |
| AI Image Generation   | 📋 Future  | Generate images from text prompts |
| Video Creation        | 📋 Future  | Auto-generate marketing videos    |
| Direct Social Posting | 📋 Future  | Post directly to social platforms |

---

## Completed Features

### 1. Platform Templates

Pre-configured canvas sizes for each social media platform:

| Platform          | Dimensions   | Aspect Ratio | Category   |
| ----------------- | ------------ | ------------ | ---------- |
| Instagram Post    | 1080 × 1080  | 1:1          | Square     |
| Instagram Story   | 1080 × 1920  | 9:16         | Vertical   |
| TikTok            | 1080 × 1920  | 9:16         | Vertical   |
| Facebook Post     | 1200 × 628   | 1.91:1       | Horizontal |
| Facebook Story    | 1080 × 1920  | 9:16         | Vertical   |
| Facebook Square   | 1080 × 1080  | 1:1          | Square     |
| Twitter/X         | 1200 × 675   | 16:9         | Horizontal |
| YouTube Thumbnail | 1280 × 720   | 16:9         | Horizontal |
| LinkedIn          | 1200 × 627   | 1.91:1       | Horizontal |
| Pinterest         | 1000 × 1500  | 2:3          | Vertical   |
| Custom            | User-defined | Any          | Custom     |

**File:** `src/lib/platformTemplates.js`

### 2. Marketing Templates

Pre-designed layouts for common marketing use cases:

| Template         | Category      | Description                        |
| ---------------- | ------------- | ---------------------------------- |
| Sale Banner      | Promotions    | Bold "SALE - UP TO 50% OFF" layout |
| New Arrival      | Products      | "NEW - JUST DROPPED" announcement  |
| Holiday Sale     | Seasonal      | Festive design with discount code  |
| Customer Review  | Social Proof  | 5-star testimonial layout          |
| Flash Sale       | Promotions    | Urgent "24 HOURS ONLY" design      |
| Product Showcase | Products      | Clean product display with price   |
| Coming Soon      | Announcements | Teaser for upcoming products       |
| Buy One Get One  | Promotions    | BOGO promotion layout              |

**Categories:** Promotions, Products, Seasonal, Reviews, Announcements

### 3. Background Customization

**Gradient Presets:**

- Sunset (red → yellow)
- Ocean (cyan → blue)
- Forest (teal → green)
- Royal (purple → violet)
- Fire (red → orange)
- Midnight (dark gray → gray)
- Cotton Candy (pink → light pink)
- Emerald (dark teal → green)

**Solid Colors:**

- White, Black, Navy, Red, Green, Purple

### 4. Text Overlays

- Custom text input
- Positioned on canvas
- Rendered in exports
- Works with all templates

### 5. Export System

- Exports at **full platform resolution** (not preview size)
- Saves as PNG to Media Library
- Includes template elements in export
- Filename includes platform and template info

---

## AI Features - Current State

### Currently: NO REAL AI

The "Generate" button in AI Studio currently uses **mock/demo logic**:

```javascript
// Current implementation (fake AI)
const handleGenerate = async () => {
  await new Promise((r) => setTimeout(r, 2000)) // Fake delay
  setTextOverlay({
    text: prompt.includes('sale') ? 'MEGA SALE 50% OFF' : prompt.toUpperCase(),
  })
}
```

This just:

1. Waits 2 seconds (simulated processing)
2. Returns hardcoded text based on keywords

**No actual AI model is called.**

---

## Planned AI Features

### Phase 2: Background Removal (Next)

**Goal:** One-click background removal for product photos

**Planned Implementation:**

- Service: Remove.bg API ($0.20/image)
- Architecture: Supabase Edge Function (keeps API key server-side)
- Demo mode: Returns original image when no API key configured

**Files to Create:**

- `src/services/AIImageService.js` - Client service
- `supabase/functions/remove-background/index.ts` - Edge function

**User Flow:**

1. Upload product image
2. Click "Remove Background" button
3. AI removes background → transparent PNG
4. Apply new background (color/gradient)
5. Export to Media Library

### Phase 3: AI Image Enhancement (Future)

**Planned Features:**

- Auto-enhance product photos (lighting, color)
- Upscale low-resolution images
- Remove unwanted objects

**Potential APIs:**

- Replicate.com
- Stability AI
- Cloudinary

### Phase 4: AI Image Generation (Future)

**Planned Features:**

- Generate images from text prompts
- Create product variations
- Seasonal theme overlays (Christmas, Valentine's, etc.)

**Potential APIs:**

- Stability AI (Stable Diffusion)
- OpenAI DALL-E 3
- Replicate (SDXL)

### Phase 5: Video Creation (Future)

**Planned Features:**

- Auto-generate short videos from product images
- Pre-built motion templates (zoom, pan, carousel)
- Text animations
- Background music library
- Export as MP4/WebM

**Potential Implementation:**

- Client-side: FFmpeg.wasm for simple videos
- Server-side: Creatomate or Shotstack API for complex videos

---

## Technical Architecture

### Current Files

| File                                     | Purpose                                          |
| ---------------------------------------- | ------------------------------------------------ |
| `src/pages/phone/PhoneDashboardPage.jsx` | Main AI Studio component (AIStudioFullScreen)    |
| `src/lib/platformTemplates.js`           | Platform presets, marketing templates, gradients |
| `src/services/MediaLibraryService.js`    | Saves exports to media library                   |

### Key Components

```
PhoneDashboardPage.jsx
└── AIStudioFullScreen (component)
    ├── Canvas Editor
    ├── Platform Selector Modal
    ├── Template Library Modal
    ├── Background Controls
    ├── Text Overlay Controls
    └── Export Handler
```

### Data Flow

```
User Actions → Canvas State → Canvas Render → Export
                   ↓
            MediaLibraryService
                   ↓
            Supabase Storage (or localStorage demo)
```

---

## API Services Comparison

| Service           | Use Case           | Pricing           | Quality   | Ease   |
| ----------------- | ------------------ | ----------------- | --------- | ------ |
| **Remove.bg**     | Background removal | $0.20/image       | Excellent | Easy   |
| **Replicate**     | Multi-model AI     | Pay per use       | Varies    | Medium |
| **Stability AI**  | Image generation   | $0.002-0.08/image | Excellent | Medium |
| **OpenAI DALL-E** | Image generation   | $0.04-0.12/image  | Excellent | Easy   |
| **Cloudinary**    | Image optimization | Free tier         | Good      | Easy   |
| **Creatomate**    | Video generation   | $49/mo            | Excellent | Easy   |
| **Shotstack**     | Video generation   | $49/mo            | Excellent | Medium |

---

## Environment Variables (Planned)

```env
# AI Image Services (server-side only via Supabase secrets)
REMOVEBG_API_KEY=your_key_here
REPLICATE_API_TOKEN=your_key_here
STABILITY_API_KEY=your_key_here

# Video Services
CREATOMATE_API_KEY=your_key_here
```

**Note:** All AI API keys should be stored in Supabase secrets, NOT in client-side `.env` files.

---

## Testing the AI Studio

### Manual Testing Steps

1. **Platform Templates:**
   - Open AI Studio
   - Click platform selector
   - Select different platforms
   - Verify canvas resizes correctly

2. **Marketing Templates:**
   - Open Template Library
   - Select each template
   - Verify elements render on canvas

3. **Background Customization:**
   - Select solid colors
   - Select gradient presets
   - Verify background changes

4. **Export:**
   - Create content
   - Click Export
   - Verify file saves to Media Library
   - Check exported dimensions match platform

---

## Changelog

### v1.0 - Phase 1 Complete (January 2026)

- Added 11 platform presets
- Added 8 marketing templates
- Added background color/gradient picker
- Added Template Library modal
- Added high-resolution export
- Integrated with Media Library

### Upcoming

- v1.1 - Background Removal (AI)
- v1.2 - Image Enhancement (AI)
- v1.3 - Video Creation
- v2.0 - Direct Social Posting

---

## Related Documentation

- [Media Library](./MEDIA-LIBRARY.md) - Where exported content is stored
- [Birthday Automation](./BIRTHDAY-AUTOMATION.md) - Auto-send birthday messages
- [Implementation Plan](../.claude/plans/clever-jumping-steele.md) - Full technical plan

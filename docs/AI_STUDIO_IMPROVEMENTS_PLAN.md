# AI Studio Retail Marketing Improvements Plan

## Overview

Implement comprehensive retail marketing enhancements for the AI Studio, organized into 5 phases covering 16 feature areas.

---

## Phase 1: Foundation (Brand Kit + Seasonal Templates + Retail Scenes)

### 1.1 Brand Kit System

**New Files:**

- `src/features/ai-studio/store/slices/brandSlice.js` - Brand state management
- `src/features/ai-studio/components/BrandKitPanel.jsx` - Brand management UI
- `src/services/BrandKitService.js` - Supabase persistence

**Modify:**

- `src/features/ai-studio/store/index.js` - Import brandSlice
- `src/features/ai-studio/store/selectors.js` - Brand selectors
- `src/features/ai-studio/components/StudioSidebar.jsx` - Add Brand Kit section
- `src/features/ai-studio/utils/studioConstants.js` - Default brand presets

**Features:**

- Save/load brand kits (colors, fonts, logo)
- Apply brand colors to palette
- Brand-aware text defaults
- Logo quick-insert

### 1.2 Seasonal Templates

**Modify:**

- `src/lib/platformTemplates.js` - Add 20+ seasonal templates
- `src/features/ai-studio/components/modals/TemplateBrowserModal.jsx` - Seasonal category filter, date-aware suggestions

**Template Categories:**

- black-friday, cyber-monday
- christmas, holiday, new-year
- valentines, mothers-day, fathers-day
- summer-sale, back-to-school
- flash-sale, clearance

### 1.3 Product Scene Intelligence

**Modify:**

- `src/features/ai-studio/utils/studioConstants.js` - Add RETAIL_SCENARIOS presets
- `src/features/ai-studio/components/StudioSidebar.jsx` - Retail Scenarios dropdown in AI Background section
- `src/services/AIService.js` - Enhance generateBackground with retail context

**Retail Scenario Presets:**

```javascript
RETAIL_SCENARIOS: [
  { id: 'glass-shelf', prompt: 'Minimalist glass shelf with soft studio lighting' },
  { id: 'boutique-counter', prompt: 'Luxury boutique counter with marble surface' },
  { id: 'clothing-rack', prompt: 'Modern clothing rack with neutral background' },
  { id: 'product-pedestal', prompt: 'White product pedestal with gradient backdrop' },
  { id: 'lifestyle-table', prompt: 'Rustic wooden table with lifestyle props' },
  { id: 'neon-display', prompt: 'Neon-lit display case with urban aesthetic' },
]
```

### 1.4 Auto-Branding Overlays

**Modify:**

- `src/features/ai-studio/components/modals/ExportOptionsModal.jsx` - Add "Include contact overlay" checkbox
- `src/features/ai-studio/components/StudioCanvas.jsx` - Render contact overlay on export

**Features:**

- Auto-offer to overlay user's phone number on exports
- Configurable text: "Text me at [User Number]" or "DM for details"
- Position options: bottom-left, bottom-right, bottom-center
- Toggle on/off per export

---

## Phase 2: Core Retail (Promotional Elements + Cross-Platform)

### 2.1 Promotional Elements Library

**New Files:**

- `src/features/ai-studio/components/PromotionalElementsPanel.jsx` - Element picker UI
- `src/features/ai-studio/utils/promotionalElements.js` - Element definitions and renderers

**Modify:**

- `src/features/ai-studio/store/slices/layerSlice.js` - Add BADGE, COUNTDOWN, PRICE, CTA, QR_CODE layer types
- `src/features/ai-studio/components/StudioCanvas.jsx` - Render promotional elements
- `src/features/ai-studio/components/StudioSidebar.jsx` - Add Promotional Elements section

**Elements:**

- Sale badges: "50% OFF", "BOGO", "NEW", "HOT", "LIMITED"
- Countdown timer: configurable end date, auto-updates in preview
- Price display: was/now with strike-through styling
- Stock indicator: "Only X left!" with urgency colors
- CTA buttons: "Shop Now", "Buy Today", customizable

### 2.2 Personalized QR Code Generation

**New Files:**

- `src/features/ai-studio/utils/qrCodeGenerator.js` - QR code generation utility

**Modify:**

- `src/features/ai-studio/store/slices/layerSlice.js` - Add QR_CODE layer type
- `src/features/ai-studio/components/StudioCanvas.jsx` - Render QR codes
- `src/features/ai-studio/components/PromotionalElementsPanel.jsx` - QR code creator

**Features:**

- Generate QR codes that open pre-filled SMS to worker's number
- Customizable message: "Hi! I saw your promotion and want to learn more"
- QR code styling: colors, size, logo embed
- Dynamic URL support for product links

### 2.3 Smart Cross-Platform Adaptation

**New Files:**

- `src/features/ai-studio/components/modals/MultiPlatformExportModal.jsx` - Multi-select export UI
- `src/features/ai-studio/utils/crossPlatformAdapter.js` - Smart resize algorithms

**Modify:**

- `src/features/ai-studio/utils/canvasLogic.js` - Add safe zone definitions per platform
- `src/features/ai-studio/components/modals/ExportOptionsModal.jsx` - Link to multi-platform export

**Features:**

- One-click multi-platform: "Instagram Post + TikTok Story + Facebook" in one export
- Smart text scaling per aspect ratio
- Safe zone awareness (no text in crop zones)
- Batch download as ZIP or individual files
- Preview carousel showing all adaptations

### 2.4 Interactive Design Remixing

**Modify:**

- `src/features/ai-studio/store/slices/uiSlice.js` - Add remixDesign action
- `src/features/ai-studio/components/modals/TemplateBrowserModal.jsx` - "Remix current design" mode

**Features:**

- Convert existing design to different template style with one click
- "New Arrival" → "Flash Sale" → "Last Chance" template swapping
- Preserve product image and core content
- Apply new template's colors, typography, and layout

---

## Phase 3: Advanced AI (Subject Manipulation + Object Removal)

### 3.1 Intelligent Subject Re-Lighting

**Modify:**

- `src/services/AIService.js` - Enhance autoLevel with lighting simulation
- `supabase/functions/ai-studio/index.ts` - Advanced re-lighting endpoint
- `src/features/ai-studio/components/StudioSidebar.jsx` - Lighting preset selector

**Features:**

- Simulate background lighting on product subject
- Presets: "Sunset glow", "Studio soft", "Neon accent", "Natural daylight"
- Match product shadows to background direction
- Color temperature adjustment

### 3.2 AI Object Removal

**New Files:**

- `src/features/ai-studio/components/ObjectRemovalPanel.jsx` - Brush-based selection UI

**Modify:**

- `src/services/AIService.js` - Add removeObjects endpoint
- `supabase/functions/ai-studio/index.ts` - Object removal with inpainting
- `src/features/ai-studio/components/StudioSidebar.jsx` - Object removal tool

**Features:**

- Remove distracting retail elements from photos:
  - Price tags and stickers
  - Security sensors
  - Messy store shelves in background
  - Other customers/workers
- Brush or lasso selection tool
- AI inpainting to fill removed areas

### 3.3 Multi-Variant A/B Generation

**New Files:**

- `src/features/ai-studio/components/modals/VariantGeneratorModal.jsx` - Variant creation UI
- `src/features/ai-studio/store/slices/variantSlice.js` - Variant state management

**Modify:**

- `src/features/ai-studio/store/slices/aiSlice.js` - Add variant generation actions
- `src/services/AIService.js` - Batch headline generation
- `src/features/ai-studio/components/StudioHeader.jsx` - Variants button

**Features:**

- Generate 3-5 headline variations from AI
- Color scheme variations (complementary palettes)
- Side-by-side comparison grid
- Export as variant set (design-A, design-B)

---

## Phase 4: Workflow & Pipeline

### 4.1 Direct Retail-to-Campaign Pipeline

**Modify:**

- `src/features/ai-studio/components/StudioHeader.jsx` - Add "Send as SMS" button
- `src/features/ai-studio/AIStudio.jsx` - Direct campaign integration
- `src/features/ai-studio/components/modals/ExportOptionsModal.jsx` - "Send Now" option

**Features:**

- "Send as SMS" button in header - skips Media Library
- Opens ComposeModal with design already attached
- One-tap export → compose → send workflow
- Recent contacts quick-select

### 4.2 Quick-Access Media Trays

**Modify:**

- `src/features/ai-studio/components/StudioSidebar.jsx` - Recent designs horizontal scroll
- `src/features/ai-studio/components/StudioMobileControls.jsx` - Quick media tray

**Features:**

- Horizontal scroll of 10 most recent exported designs
- One-tap to load previous design as starting point
- Thumbnail previews with date/platform labels
- "Start from this" quick action

### 4.3 Mobile Haptic Feedback

**New Files:**

- `src/features/ai-studio/utils/haptics.js` - Haptic feedback utility wrapper

**Modify:**

- `src/features/ai-studio/components/StudioCanvas.jsx` - Haptic on layer snap
- `src/features/ai-studio/components/StudioSidebar.jsx` - Haptic on AI generation complete
- `src/features/ai-studio/components/VideoGenerationPanel.jsx` - Haptic on video ready

**Haptic Events:**

- Layer snaps to center/edge alignment
- AI generation completes (copy, background, video)
- Export completes
- Error occurs (different pattern)

### 4.4 Performance Analytics Dashboard

**New Files:**

- `src/features/ai-studio/components/AnalyticsPanel.jsx` - Inline analytics widget

**Modify:**

- `src/services/AnalyticsService.js` - Add design performance queries
- `src/features/ai-studio/components/modals/TemplateBrowserModal.jsx` - Performance badges

**Features:**

- Engagement metrics by template
- Top performing color schemes
- Performance badges on templates ("4.2% CTR")

---

## Phase 5: Commerce (Product Tagging)

### 5.1 Product Tagging / Shoppable Content

**New Files:**

- `src/features/ai-studio/components/ProductTaggingPanel.jsx` - Product tag UI
- `src/services/ProductCatalogService.js` - Product data management
- `src/features/ai-studio/store/slices/productSlice.js` - Product state

**Modify:**

- `src/features/ai-studio/store/slices/layerSlice.js` - Add PRODUCT_TAG layer type
- `src/features/ai-studio/components/StudioCanvas.jsx` - Render product hotspots
- `src/features/ai-studio/components/modals/ExportOptionsModal.jsx` - Export with product metadata
- `src/services/TwilioService.js` - Include product links in campaigns

**Features:**

- Add product hotspots to images
- Product metadata: name, SKU, price, URL
- Export JSON with product data alongside image
- Product links included in campaign messages

---

## Database Schema Additions

```sql
-- Brand kits table
CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  colors JSONB NOT NULL,
  fonts JSONB NOT NULL,
  logo_url TEXT,
  contact_overlay_text TEXT DEFAULT 'Text me at',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product catalog
CREATE TABLE product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2),
  product_url TEXT,
  image_url TEXT
);

-- Design variants for A/B tracking
CREATE TABLE design_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES design_projects(id),
  variant_label TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Order

**Phase 1 (Foundation):**

1. brandSlice.js + BrandKitPanel.jsx + BrandKitService.js
2. Seasonal templates in platformTemplates.js
3. Retail scenarios in studioConstants.js + AI Background integration
4. Auto-branding overlay in ExportOptionsModal.jsx

**Phase 2 (Core Retail):** 5. Promotional layer types (BADGE, COUNTDOWN, PRICE, QR_CODE) 6. PromotionalElementsPanel.jsx + qrCodeGenerator.js 7. crossPlatformAdapter.js + MultiPlatformExportModal.jsx 8. Design remixing in TemplateBrowserModal.jsx

**Phase 3 (Advanced AI):** 9. Enhanced autoLevel with re-lighting 10. ObjectRemovalPanel.jsx + AI inpainting endpoint 11. VariantGeneratorModal.jsx + batch generation

**Phase 4 (Workflow):** 12. "Send as SMS" direct pipeline in StudioHeader.jsx 13. Quick-access media trays in StudioSidebar.jsx 14. haptics.js + Capacitor Haptics integration 15. AnalyticsPanel.jsx

**Phase 5 (Commerce):** 16. productSlice.js + ProductTaggingPanel.jsx

---

## Verification Plan

**Phase 1:**

- Create and apply a brand kit
- Use a retail scenario background preset
- Export with auto-contact overlay
- Browse seasonal templates

**Phase 2:**

- Add sale badge, countdown timer, and QR code to design
- Export same design to 3 platforms at once
- Remix a "New Arrival" design into "Flash Sale"

**Phase 3:**

- Apply sunset re-lighting to a product photo
- Remove a price tag from a product image
- Generate 5 headline variants

**Phase 4:**

- Use "Send as SMS" to send design directly
- Load a recent design from quick-access tray
- Feel haptic feedback on layer snap (mobile)

**Phase 5:**

- Add product tags to a design
- Export with product metadata
- Send campaign with shoppable links

---

## Summary

| Phase     | Features                                                    | New Files        | Modified Files       |
| --------- | ----------------------------------------------------------- | ---------------- | -------------------- |
| 1         | Brand Kit, Seasonal Templates, Retail Scenes, Auto-Branding | 3                | 6                    |
| 2         | Promo Elements, QR Codes, Cross-Platform, Design Remix      | 3                | 6                    |
| 3         | Re-Lighting, Object Removal, A/B Variants                   | 3                | 5                    |
| 4         | Direct Send, Media Trays, Haptics, Analytics                | 2                | 7                    |
| 5         | Product Tagging                                             | 3                | 4                    |
| **Total** | **16 Features**                                             | **14 New Files** | **28 Modifications** |

# Phase 5: Commerce — Product Tagging / Shoppable Content

## Overview

Add product tagging to AI Studio designs, allowing users to place product hotspots on images with metadata (name, SKU, price, URL). Product data is included in exports and campaign messages for shoppable content.

---

## New Files (3)

### 1. `src/features/ai-studio/store/slices/productSlice.js`

Product state management slice following existing slice patterns (brandSlice, variantSlice).

**State:**
```javascript
{
  productCatalog: [],          // Array of saved products
  isLoadingCatalog: false,
  catalogError: null,
}
```

**Actions:**
- `setProductCatalog(products)` — set full catalog
- `addProduct(product)` — add to catalog
- `updateProduct(productId, updates)` — update product
- `removeProduct(productId)` — remove from catalog
- `loadProductCatalog(userId)` — async: fetch from ProductCatalogService
- `saveProduct(userId, product)` — async: persist via ProductCatalogService
- `deleteProduct(userId, productId)` — async: delete via ProductCatalogService
- `setCatalogLoading(bool)` / `setCatalogError(err)` — loading states
- `resetProductState()` — clear all product state

### 2. `src/services/ProductCatalogService.js`

CRUD service for product catalog, following existing service patterns (BrandKitService, DesignProjectService) with mock fallback when Supabase is not configured.

**Methods:**
- `listProducts(userId)` → `{ success, data: Product[] }`
- `createProduct(userId, product)` → `{ success, data: Product }`
- `updateProduct(userId, productId, updates)` → `{ success, data: Product }`
- `deleteProduct(userId, productId)` → `{ success }`

**Product shape:**
```javascript
{
  id: 'uuid',
  name: 'Product Name',
  sku: 'SKU-001',
  price: 29.99,
  productUrl: 'https://...',
  imageUrl: 'https://...',
}
```

### 3. `src/features/ai-studio/components/ProductTaggingPanel.jsx`

Sidebar panel UI for managing product tags on the canvas. Follows the collapsible panel pattern (AnalyticsPanel, BrandKitPanel).

**Sections:**
1. **Product Catalog** — list of saved products, "Add Product" form (name, SKU, price, URL)
2. **Add Tag to Canvas** — select a product from catalog, click to add a PRODUCT_TAG layer at default position
3. **Active Tags** — list of product-tag layers currently on canvas with remove buttons

**Imports:** `usePhoneTheme`, `StudioIcons`, product selectors, layer actions

---

## Modified Files (8)

### 4. `src/features/ai-studio/utils/promotionalElements.js`

**Add:**
- `PRODUCT_TAG` to `PromotionalElementType` enum
- `DEFAULT_PRODUCT_TAG` defaults object:
```javascript
export const DEFAULT_PRODUCT_TAG = {
  type: PromotionalElementType.PRODUCT_TAG,
  productId: null,
  productName: '',
  productPrice: null,
  productUrl: '',
  productSku: '',
  dotColor: '#3b82f6',
  tooltipBg: '#1a1a2e',
  tooltipTextColor: '#ffffff',
  fontSize: 12,
  x: 50,
  y: 50,
  rotation: 0,
  opacity: 1,
}
```
- Add `PRODUCT_TAG: 'commerce'` to `getElementCategory()`
- Add `PRODUCT_TAG` case to `createElementFromPreset()`
- Add `DEFAULT_PRODUCT_TAG` to default export object

### 5. `src/features/ai-studio/store/slices/layerSlice.js`

**Add:**
- `PRODUCT_TAG: 'product-tag'` to `LayerType` enum
- Import `DEFAULT_PRODUCT_TAG` from promotionalElements
- `createProductTagLayer(overrides)` factory function (pattern matches createBadgeLayer)
- `addProductTagLayer(product, options)` store action
- Add `PRODUCT_TAG` cases to `createPromotionalLayer()` switch
- Add `LayerType.PRODUCT_TAG` to the `positionableTypes` array in `duplicateLayer()`

### 6. `src/lib/canvasUtils.js`

**Add:**
- `drawProductTag(ctx, layer, canvasWidth, canvasHeight)` function:
  - Draws a colored dot at (x, y) position
  - Draws a small tooltip card below/beside the dot with product name and price
  - Uses rounded rect for tooltip with drop shadow
- Add `case 'product-tag':` to `drawPromotionalLayer()` switch

### 7. `src/features/ai-studio/components/StudioCanvas.jsx`

**Modify:**
- Add `'product-tag'` to both `promotionalTypes` arrays (display at line 162, export at line 459)

### 8. `src/features/ai-studio/store/index.js`

**Add:**
- Import `createProductSlice` from `./slices/productSlice`
- Spread `...createProductSlice(...args)` in store composition
- Add `state.resetProductState()` to `resetAll()`

### 9. `src/features/ai-studio/store/selectors.js`

**Add product selectors:**
- `useProductCatalog` — catalog array
- `useIsLoadingCatalog` — loading state
- `useCatalogError` — error state
- `useProductTagLayers` — memoized filter of layers with type 'product-tag'
- `useProductActions` — action hook with useShallow for product slice actions
- Add `addProductTagLayer` to `useLayerActions`

### 10. `src/features/ai-studio/components/StudioSidebar.jsx`

**Add:**
- Import `ProductTaggingPanel`
- Render `<ProductTaggingPanel />` after `<PromotionalElementsPanel />` (around line 340)

### 11. `src/features/ai-studio/AIStudio.jsx`

**Modify `handleSendAsCampaign`:**
- After exporting dataUrl, extract product tag layers from store
- Build product metadata array: `[{ name, price, url, sku }]`
- Pass both `dataUrl` and `productMetadata` to `onSendAsCampaign` callback:
  ```javascript
  onSendAsCampaign?.(dataUrl, { productTags })
  ```

**Modify `handleDownload`:**
- After download, also generate a product metadata JSON if product tags exist
- Optional: log product metadata to console or expose via `onExport` callback

---

## Implementation Order

1. **promotionalElements.js** — Add PRODUCT_TAG type and defaults
2. **layerSlice.js** — Add layer type, factory, store action
3. **canvasUtils.js** — Add drawProductTag rendering
4. **StudioCanvas.jsx** — Add 'product-tag' to promotionalTypes arrays
5. **ProductCatalogService.js** — Create service with mock fallback
6. **productSlice.js** — Create store slice
7. **store/index.js** — Wire up productSlice
8. **selectors.js** — Add product selectors and actions
9. **ProductTaggingPanel.jsx** — Create UI panel
10. **StudioSidebar.jsx** — Integrate panel
11. **AIStudio.jsx** — Add product metadata to export/campaign flow

---

## Verification

1. **Canvas Rendering:** Add a product tag layer → dot + tooltip visible on canvas at correct position
2. **Layer Operations:** Select, drag, duplicate, delete product tag layers work correctly
3. **Export:** Export image with product tags → tags render at full resolution
4. **Product Catalog:** Add/edit/remove products in catalog persists (mock mode)
5. **Campaign Integration:** Send as Campaign includes product metadata in callback
6. **Sidebar:** ProductTaggingPanel appears between Promotional Elements and AI Magic
7. **Build:** `npm run lint` and `npm run build` pass with zero errors

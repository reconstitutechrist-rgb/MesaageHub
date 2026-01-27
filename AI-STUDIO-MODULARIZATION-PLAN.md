# AI Studio 2.0 - Phase 0: Modularization Plan

## Overview

Decompose the ~3445 line `PhoneDashboardPage.jsx` into a modular `features/ai-studio` architecture with centralized theme provider, preparing for Gemini 3 integration and 1M+ user scale.

---

## Critical Files to Modify

| File                                     | Current Lines | Action                                   |
| ---------------------------------------- | ------------- | ---------------------------------------- |
| `src/pages/phone/PhoneDashboardPage.jsx` | 3445          | Extract AIStudioFullScreen (~2200 lines) |
| `src/hooks/useLayerManager.js`           | 379           | Add undo/redo history stack              |
| `src/hooks/useCanvasEditor.js`           | 620           | Integrate with new theme provider        |
| `src/lib/canvasUtils.js`                 | 328           | Consolidate template drawing             |
| NEW: `src/context/ThemeContext.jsx`      | ~80           | Create theme provider with CSS vars      |
| NEW: `src/features/ai-studio/*`          | ~1800         | New modular architecture                 |

---

## Step 1: Create Theme Provider

**File:** `src/context/ThemeContext.jsx`

```jsx
// Migrate from inline t.accent pattern to CSS variables
// - Define 4 themes (cyanDark, purpleDark, cyanLight, purpleLight)
// - Inject CSS custom properties on :root
// - Sync with localStorage (app-settings.appearance.colorTheme)
// - Handle cross-tab sync via storage events
```

**CSS Variables to create:**

- `--theme-bg`, `--theme-card-bg`, `--theme-card-border`
- `--theme-accent`, `--theme-accent-glow`
- `--theme-gradient-start`, `--theme-gradient-end`
- `--theme-text`, `--theme-text-muted`
- `--theme-search-bg`, `--theme-nav-bg`
- `--theme-is-dark` (for conditional JS checks)

**Integration pattern:**

```jsx
// Before: style={{ background: t.cardBg, color: t.text }}
// After: className="bg-[var(--theme-card-bg)] text-[var(--theme-text)]"
// Or Tailwind theme extension for semantic classes
```

---

## Step 2: Create Feature Directory Structure

```
src/features/ai-studio/
├── index.js                    # Barrel export
├── AIStudio.jsx                # Main container (orchestrator)
├── components/
│   ├── StudioCanvas.jsx        # Pure canvas rendering
│   ├── StudioHeader.jsx        # Export controls, platform selector
│   ├── StudioSidebar.jsx       # Desktop: Left sidebar controls
│   ├── StudioLayersPanel.jsx   # Right sidebar: layers management
│   ├── StudioMobileControls.jsx # Mobile tabbed interface
│   ├── modals/
│   │   ├── ExportOptionsModal.jsx
│   │   ├── TemplateBrowserModal.jsx
│   │   └── PlatformPickerModal.jsx
├── hooks/
│   ├── useStudioState.js       # Combined state management
│   └── useCanvasRenderer.js    # Canvas draw logic only
└── utils/
    └── studioConstants.js      # Colors, tab configs, etc.
```

---

## Step 3: Extract StudioCanvas Component

**Purpose:** Pure canvas rendering, zero UI controls

**Props:**

```typescript
interface StudioCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>
  width: number
  height: number
  background: { type: 'solid' | 'gradient'; value: string | string[] }
  image: HTMLImageElement | null
  layers: Layer[]
  selectedLayerId: string | null
  activeTemplate: MarketingTemplate | null
  showGrid: boolean
  onLayerClick: (layerId: string, position: { x: number; y: number }) => void
  onLayerDrag: (layerId: string, newPosition: { x: number; y: number }) => void
}
```

**Responsibilities:**

- Canvas initialization and sizing
- Background rendering (solid/gradient/default)
- Template elements rendering
- Image rendering (centered, scaled)
- Text layers rendering with shadows
- Selection indicators
- Grid overlay when empty
- Mouse/touch event handling for layer interaction

**Source extraction:** Lines 690-846 of PhoneDashboardPage.jsx

---

## Step 4: Extract StudioSidebar Component (Desktop)

**Purpose:** All desktop left-panel controls

**Sections to extract:**

1. **Media Upload** (Lines 1121-1190) - File input + drag zone
2. **AI Magic** (Lines 1191-1275) - Prompt input + generate
3. **Templates Preview** (Lines 1276-1380) - 4 template cards
4. **Background Colors** (Lines 1381-1480) - Solid + gradient presets
5. **Text Overlay Controls** (Lines 1481-1573) - Text input, colors, size

**Props:**

```typescript
interface StudioSidebarProps {
  // Upload
  onImageUpload: (file: File) => void
  hasImage: boolean

  // AI
  prompt: string
  onPromptChange: (value: string) => void
  onGenerate: () => void
  isGenerating: boolean

  // Templates
  templates: MarketingTemplate[]
  activeTemplateId: string | null
  onTemplateSelect: (template: MarketingTemplate) => void
  onOpenTemplateLibrary: () => void

  // Background
  background: BackgroundState
  onBackgroundChange: (bg: BackgroundState) => void

  // Text
  textOverlay: TextOverlayState
  onTextChange: (updates: Partial<TextOverlayState>) => void
}
```

---

## Step 5: Extract StudioLayersPanel Component

**Purpose:** Right sidebar layers management

**Source:** Lines 2119-2323 of PhoneDashboardPage.jsx

**Props:**

```typescript
interface StudioLayersPanelProps {
  layers: Layer[]
  selectedLayerId: string | null
  onSelectLayer: (id: string) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDeleteLayer: (id: string) => void
  onAddTextLayer: () => void
  onDuplicateLayer: (id: string) => void

  // Quick actions
  onResize: () => void
  onReset: () => void
}
```

---

## Step 6: Extract StudioMobileControls Component

**Purpose:** Mobile tabbed control panel

**Source:** Lines 1708-2115 of PhoneDashboardPage.jsx

**Tabs:**

- Upload (file input)
- AI (prompt + generate)
- Text (input, colors, size)
- Templates (category + grid)
- Size (platform picker)

**Note:** Most logic shared with StudioSidebar, just different layout. Consider shared hooks.

---

## Step 7: Extract Modal Components

### ExportOptionsModal

**Source:** Lines 2326-2435
**Props:** `onDownload`, `onSendAsCampaign`, `onContinueEditing`, `isOpen`, `onClose`

### TemplateBrowserModal

**Source:** Lines 2437-2620
**Props:** `templates`, `categories`, `onSelect`, `isOpen`, `onClose`

### PlatformPickerModal

**Source:** Lines 2622-2791
**Props:** `presets`, `selectedPlatformId`, `onSelect`, `isOpen`, `onClose`

---

## Step 8: Create useStudioState Hook

**Purpose:** Centralized state management for AIStudio

```typescript
function useStudioState(options: { defaultPlatform?: string }) {
  // Platform & Canvas
  const [platform, setPlatform] = useState(options.defaultPlatform)
  const [canvasSize, setCanvasSize] = useState({ width, height })

  // Background
  const [background, setBackground] = useState({ type: 'solid', value: '#000' })

  // Image
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  // Templates
  const [activeTemplate, setActiveTemplate] = useState<MarketingTemplate | null>(null)

  // AI
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Modals
  const [modals, setModals] = useState({
    export: false,
    templates: false,
    platforms: false,
  })

  // Layer management (from useLayerManager)
  const layerManager = useLayerManager()

  return {
    platform,
    setPlatform,
    canvasSize,
    setCanvasSize,
    background,
    setBackground,
    image,
    setImage,
    activeTemplate,
    applyTemplate,
    clearTemplate,
    prompt,
    setPrompt,
    isGenerating,
    modals,
    openModal,
    closeModal,
    ...layerManager,
  }
}
```

---

## Step 9: Add Undo/Redo to useLayerManager

**Modify:** `src/hooks/useLayerManager.js`

```javascript
// Add history stack with 50-state limit
const [history, setHistory] = useState([])
const [historyIndex, setHistoryIndex] = useState(-1)
const HISTORY_LIMIT = 50

// Wrap all state mutations to push to history
const pushHistory = (newLayers) => {
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(newLayers)
  if (newHistory.length > HISTORY_LIMIT) {
    newHistory.shift()
  }
  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)
}

// Add undo/redo functions
const undo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(historyIndex - 1)
    setLayers(history[historyIndex - 1])
  }
}

const redo = () => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(historyIndex + 1)
    setLayers(history[historyIndex + 1])
  }
}

// Return: { ...existing, undo, redo, canUndo, canRedo }
```

---

## Step 10: Create Design Persistence (Supabase)

**Migration:** Create `design_projects` table

```sql
CREATE TABLE design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Design',
  platform_preset TEXT NOT NULL,
  layers JSONB NOT NULL,
  background JSONB NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's projects list
CREATE INDEX idx_design_projects_user ON design_projects(user_id, updated_at DESC);

-- RLS policies
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own projects" ON design_projects
  FOR ALL USING (auth.uid() = user_id);
```

**Service:** `src/services/DesignProjectService.js`

```javascript
class DesignProjectService {
  async saveProject(projectData) {
    // Upsert project with JSONB layers
    // Generate thumbnail via canvas export (small)
  }

  async loadProject(projectId) {
    // Fetch and hydrate layers
  }

  async listProjects(userId, { limit, offset }) {
    // Paginated project list
  }

  async deleteProject(projectId) {
    // Soft delete or hard delete
  }
}
```

---

## Step 11: Wire Up Main AIStudio Orchestrator

**File:** `src/features/ai-studio/AIStudio.jsx`

```jsx
export function AIStudio({ onClose, onExport, onSendAsCampaign }) {
  const { theme } = useTheme() // From new ThemeContext
  const isMobile = useWindowSize().width < 768
  const state = useStudioState({ defaultPlatform: 'instagram-post' })
  const canvasRef = useRef(null)

  // Render canvas via dedicated hook
  useCanvasRenderer(canvasRef, {
    width: state.canvasSize.width,
    height: state.canvasSize.height,
    background: state.background,
    image: state.image,
    layers: state.sortedLayers,
    activeTemplate: state.activeTemplate,
  })

  return (
    <div className="fixed inset-0 z-50 bg-[var(--theme-bg)]">
      <StudioHeader
        platform={state.platform}
        onPlatformChange={state.setPlatform}
        onExport={handleExport}
        onClose={onClose}
      />

      <div className="flex h-[calc(100%-60px)]">
        {!isMobile && <StudioSidebar {...sidebarProps} />}

        <StudioCanvas ref={canvasRef} {...canvasProps} />

        {!isMobile && <StudioLayersPanel {...layersPanelProps} />}
      </div>

      {isMobile && <StudioMobileControls {...mobileProps} />}

      {/* Modals */}
      <ExportOptionsModal {...exportModalProps} />
      <TemplateBrowserModal {...templatesModalProps} />
      <PlatformPickerModal {...platformModalProps} />
    </div>
  )
}
```

---

## Step 12: Update PhoneDashboardPage

**After extraction:**

```jsx
// src/pages/phone/PhoneDashboardPage.jsx
// Reduced from 3445 lines to ~1200 lines

import { AIStudio } from '@/features/ai-studio'

export default function PhoneDashboardPage() {
  const { theme } = useTheme()
  const [showAIStudio, setShowAIStudio] = useState(false)
  // ... other dashboard state

  return (
    <div>
      {/* Dashboard content */}

      {showAIStudio && (
        <AIStudio
          onClose={() => setShowAIStudio(false)}
          onExport={handleExport}
          onSendAsCampaign={handleSendAsCampaign}
        />
      )}
    </div>
  )
}
```

---

## Implementation Order

1. **Create ThemeContext** - Foundation for all styling
2. **Create feature directory structure** - Scaffold files
3. **Extract StudioCanvas** - Core rendering component
4. **Extract modals** - Low-dependency components
5. **Extract StudioSidebar** - Desktop controls
6. **Extract StudioLayersPanel** - Layers UI
7. **Extract StudioMobileControls** - Mobile UI
8. **Create useStudioState** - Centralized state
9. **Add undo/redo to useLayerManager** - History stack
10. **Create AIStudio orchestrator** - Wire everything together
11. **Update PhoneDashboardPage** - Use new AIStudio
12. **Create design persistence** - Supabase JSONB storage
13. **Test all flows** - Verify nothing regressed

---

## Verification Checklist

After each step, verify:

- [ ] Canvas rendering works (background, image, text layers)
- [ ] Layer selection and dragging works
- [ ] Text overlay editing works
- [ ] Platform presets apply correctly
- [ ] Templates render properly
- [ ] AI generation works (mock responses)
- [ ] Export at full resolution works
- [ ] Save to media library works
- [ ] Mobile controls function
- [ ] Theme switching works
- [ ] Cross-tab theme sync works
- [ ] Undo/redo works (after step 9)
- [ ] Project save/load works (after step 12)

---

## Risk Mitigations

| Risk                               | Mitigation                                                         |
| ---------------------------------- | ------------------------------------------------------------------ |
| Breaking canvas coordinate scaling | Keep display/export size calculation logic centralized in one util |
| Theme regression                   | Create theme migration test page showing all UI states             |
| Mobile responsiveness breaks       | Test on actual devices, not just DevTools                          |
| Layer z-index issues               | Keep sortedLayers logic unchanged, just move to new location       |
| Template rendering inconsistency   | Consolidate drawing code in canvasUtils.js before extraction       |

---

## Estimated Component Sizes (After Refactor)

| Component                        | Estimated Lines |
| -------------------------------- | --------------- |
| ThemeContext.jsx                 | 80              |
| AIStudio.jsx                     | 200             |
| StudioCanvas.jsx                 | 250             |
| StudioHeader.jsx                 | 100             |
| StudioSidebar.jsx                | 350             |
| StudioLayersPanel.jsx            | 200             |
| StudioMobileControls.jsx         | 400             |
| ExportOptionsModal.jsx           | 80              |
| TemplateBrowserModal.jsx         | 150             |
| PlatformPickerModal.jsx          | 150             |
| useStudioState.js                | 150             |
| useCanvasRenderer.js             | 100             |
| **Total new code**               | ~2,210          |
| **PhoneDashboardPage (reduced)** | ~1,200          |

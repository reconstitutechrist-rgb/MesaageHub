# AI Studio 2.0 - Phase 1: Core AI Intelligence Layer (Gemini 3 Migration)

## Phase 0 Status: ✅ COMPLETED

All modularization work completed and reviewed:

- Theme provider created (`src/context/PhoneThemeContext.jsx`)
- Feature directory structure (`src/features/ai-studio/`)
- All components extracted: StudioCanvas, StudioHeader, StudioSidebar, StudioLayersPanel, StudioMobileControls
- All modals extracted: ExportOptionsModal, TemplateBrowserModal, PlatformPickerModal
- State management: useStudioState hook created
- Undo/redo added to `useLayerManager.js`
- Design persistence: Supabase migration + DesignProjectService
- Build passes successfully

---

## Phase 1 Goal

Future-proof the intelligence engine before the **March 3, 2026 retirement of Gemini 2.0**.

### Key Architectural Changes

1. **Edge Function Transition** - Move all AI orchestration to Supabase Edge Functions
   - Protect API keys (no client-side exposure)
   - Offload heavy processing from client devices
   - Enable server-side rate limiting and caching

2. **Model Selection Strategy**:
   - **Gemini 3 Pro** - Deep multimodal analysis
     - "Watch" uploaded videos for scene extraction
     - "See" uploaded images for metadata (lighting, subject, material)
   - **Gemini 3 Flash** - High-speed agentic reasoning
     - Copy generation
     - Typography placement calculations
     - Quick iterations

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AIStudio → useStudioState → AIServiceClient         │   │
│  │                    ↓                                │   │
│  │           fetch('/functions/v1/ai-studio')          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ supabase/functions/ai-studio/index.ts               │   │
│  │   ├── POST /generate-copy    → Gemini 3 Flash       │   │
│  │   ├── POST /analyze-image    → Gemini 3 Pro         │   │
│  │   └── POST /analyze-video    → Gemini 3 Pro         │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Google Gemini 3 API (server-side, key protected)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Create Supabase Edge Function

**File:** `supabase/functions/ai-studio/index.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)

// Models
const flashModel = genAI.getGenerativeModel({ model: 'gemini-3-flash' })
const proModel = genAI.getGenerativeModel({ model: 'gemini-3-pro' })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { action, payload } = await req.json()

  switch (action) {
    case 'generate-copy':
      return handleGenerateCopy(payload)
    case 'analyze-image':
      return handleAnalyzeImage(payload)
    case 'analyze-video':
      return handleAnalyzeVideo(payload)
    default:
      return new Response('Unknown action', { status: 400 })
  }
})
```

### Step 2: Implement Copy Generation (Gemini 3 Flash)

```typescript
async function handleGenerateCopy({ prompt, imageBase64, context }) {
  const systemPrompt = `You are a marketing copywriter creating content for social media.
  Generate compelling, concise marketing copy. Keep it punchy and platform-appropriate.
  Context: ${context?.platform || 'instagram'}, ${context?.tone || 'professional'}
  Return ONLY the marketing text, no explanations.`

  const parts = [systemPrompt, prompt]

  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: 'image/png',
      },
    })
  }

  const result = await flashModel.generateContent(parts)
  return new Response(
    JSON.stringify({
      text: result.response.text().trim(),
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### Step 3: Implement Image Analysis (Gemini 3 Pro)

```typescript
async function handleAnalyzeImage({ imageBase64 }) {
  const prompt = `Analyze this marketing/product image and extract:
  1. Scene metadata (lighting: natural/studio/dramatic, mood: energetic/calm/luxurious)
  2. Subject detection (product type, colors, materials)
  3. Suggested copy: headline (max 8 words), subheadline (max 15 words), CTA (max 5 words)
  4. Typography suggestions: font style (serif/sans/display), placement (top/center/bottom)

  Return as JSON:
  {
    "scene": { "lighting": "...", "mood": "...", "colors": ["..."] },
    "subject": { "type": "...", "material": "...", "primaryColor": "..." },
    "copy": { "headline": "...", "subheadline": "...", "cta": "..." },
    "typography": { "fontStyle": "...", "placement": "...", "suggestedSize": "large|medium|small" }
  }`

  const result = await proModel.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: 'image/png',
      },
    },
  ])

  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)

  return new Response(
    JSON.stringify(jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Parse failed', raw: text }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### Step 4: Implement Video Analysis (Gemini 3 Pro)

```typescript
async function handleAnalyzeVideo({ videoBase64, mimeType = 'video/mp4' }) {
  const prompt = `Watch this video and extract scene-by-scene metadata:
  1. Key moments with timestamps
  2. Scene transitions and mood changes
  3. Suggested text overlays for each key moment
  4. Overall narrative arc

  Return as JSON:
  {
    "duration": "estimated seconds",
    "keyMoments": [
      { "timestamp": "0:00", "description": "...", "suggestedText": "...", "mood": "..." }
    ],
    "narrative": "...",
    "recommendedCTA": "..."
  }`

  const result = await proModel.generateContent([
    prompt,
    { inlineData: { data: videoBase64.replace(/^data:video\/\w+;base64,/, ''), mimeType } },
  ])

  // ... similar JSON parsing
}
```

### Step 5: Update Client AIService

**File:** `src/services/AIService.js`

Replace direct Gemini SDK calls with Edge Function calls:

```javascript
class AIService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL
    this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  async generateMarketingCopy(prompt, imageBase64 = null, context = {}) {
    const response = await fetch(`${this.baseUrl}/functions/v1/ai-studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.anonKey}`,
      },
      body: JSON.stringify({
        action: 'generate-copy',
        payload: { prompt, imageBase64, context },
      }),
    })

    if (!response.ok) throw new Error('Generation failed')
    return response.json()
  }

  async analyzeImage(imageBase64) {
    const response = await fetch(`${this.baseUrl}/functions/v1/ai-studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.anonKey}`,
      },
      body: JSON.stringify({
        action: 'analyze-image',
        payload: { imageBase64 },
      }),
    })

    if (!response.ok) throw new Error('Analysis failed')
    return response.json()
  }

  async analyzeVideo(videoBase64, mimeType) {
    // Similar pattern for video
  }
}
```

### Step 6: Update useStudioState Hook

**File:** `src/features/ai-studio/hooks/useStudioState.js`

```javascript
import AIService from '@/services/AIService'

// Inside useStudioState:
const aiService = useMemo(() => new AIService(), [])

const handleGenerate = useCallback(async () => {
  if (!prompt.trim() || isGenerating) return
  setIsGenerating(true)

  try {
    const imageBase64 = imageFile ? await fileToBase64(imageFile) : null
    const result = await aiService.generateMarketingCopy(prompt, imageBase64, {
      platform: selectedPlatform,
    })

    setTextOverlay((prev) => ({ ...prev, text: result.text }))
  } catch (error) {
    console.error('Generation failed:', error)
    // Fallback to mock
    setTextOverlay((prev) => ({ ...prev, text: prompt.toUpperCase() }))
  } finally {
    setIsGenerating(false)
  }
}, [prompt, isGenerating, imageFile, selectedPlatform, aiService])

const handleAnalyzeImage = useCallback(async () => {
  if (!imageFile || isAnalyzing) return
  setIsAnalyzing(true)

  try {
    const imageBase64 = await fileToBase64(imageFile)
    const analysis = await aiService.analyzeImage(imageBase64)

    // Apply suggestions
    if (analysis.copy?.headline) {
      setTextOverlay((prev) => ({ ...prev, text: analysis.copy.headline }))
    }

    // Could also apply typography suggestions, add layers, etc.
    return analysis
  } catch (error) {
    console.error('Analysis failed:', error)
  } finally {
    setIsAnalyzing(false)
  }
}, [imageFile, isAnalyzing, aiService])
```

### Step 7: Add Supabase Edge Function Secrets

```bash
# Set the Gemini API key as an Edge Function secret
supabase secrets set GEMINI_API_KEY=your_actual_key_here
```

---

## Critical Files to Create/Modify

| File                                                  | Action     | Lines       |
| ----------------------------------------------------- | ---------- | ----------- |
| `supabase/functions/ai-studio/index.ts`               | **CREATE** | ~150        |
| `supabase/functions/_shared/cors.ts`                  | **CREATE** | ~15         |
| `src/services/AIService.js`                           | **MODIFY** | ~60 changed |
| `src/features/ai-studio/hooks/useStudioState.js`      | **MODIFY** | ~40 changed |
| `src/features/ai-studio/components/StudioSidebar.jsx` | **MODIFY** | ~15 added   |

---

## Error Handling

| Error                 | Location | User Message                              | Action                           |
| --------------------- | -------- | ----------------------------------------- | -------------------------------- |
| Edge Function 401     | Client   | "Session expired. Please refresh."        | Re-authenticate                  |
| Edge Function 429     | Server   | "Too many requests. Please wait."         | Server-side rate limit response  |
| Gemini API error      | Server   | "AI generation failed. Please try again." | Log to Supabase, return fallback |
| Invalid JSON response | Server   | Silent fallback                           | Return raw text or mock          |
| Network timeout       | Client   | "Connection timeout. Retrying..."         | Retry with exponential backoff   |

**Edge Function Error Response Format:**

```json
{
  "error": true,
  "code": "RATE_LIMITED",
  "message": "Too many requests",
  "fallback": { "text": "YOUR PROMPT HERE" }
}
```

---

## Verification Checklist

After implementation:

- [ ] `supabase functions serve` runs locally without errors
- [ ] Edge Function responds to `/generate-copy` action
- [ ] Edge Function responds to `/analyze-image` action
- [ ] Edge Function responds to `/analyze-video` action
- [ ] API key is NOT exposed in client bundle (check network tab)
- [ ] Text-only generation works via Edge Function
- [ ] Image + text generation works (multimodal)
- [ ] Image analysis returns scene metadata + copy suggestions
- [ ] Generated text appears in canvas text overlay
- [ ] Loading states show during API calls
- [ ] Error messages display appropriately
- [ ] Mobile controls also work with AI features
- [ ] Fallback works when Edge Function is unavailable
- [ ] Deploy: `supabase functions deploy ai-studio`

---

## Deployment Steps

```bash
# 1. Create the Edge Function
supabase functions new ai-studio

# 2. Set the Gemini API key secret
supabase secrets set GEMINI_API_KEY=your_actual_key

# 3. Test locally
supabase functions serve ai-studio --env-file .env.local

# 4. Deploy to production
supabase functions deploy ai-studio

# 5. Verify in Supabase dashboard
# Functions → ai-studio → Logs
```

---

## Rollback Plan

If Gemini 3 integration fails in production:

1. **Immediate**: Edge Function returns mock responses

   ```typescript
   // In catch block of each handler:
   return new Response(
     JSON.stringify({
       text: payload.prompt.toUpperCase(),
       fallback: true,
     })
   )
   ```

2. **If Edge Function fails entirely**: Client AIService detects error, uses local mock

   ```javascript
   if (!response.ok) {
     return { text: prompt.toUpperCase(), fallback: true }
   }
   ```

3. **Full rollback**: Revert to previous AIService.js with direct mock provider

---

## Security Considerations

- ✅ Gemini API key stored as Supabase Edge Function secret (never in client)
- ✅ All AI requests require valid Supabase auth token
- ✅ Rate limiting enforced at Edge Function level
- ✅ No PII sent to Gemini (only images/prompts)
- ⚠️ Consider adding request logging for abuse detection
- ⚠️ Consider adding content moderation for generated copy

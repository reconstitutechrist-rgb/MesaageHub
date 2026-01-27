// Supabase Edge Function: ai-studio
// AI orchestration for marketing copy generation and image/video analysis
// Uses Gemini 3 Pro for deep analysis, Gemini 3 Flash for fast generation
// Phase 4: Added rate limiting, usage tracking, and CDN auto-persist

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/cors.ts'

// Initialize Supabase client for rate limiting and usage tracking
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Cost estimates per API call (USD)
const COST_ESTIMATES: Record<string, number> = {
  'generate-copy': 0.0001,
  'analyze-image': 0.0005,
  'analyze-video': 0.001,
  'generate-background': 0.02,
  'remove-background': 0.05,
  'suggest-typography': 0.0001,
  'auto-level': 0.0002,
  'generate-video': 0.20,    // Average of Veo ($0.15) and Sora ($0.25)
  'get-video-status': 0,
  'render-video-overlays': 0.10
}

// Map actions to API providers
const ACTION_PROVIDERS: Record<string, string> = {
  'generate-copy': 'google',
  'analyze-image': 'google',
  'analyze-video': 'google',
  'generate-background': 'google',
  'remove-background': 'remove-bg',
  'suggest-typography': 'google',
  'auto-level': 'google',
  'generate-video': 'google', // or 'openai' depending on model
  'get-video-status': 'google',
  'render-video-overlays': 'creatomate'
}

// Actions that count toward rate limits
const RATE_LIMITED_ACTIONS = [
  'generate-background',
  'remove-background',
  'generate-video'
]

// Initialize Gemini
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
let genAI: GoogleGenerativeAI | null = null
let flashModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null
let proModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null

if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey)
  // Gemini 3 Flash for fast copy generation
  flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  // Gemini 3 Pro for deep multimodal analysis (fallback to flash if not available)
  proModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
}

interface GenerateCopyPayload {
  prompt: string
  imageBase64?: string
  context?: {
    platform?: string
    tone?: string
  }
}

interface AnalyzeImagePayload {
  imageBase64: string
}

interface AnalyzeVideoPayload {
  videoBase64: string
  mimeType?: string
}

interface GenerateBackgroundPayload {
  prompt: string
  width?: number
  height?: number
  style?: 'photorealistic' | 'artistic' | 'minimalist'
}

interface RemoveBackgroundPayload {
  imageBase64: string
}

interface SuggestTypographyPayload {
  imageBase64?: string
  textContent: string
  subjectBounds?: { x: number; y: number; width: number; height: number }
  canvasWidth?: number
  canvasHeight?: number
}

interface AutoLevelPayload {
  subjectBase64: string
  backgroundBase64: string
}

// Phase 3: Video Generation Interfaces
interface GenerateVideoPayload {
  prompt: string
  model: 'veo-3.1' | 'sora-2'
  aspectRatio?: '16:9' | '9:16' | '1:1'
  duration?: number // seconds, default 8
  style?: 'cinematic' | 'dynamic' | 'calm'
}

interface GetVideoStatusPayload {
  jobId: string
  model: 'veo-3.1' | 'sora-2'
}

interface VideoOverlay {
  type: 'text' | 'image' | 'logo'
  content: string
  position: { x: number; y: number }
  timing: { start: number; end: number }
  animation?: 'fade-in' | 'slide-up' | 'scale' | 'none'
  style?: { color?: string; fontSize?: number; fontWeight?: string; shadow?: boolean }
}

interface RenderVideoOverlaysPayload {
  videoUrl: string
  overlays: VideoOverlay[]
  outputFormat?: 'mp4' | 'webm'
  resolution?: '1080p' | '4k'
}

// ============================================================================
// Phase 4: Rate Limiting and Usage Tracking
// ============================================================================

interface RateLimitResult {
  allowed: boolean
  remaining: number
  tier: string
  resetAt?: string
}

/**
 * Check if user can perform the requested action based on their subscription tier
 */
async function checkRateLimits(userId: string | null, action: string): Promise<RateLimitResult> {
  // Skip rate limiting if Supabase not configured or action not rate-limited
  if (!supabase || !userId || !RATE_LIMITED_ACTIONS.includes(action)) {
    return { allowed: true, remaining: 999, tier: 'unlimited' }
  }

  try {
    // Get user subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.warn('Subscription lookup error:', error)
    }

    const tier = subscription?.tier || 'free'
    const isVideoAction = action === 'generate-video'
    const isImageAction = ['generate-background', 'remove-background'].includes(action)

    // Get tier limits
    const tierLimits = {
      free: { video: 10, image: 100 },
      pro: { video: 50, image: 500 },
      enterprise: { video: 999999, image: 999999 }
    }

    const limits = tierLimits[tier as keyof typeof tierLimits] || tierLimits.free

    // Get current usage
    const used = isVideoAction
      ? (subscription?.video_generations_used || 0)
      : (subscription?.image_generations_used || 0)

    const limit = isVideoAction
      ? (subscription?.video_generations_limit || limits.video)
      : (subscription?.image_generations_limit || limits.image)

    const remaining = Math.max(0, limit - used)

    return {
      allowed: used < limit,
      remaining,
      tier,
      resetAt: subscription?.billing_cycle_end
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open - allow the request if we can't check
    return { allowed: true, remaining: 999, tier: 'unknown' }
  }
}

/**
 * Log API usage for cost tracking and analytics
 */
async function logAPIUsage(
  userId: string | null,
  action: string,
  provider: string,
  success: boolean,
  responseTimeMs: number,
  errorCode?: string,
  errorMessage?: string
): Promise<void> {
  if (!supabase || !userId) return

  try {
    const cost = COST_ESTIMATES[action] || 0

    await supabase.from('api_usage_logs').insert({
      user_id: userId,
      api_provider: provider,
      api_endpoint: action,
      action,
      response_status: success ? 'success' : 'error',
      response_time_ms: responseTimeMs,
      estimated_cost_usd: success ? cost : 0,
      error_code: errorCode,
      error_message: errorMessage
    })

    // Increment usage counters on success
    if (success && RATE_LIMITED_ACTIONS.includes(action)) {
      if (action === 'generate-video') {
        await supabase.rpc('increment_video_usage', { p_user_id: userId })
      } else {
        await supabase.rpc('increment_image_usage', { p_user_id: userId })
      }
    }
  } catch (error) {
    console.error('Failed to log API usage:', error)
    // Don't fail the request if logging fails
  }
}

/**
 * Persist AI-generated image to Supabase Storage CDN
 */
async function persistImageToCDN(
  imageBase64: string,
  userId: string,
  aiModel: string
): Promise<{ cdnUrl: string | null; storagePath: string | null }> {
  if (!supabase || !userId) {
    return { cdnUrl: null, storagePath: null }
  }

  try {
    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // Convert base64 to Uint8Array
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }

    // Generate unique storage path
    const hash = crypto.randomUUID().slice(0, 8)
    const storagePath = `${userId}/ai-generated/${aiModel}/${Date.now()}-${hash}.png`

    // Upload to Supabase Storage with 1-year cache
    const { error: uploadError } = await supabase.storage
      .from('media-assets')
      .upload(storagePath, bytes, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year
        upsert: false
      })

    if (uploadError) {
      console.error('CDN upload failed:', uploadError)
      return { cdnUrl: null, storagePath: null }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-assets')
      .getPublicUrl(storagePath)

    return {
      cdnUrl: urlData?.publicUrl || null,
      storagePath
    }
  } catch (error) {
    console.error('Failed to persist image to CDN:', error)
    return { cdnUrl: null, storagePath: null }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  // Check API key configuration
  if (!geminiApiKey || !genAI) {
    return errorResponse(
      'Gemini API key not configured',
      'API_KEY_MISSING',
      500
    )
  }

  const startTime = Date.now()
  let action = 'unknown'
  let userId: string | null = null

  try {
    const body = await req.json()
    action = body.action
    userId = body.userId || body.payload?.userId || null

    // Phase 4: Proactive rate limiting
    const rateLimit = await checkRateLimits(userId, action)
    if (!rateLimit.allowed) {
      const resourceType = action === 'generate-video' ? 'video generations' : 'image generations'
      return errorResponse(
        `Rate limit exceeded. You have ${rateLimit.remaining} ${resourceType} remaining this month. Upgrade to Pro for higher limits.`,
        'RATE_LIMIT_EXCEEDED',
        429,
        {
          remaining: rateLimit.remaining,
          tier: rateLimit.tier,
          resetAt: rateLimit.resetAt,
          upgradeUrl: '/settings/subscription'
        }
      )
    }

    let result: Response

    switch (action) {
      case 'generate-copy':
        result = await handleGenerateCopy(body.payload as GenerateCopyPayload)
        break
      case 'analyze-image':
        result = await handleAnalyzeImage(body.payload as AnalyzeImagePayload)
        break
      case 'analyze-video':
        result = await handleAnalyzeVideo(body.payload as AnalyzeVideoPayload)
        break
      case 'generate-background':
        result = await handleGenerateBackground(body.payload as GenerateBackgroundPayload, userId)
        break
      case 'remove-background':
        result = await handleRemoveBackground(body.payload as RemoveBackgroundPayload)
        break
      case 'suggest-typography':
        result = await handleSuggestTypography(body.payload as SuggestTypographyPayload)
        break
      case 'auto-level':
        result = await handleAutoLevel(body.payload as AutoLevelPayload)
        break
      // Phase 3: Video Generation
      case 'generate-video':
        result = await handleGenerateVideo(body.payload as GenerateVideoPayload)
        break
      case 'get-video-status':
        result = await handleGetVideoStatus(body.payload as GetVideoStatusPayload)
        break
      case 'render-video-overlays':
        result = await handleRenderVideoOverlays(body.payload as RenderVideoOverlaysPayload)
        break
      default:
        return errorResponse(`Unknown action: ${action}`, 'UNKNOWN_ACTION', 400)
    }

    // Phase 4: Log successful API usage
    const responseTime = Date.now() - startTime
    const provider = ACTION_PROVIDERS[action] || 'unknown'

    // Check if response indicates success (no fallback)
    const resultClone = result.clone()
    const resultJson = await resultClone.json().catch(() => ({}))
    const success = !resultJson.fallback && !resultJson.error

    await logAPIUsage(userId, action, provider, success, responseTime)

    return result
  } catch (error) {
    console.error('AI Studio error:', error)

    // Log failed request
    const responseTime = Date.now() - startTime
    const provider = ACTION_PROVIDERS[action] || 'unknown'
    await logAPIUsage(userId, action, provider, false, responseTime, 'EXCEPTION', error.message)

    // Check for rate limiting from downstream APIs
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return errorResponse(
        'Too many requests. Please wait a moment.',
        'RATE_LIMITED',
        429
      )
    }

    return errorResponse(
      error.message || 'AI generation failed',
      'GENERATION_FAILED',
      500
    )
  }
})

/**
 * Generate marketing copy using Gemini 3 Flash
 * Supports text-only or multimodal (text + image) generation
 */
async function handleGenerateCopy(payload: GenerateCopyPayload): Promise<Response> {
  const { prompt, imageBase64, context } = payload

  if (!prompt?.trim()) {
    return errorResponse('Prompt is required', 'INVALID_INPUT', 400)
  }

  const systemPrompt = `You are a marketing copywriter creating content for social media.
Generate compelling, concise marketing copy. Keep it punchy and platform-appropriate.
Context: Platform is ${context?.platform || 'instagram'}, tone is ${context?.tone || 'professional'}.
Return ONLY the marketing text, no explanations or quotes around it.
Keep it short - ideal for social media (under 280 characters for most platforms).`

  try {
    const parts: (string | { inlineData: { data: string; mimeType: string } })[] = [
      systemPrompt,
      `Generate marketing copy for: ${prompt}`,
    ]

    // Add image if provided (multimodal)
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/png',
        },
      })
    }

    const result = await flashModel!.generateContent(parts)
    const response = await result.response
    const text = response.text().trim()

    return jsonResponse({ text, fallback: false })
  } catch (error) {
    console.error('Copy generation failed:', error)
    // Return fallback response
    return jsonResponse({
      text: prompt.toUpperCase(),
      fallback: true,
      error: error.message,
    })
  }
}

/**
 * Analyze an image using Gemini 3 Pro
 * Extracts scene metadata, subject detection, and copy suggestions
 */
async function handleAnalyzeImage(payload: AnalyzeImagePayload): Promise<Response> {
  const { imageBase64 } = payload

  if (!imageBase64) {
    return errorResponse('Image is required', 'INVALID_INPUT', 400)
  }

  const prompt = `Analyze this marketing/product image and extract:
1. Scene metadata (lighting: natural/studio/dramatic, mood: energetic/calm/luxurious)
2. Subject detection (product type, colors, materials)
3. Suggested copy: headline (max 8 words), subheadline (max 15 words), CTA (max 5 words)
4. Typography suggestions: font style (serif/sans/display), placement (top/center/bottom)

Return ONLY valid JSON (no markdown, no explanation):
{
  "scene": { "lighting": "...", "mood": "...", "colors": ["..."] },
  "subject": { "type": "...", "material": "...", "primaryColor": "..." },
  "copy": { "headline": "...", "subheadline": "...", "cta": "..." },
  "typography": { "fontStyle": "...", "placement": "...", "suggestedSize": "large|medium|small" }
}`

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const result = await proModel!.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/png',
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return jsonResponse({ ...parsed, fallback: false })
      } catch {
        // JSON parse failed, return raw
        return jsonResponse({
          copy: { headline: text.trim().slice(0, 50), subheadline: '', cta: '' },
          fallback: true,
          raw: text,
        })
      }
    }

    // No JSON found
    return jsonResponse({
      copy: { headline: 'Your Product Here', subheadline: '', cta: 'Shop Now' },
      fallback: true,
      raw: text,
    })
  } catch (error) {
    console.error('Image analysis failed:', error)
    return jsonResponse({
      copy: { headline: 'Your Product Here', subheadline: '', cta: 'Shop Now' },
      fallback: true,
      error: error.message,
    })
  }
}

/**
 * Analyze a video using Gemini 3 Pro
 * Extracts scene-by-scene metadata and suggested overlays
 */
async function handleAnalyzeVideo(payload: AnalyzeVideoPayload): Promise<Response> {
  const { videoBase64, mimeType = 'video/mp4' } = payload

  if (!videoBase64) {
    return errorResponse('Video is required', 'INVALID_INPUT', 400)
  }

  const prompt = `Watch this video and extract scene-by-scene metadata:
1. Key moments with timestamps
2. Scene transitions and mood changes
3. Suggested text overlays for each key moment
4. Overall narrative arc

Return ONLY valid JSON (no markdown, no explanation):
{
  "duration": "estimated seconds",
  "keyMoments": [
    { "timestamp": "0:00", "description": "...", "suggestedText": "...", "mood": "..." }
  ],
  "narrative": "...",
  "recommendedCTA": "..."
}`

  try {
    const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, '')
    const result = await proModel!.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return jsonResponse({ ...parsed, fallback: false })
      } catch {
        return jsonResponse({
          keyMoments: [],
          narrative: text.trim(),
          recommendedCTA: 'Learn More',
          fallback: true,
          raw: text,
        })
      }
    }

    return jsonResponse({
      keyMoments: [],
      narrative: 'Video analysis completed',
      recommendedCTA: 'Learn More',
      fallback: true,
      raw: text,
    })
  } catch (error) {
    console.error('Video analysis failed:', error)
    return jsonResponse({
      keyMoments: [],
      narrative: 'Video analysis unavailable',
      recommendedCTA: 'Learn More',
      fallback: true,
      error: error.message,
    })
  }
}

/**
 * Generate a background image using Imagen 4.0 via Vertex AI
 * Creates custom backgrounds from natural language descriptions
 * Phase 4: Auto-persists to Supabase Storage CDN
 */
async function handleGenerateBackground(payload: GenerateBackgroundPayload, userId?: string | null): Promise<Response> {
  const { prompt, width = 1080, height = 1080, style = 'photorealistic' } = payload

  if (!prompt?.trim()) {
    return errorResponse('Prompt is required', 'INVALID_INPUT', 400)
  }

  const enhancedPrompt = `${style} background image for product photography: ${prompt}. No text, no products, no people, just the background scene. High quality, suitable for marketing.`

  try {
    // Get GCP credentials for Vertex AI
    const gcpProjectId = Deno.env.get('GCP_PROJECT_ID')
    const gcpAccessToken = Deno.env.get('GCP_ACCESS_TOKEN')

    if (!gcpProjectId) {
      // Fallback: Use Gemini to describe what the background would look like
      console.warn('GCP_PROJECT_ID not configured, using Gemini fallback')
      const result = await flashModel!.generateContent([
        `You are helping generate a marketing background. Describe in detail what a "${style} background for product photography: ${prompt}" would look like. Be specific about colors, textures, lighting, and composition.`
      ])
      return jsonResponse({
        imageBase64: null,
        description: result.response.text().trim(),
        fallback: true,
        message: 'Imagen not configured - returning description only'
      })
    }

    // Determine aspect ratio
    const aspectRatio = width === height ? '1:1' : width > height ? '16:9' : '9:16'

    // Call Vertex AI Imagen 4.0
    const response = await fetch(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${gcpProjectId}/locations/us-central1/publishers/google/models/imagen-4.0-generate-001:predict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gcpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt: enhancedPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
            safetyFilterLevel: 'block_some',
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Imagen API error:', errorText)
      throw new Error(`Imagen API error: ${response.status}`)
    }

    const data = await response.json()
    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded

    if (!imageBase64) {
      throw new Error('No image generated from Imagen')
    }

    // Phase 4: Auto-persist to CDN for caching
    let cdnUrl: string | null = null
    let storagePath: string | null = null

    if (userId) {
      const cdnResult = await persistImageToCDN(imageBase64, userId, 'imagen-4.0')
      cdnUrl = cdnResult.cdnUrl
      storagePath = cdnResult.storagePath
    }

    return jsonResponse({
      imageBase64: `data:image/png;base64,${imageBase64}`,
      cdnUrl,           // NEW: CDN URL for caching
      storagePath,      // NEW: Storage path for cleanup tracking
      aiModel: 'imagen-4.0',
      prompt: enhancedPrompt,
      fallback: false
    })
  } catch (error) {
    console.error('Background generation failed:', error)
    return jsonResponse({
      imageBase64: null,
      cdnUrl: null,
      fallback: true,
      error: error.message
    })
  }
}

/**
 * Remove background from an image
 * Uses remove.bg API if available, otherwise falls back to Gemini Vision for bounds detection
 */
async function handleRemoveBackground(payload: RemoveBackgroundPayload): Promise<Response> {
  const { imageBase64 } = payload

  if (!imageBase64) {
    return errorResponse('Image is required', 'INVALID_INPUT', 400)
  }

  // Option 1: Use remove.bg API (more reliable)
  const removeBgApiKey = Deno.env.get('REMOVE_BG_API_KEY')
  if (removeBgApiKey) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

      const formData = new FormData()
      // Convert base64 to blob
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })
      formData.append('image_file', blob, 'image.png')
      formData.append('size', 'auto')
      formData.append('format', 'png')

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': removeBgApiKey,
        },
        body: formData
      })

      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        return jsonResponse({
          subjectBase64: `data:image/png;base64,${resultBase64}`,
          bounds: null,
          fallback: false
        })
      } else {
        console.warn('remove.bg API failed:', response.status)
      }
    } catch (error) {
      console.warn('remove.bg failed, falling back to Gemini:', error)
    }
  }

  // Option 2: Use Gemini Vision to identify subject bounds
  try {
    const prompt = `Analyze this image and identify the main product/subject.
Return ONLY valid JSON (no markdown, no explanation):
{
  "bounds": { "x": 0, "y": 0, "width": 100, "height": 100 },
  "subjectType": "product",
  "confidence": 0.8
}

Where x, y, width, height are percentages (0-100) of the image dimensions.
x,y is the top-left corner of the bounding box.`

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const result = await proModel!.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: 'image/png' } }
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return jsonResponse({
          subjectBase64: null,
          bounds: parsed.bounds,
          subjectType: parsed.subjectType,
          confidence: parsed.confidence,
          fallback: true,
          message: 'Using Gemini Vision bounds detection (remove.bg not configured)'
        })
      } catch {
        // JSON parse failed
      }
    }

    throw new Error('Could not parse subject bounds from Gemini')
  } catch (error) {
    console.error('Background removal failed:', error)
    return jsonResponse({
      subjectBase64: null,
      bounds: null,
      fallback: true,
      error: error.message
    })
  }
}

/**
 * Suggest optimal typography placement using Gemini Flash
 * Avoids overlapping with the product subject
 */
async function handleSuggestTypography(payload: SuggestTypographyPayload): Promise<Response> {
  const { imageBase64, textContent, subjectBounds, canvasWidth = 1080, canvasHeight = 1080 } = payload

  if (!textContent?.trim()) {
    return errorResponse('Text content is required', 'INVALID_INPUT', 400)
  }

  // Theme colors from the app
  const themeColors = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

  const prompt = `You are a professional graphic designer. Suggest optimal typography placement for marketing content.

Text to place: "${textContent}"
Canvas size: ${canvasWidth}x${canvasHeight} pixels
${subjectBounds ? `Subject/product bounds to AVOID (percentages): x=${subjectBounds.x}%, y=${subjectBounds.y}%, width=${subjectBounds.width}%, height=${subjectBounds.height}%` : 'No subject bounds provided - place text in a visually balanced position'}

Available colors from our design system: ${themeColors.join(', ')}

Consider:
1. Readability - ensure good contrast with background
2. Visual hierarchy - headline should be prominent
3. Avoid overlapping the product/subject area
4. Professional marketing aesthetics

Return ONLY valid JSON (no markdown, no explanation):
{
  "position": { "x": 50, "y": 20 },
  "fontSize": "large",
  "fontWeight": "700",
  "color": "#ffffff",
  "textAlign": "center",
  "shadow": true,
  "reasoning": "brief explanation"
}

Where:
- position x,y are percentages (0-100) from top-left
- fontSize: "small" (32px), "medium" (42px), "large" (56px), "xlarge" (72px)
- fontWeight: "400", "500", "600", "700", "800"
- color: must be one of the theme colors listed above
- textAlign: "left", "center", "right"
- shadow: true/false for drop shadow`

  try {
    const parts: (string | { inlineData: { data: string; mimeType: string } })[] = [prompt]

    // Add image if provided for context
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      parts.push({ inlineData: { data: base64Data, mimeType: 'image/png' } })
    }

    const result = await flashModel!.generateContent(parts)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])

        // Validate color is from our theme
        if (!themeColors.includes(parsed.color)) {
          parsed.color = '#ffffff'
        }

        // Validate fontSize
        const validSizes = ['small', 'medium', 'large', 'xlarge']
        if (!validSizes.includes(parsed.fontSize)) {
          parsed.fontSize = 'large'
        }

        return jsonResponse({ ...parsed, fallback: false })
      } catch {
        // JSON parse failed
      }
    }

    throw new Error('Could not parse typography suggestion')
  } catch (error) {
    console.error('Typography suggestion failed:', error)
    // Return sensible defaults based on subject bounds
    const defaultY = subjectBounds ? (subjectBounds.y > 50 ? 15 : 85) : 50
    return jsonResponse({
      position: { x: 50, y: defaultY },
      fontSize: 'large',
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      shadow: true,
      fallback: true,
      error: error.message
    })
  }
}

/**
 * Suggest auto-level adjustments to match subject to background
 * Uses Gemini Flash to analyze both images and suggest color corrections
 */
async function handleAutoLevel(payload: AutoLevelPayload): Promise<Response> {
  const { subjectBase64, backgroundBase64 } = payload

  if (!subjectBase64 || !backgroundBase64) {
    return errorResponse('Both subject and background images are required', 'INVALID_INPUT', 400)
  }

  const prompt = `You are a professional photo editor. Analyze these two images:
1. First image: A product/subject that has been cut out
2. Second image: A background scene

Suggest color and lighting adjustments to make the subject look natural and well-integrated against the background.

Consider:
- Matching the lighting direction and intensity
- Color temperature (warm/cool)
- Contrast levels
- Shadow placement for grounding the subject

Return ONLY valid JSON (no markdown, no explanation):
{
  "brightness": 0,
  "contrast": 0,
  "saturation": 0,
  "warmth": 0,
  "shadowOpacity": 0.3,
  "shadowBlur": 20,
  "shadowOffsetY": 10,
  "reasoning": "brief explanation"
}

Where:
- brightness: -100 to 100 (0 = no change)
- contrast: -100 to 100 (0 = no change)
- saturation: -100 to 100 (0 = no change)
- warmth: -100 to 100 (negative = cooler/bluer, positive = warmer/yellower)
- shadowOpacity: 0 to 1 (how dark the drop shadow should be)
- shadowBlur: 0 to 50 pixels
- shadowOffsetY: 0 to 30 pixels (vertical offset for natural ground shadow)`

  try {
    const subjectData = subjectBase64.replace(/^data:image\/\w+;base64,/, '')
    const bgData = backgroundBase64.replace(/^data:image\/\w+;base64,/, '')

    const result = await flashModel!.generateContent([
      prompt,
      { inlineData: { data: subjectData, mimeType: 'image/png' } },
      { inlineData: { data: bgData, mimeType: 'image/png' } }
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])

        // Clamp values to valid ranges
        parsed.brightness = Math.max(-100, Math.min(100, parsed.brightness || 0))
        parsed.contrast = Math.max(-100, Math.min(100, parsed.contrast || 0))
        parsed.saturation = Math.max(-100, Math.min(100, parsed.saturation || 0))
        parsed.warmth = Math.max(-100, Math.min(100, parsed.warmth || 0))
        parsed.shadowOpacity = Math.max(0, Math.min(1, parsed.shadowOpacity || 0.3))
        parsed.shadowBlur = Math.max(0, Math.min(50, parsed.shadowBlur || 20))
        parsed.shadowOffsetY = Math.max(0, Math.min(30, parsed.shadowOffsetY || 10))

        return jsonResponse({ ...parsed, fallback: false })
      } catch {
        // JSON parse failed
      }
    }

    throw new Error('Could not parse auto-level suggestions')
  } catch (error) {
    console.error('Auto-level failed:', error)
    return jsonResponse({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      shadowOpacity: 0.3,
      shadowBlur: 20,
      shadowOffsetY: 10,
      fallback: true,
      error: error.message
    })
  }
}

// ============================================================================
// Phase 3: Video Generation Handlers
// ============================================================================

/**
 * Generate video from text prompt using Veo 3.1 (Google) or Sora 2 (OpenAI)
 * Returns a job ID for polling status
 */
async function handleGenerateVideo(payload: GenerateVideoPayload): Promise<Response> {
  const { prompt, model, aspectRatio = '16:9', duration = 8, style = 'cinematic' } = payload

  if (!prompt?.trim()) {
    return errorResponse('Prompt is required', 'INVALID_INPUT', 400)
  }

  const enhancedPrompt = `${style} marketing video: ${prompt}. High quality, professional cinematography, suitable for social media advertising.`

  try {
    if (model === 'veo-3.1') {
      const gcpProjectId = Deno.env.get('GCP_PROJECT_ID')
      const gcpAccessToken = Deno.env.get('GCP_ACCESS_TOKEN')

      if (!gcpProjectId || !gcpAccessToken) {
        return jsonResponse({
          jobId: null,
          fallback: true,
          message: 'Veo 3.1 not configured - GCP credentials missing'
        })
      }

      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${gcpProjectId}/locations/us-central1/publishers/google/models/veo-003:generateVideo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gcpAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{ prompt: enhancedPrompt }],
            parameters: {
              aspectRatio,
              durationSeconds: duration,
              includeAudio: true
            }
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Veo API error:', errorText)
        throw new Error(`Veo API error: ${response.status}`)
      }

      const data = await response.json()
      return jsonResponse({
        jobId: data.name,
        model: 'veo-3.1',
        fallback: false
      })

    } else if (model === 'sora-2') {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

      if (!openaiApiKey) {
        return jsonResponse({
          jobId: null,
          fallback: true,
          message: 'Sora 2 not configured - OpenAI API key missing'
        })
      }

      // Determine size based on aspect ratio
      let size = '1920x1080'
      if (aspectRatio === '9:16') size = '1080x1920'
      else if (aspectRatio === '1:1') size = '1080x1080'

      const response = await fetch('https://api.openai.com/v1/videos/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sora-2',
          prompt: enhancedPrompt,
          size,
          duration
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Sora API error:', errorText)
        throw new Error(`Sora API error: ${response.status}`)
      }

      const data = await response.json()
      return jsonResponse({
        jobId: data.id,
        model: 'sora-2',
        fallback: false
      })
    }

    return errorResponse('Invalid model specified', 'INVALID_INPUT', 400)
  } catch (error) {
    console.error('Video generation failed:', error)
    return jsonResponse({
      jobId: null,
      fallback: true,
      error: error.message
    })
  }
}

/**
 * Get video generation status by polling the API
 */
async function handleGetVideoStatus(payload: GetVideoStatusPayload): Promise<Response> {
  const { jobId, model } = payload

  if (!jobId) {
    return errorResponse('Job ID is required', 'INVALID_INPUT', 400)
  }

  try {
    if (model === 'veo-3.1') {
      const gcpAccessToken = Deno.env.get('GCP_ACCESS_TOKEN')

      if (!gcpAccessToken) {
        return jsonResponse({ status: 'failed', error: 'GCP credentials missing' })
      }

      const response = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/${jobId}`,
        {
          headers: { 'Authorization': `Bearer ${gcpAccessToken}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.done) {
        return jsonResponse({
          status: 'completed',
          progress: 100,
          videoUrl: data.response?.videoUri
        })
      }

      return jsonResponse({
        status: 'processing',
        progress: data.metadata?.progress || 50
      })

    } else if (model === 'sora-2') {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

      if (!openaiApiKey) {
        return jsonResponse({ status: 'failed', error: 'OpenAI API key missing' })
      }

      const response = await fetch(
        `https://api.openai.com/v1/videos/generations/${jobId}`,
        {
          headers: { 'Authorization': `Bearer ${openaiApiKey}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'succeeded') {
        return jsonResponse({
          status: 'completed',
          progress: 100,
          videoUrl: data.video_url
        })
      }

      if (data.status === 'failed') {
        return jsonResponse({
          status: 'failed',
          error: data.error?.message || 'Video generation failed'
        })
      }

      return jsonResponse({
        status: 'processing',
        progress: 50
      })
    }

    return errorResponse('Invalid model specified', 'INVALID_INPUT', 400)
  } catch (error) {
    console.error('Video status check failed:', error)
    return jsonResponse({
      status: 'failed',
      error: error.message
    })
  }
}

/**
 * Render video with marketing overlays using Creatomate
 * Stitches AI-generated video with text/logo overlays and exports final MP4
 */
async function handleRenderVideoOverlays(payload: RenderVideoOverlaysPayload): Promise<Response> {
  const { videoUrl, overlays, outputFormat = 'mp4', resolution = '1080p' } = payload

  if (!videoUrl) {
    return errorResponse('Video URL is required', 'INVALID_INPUT', 400)
  }

  const creatomateApiKey = Deno.env.get('CREATOMATE_API_KEY')

  if (!creatomateApiKey) {
    return jsonResponse({
      renderJobId: null,
      fallback: true,
      message: 'Creatomate not configured - server-side rendering unavailable'
    })
  }

  try {
    // Convert overlays to Creatomate element format
    const elements = (overlays || []).map((overlay, i) => {
      const element: Record<string, unknown> = {
        id: `overlay-${i}`,
        type: overlay.type === 'text' ? 'text' : 'image',
        x: `${overlay.position.x}%`,
        y: `${overlay.position.y}%`,
        time: overlay.timing.start,
        duration: overlay.timing.end - overlay.timing.start,
      }

      if (overlay.type === 'text') {
        element.text = overlay.content
        element.font_size = overlay.style?.fontSize || 48
        element.fill_color = overlay.style?.color || '#ffffff'
        element.font_weight = overlay.style?.fontWeight || '700'
      } else {
        element.source = overlay.content
      }

      // Add animations
      if (overlay.animation && overlay.animation !== 'none') {
        const animationMap: Record<string, object> = {
          'fade-in': { type: 'fade', fade: 'in', duration: 0.5 },
          'slide-up': { type: 'slide', direction: 'up', duration: 0.5 },
          'scale': { type: 'scale', start_scale: '0%', duration: 0.5 }
        }
        element.animations = [animationMap[overlay.animation] || { type: 'fade', fade: 'in' }]
      }

      return element
    })

    // Determine output dimensions
    const width = resolution === '4k' ? 3840 : 1920
    const height = resolution === '4k' ? 2160 : 1080

    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creatomateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          output_format: outputFormat,
          width,
          height,
          elements: [
            { type: 'video', source: videoUrl },
            ...elements
          ]
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Creatomate API error:', errorText)
      throw new Error(`Creatomate API error: ${response.status}`)
    }

    const data = await response.json()
    return jsonResponse({
      renderJobId: data[0]?.id,
      status: 'processing',
      fallback: false
    })
  } catch (error) {
    console.error('Video overlay rendering failed:', error)
    return jsonResponse({
      renderJobId: null,
      fallback: true,
      error: error.message
    })
  }
}

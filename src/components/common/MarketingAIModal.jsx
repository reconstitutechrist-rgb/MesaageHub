import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Upload, Download, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { aiService } from '@/services/AIService'

export function MarketingAIModal({ open, onOpenChange, onImageGenerated }) {
  const [image, setImage] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Canvas State
  const canvasRef = useRef(null)
  const [textOverlay, setTextOverlay] = useState({
    text: '',
    x: 100,
    y: 100,
    color: '#ffffff',
    fontSize: 40,
    isDragging: false,
  })

  // Load image onto canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = URL.createObjectURL(image)

    img.onload = () => {
      // Fit canvas to image aspect ratio but max width 600
      const maxWidth = 600
      const scale = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scale

      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw Text Overlay
      if (textOverlay.text) {
        ctx.font = `bold ${textOverlay.fontSize}px sans-serif`
        ctx.fillStyle = textOverlay.color
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 4
        ctx.textAlign = 'center'
        ctx.fillText(textOverlay.text, textOverlay.x, textOverlay.y)
      }
    }
  }, [image, textOverlay])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      // Reset overlay on new image
      setTextOverlay((prev) => ({ ...prev, text: '', x: 150, y: 150 }))
    }
  }

  const handleGenerate = async () => {
    if (!image) return

    setIsGenerating(true)
    try {
      const result = await aiService.analyzeProductImage(prompt || 'Product')

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate copy')
      }

      const { headlines, suggestedColor } = result.data
      const canvas = canvasRef.current

      setTextOverlay({
        text: headlines[0],
        color: suggestedColor,
        fontSize: 40,
        x: canvas.width / 2,
        y: canvas.height * 0.8,
        isDragging: false,
      })

      toast.success('AI Copy Generated!')
    } catch (error) {
      toast.error(error.message || 'Failed to generate copy')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], 'marketing-ad.png', { type: 'image/png' })
      onImageGenerated(file, textOverlay.text)
      onOpenChange(false)
    })
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dist = Math.sqrt(Math.pow(x - textOverlay.x, 2) + Math.pow(y - textOverlay.y, 2))

    if (dist < 100) {
      setTextOverlay((prev) => ({ ...prev, isDragging: true }))
    }
  }

  const handleMouseMove = (e) => {
    if (!textOverlay.isDragging) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    setTextOverlay((prev) => ({
      ...prev,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }))
  }

  const handleMouseUp = () => {
    setTextOverlay((prev) => ({ ...prev, isDragging: false }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Left Panel - Controls */}
          <div className="p-4 border-r bg-muted/20 space-y-6 overflow-y-auto">
            <DialogHeader className="px-0">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Studio
              </DialogTitle>
              <DialogDescription>
                Upload a product photo and let AI design your ad.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Step 1: Upload */}
              <div className="space-y-2">
                <Label>1. Upload Product</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-xs">Click to upload</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Describe Product */}
              <div className="space-y-2">
                <Label>2. What are you selling?</Label>
                <Input
                  placeholder="e.g. Gold Ring"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleGenerate}
                disabled={!image || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Magic
                  </>
                )}
              </Button>

              {/* Manual Adjustments */}
              {image && (
                <div className="space-y-4 pt-4 border-t">
                  <Label>Manual Adjustments</Label>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Text Content</span>
                    <Input
                      value={textOverlay.text}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, text: e.target.value }))
                      }
                    />
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Text Color</span>
                    <div className="flex gap-2">
                      {['#ffffff', '#000000', '#ff0000', '#fbbf24', '#3b82f6'].map((c) => (
                        <div
                          key={c}
                          className={`w-6 h-6 rounded-full border cursor-pointer ${
                            textOverlay.color === c ? 'ring-2 ring-offset-2 ring-purple-600' : ''
                          }`}
                          style={{ backgroundColor: c }}
                          onClick={() => setTextOverlay((prev) => ({ ...prev, color: c }))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground flex justify-between">
                      Size
                      <span>{textOverlay.fontSize}px</span>
                    </span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={textOverlay.fontSize}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Canvas Preview */}
          <div className="col-span-2 bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
            {!image ? (
              <div className="text-slate-500 flex flex-col items-center">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>No image selected</p>
              </div>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full shadow-2xl rounded-lg cursor-move bg-white"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />

                {/* Action Buttons */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button variant="secondary" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Use This Ad
                  </Button>
                </div>

                {/* Tip */}
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  Tip: Drag text to move it
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

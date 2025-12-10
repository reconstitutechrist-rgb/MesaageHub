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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, Upload, Sparkles } from 'lucide-react'

export function MarketingAIModal({ open, onOpenChange, onImageGenerated }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Upload an image and tell me how you want to edit it for your marketing campaign!',
    },
  ])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [image, setImage] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Draw image to canvas when loaded
  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvasRef.current.width = img.width
        canvasRef.current.height = img.height
        ctx.drawImage(img, 0, 0)
        setGeneratedImage(canvasRef.current.toDataURL())
      }
      img.src = image
    }
  }, [image])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
      setMessages((prev) => [...prev, { role: 'system', content: 'Image uploaded successfully.' }])
    }
  }

  const handleSendPrompt = async () => {
    if (!prompt.trim() || !image) return

    const userPrompt = prompt
    setMessages((prev) => [...prev, { role: 'user', content: userPrompt }])
    setPrompt('')
    setIsGenerating(true)

    // Simulate AI processing
    setTimeout(() => {
      const ctx = canvasRef.current.getContext('2d')
      const width = canvasRef.current.width
      const height = canvasRef.current.height

      // Basic AI Simulation: Add text overlay based on prompt
      // Look for text in quotes or keywords
      let overlayText = 'SPECIAL OFFER' // Default
      const match = userPrompt.match(/"([^"]+)"/) || userPrompt.match(/'([^']+)'/)
      if (match) {
        overlayText = match[1]
      } else if (userPrompt.toLowerCase().includes('sale')) {
        overlayText = 'ON SALE'
      } else if (userPrompt.toLowerCase().includes('discount')) {
        overlayText = '50% OFF'
      }

      // Draw overlay
      ctx.font = `bold ${width / 10}px Arial`
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
      ctx.textAlign = 'center'

      // Draw banner background
      ctx.fillRect(0, height * 0.7, width, height * 0.2)

      // Draw text
      ctx.fillStyle = 'white'
      ctx.fillText(overlayText, width / 2, height * 0.82)

      setGeneratedImage(canvasRef.current.toDataURL())
      setIsGenerating(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I've updated the image with "${overlayText}". How does that look?`,
        },
      ])
    }, 1500)
  }

  const handleUseImage = () => {
    if (!generatedImage) return

    // Convert data URL to Blob
    fetch(generatedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'marketing-ad.png', { type: 'image/png' })

        // Extract keywords from history for auto-targeting
        // Just verify the last user prompt was relevant
        const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
        const targetingText = lastUserMessage ? lastUserMessage.content : 'Marketing Ad'

        onImageGenerated(file, targetingText)
        onOpenChange(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full md:max-w-4xl h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Marketing Studio
          </DialogTitle>
          <DialogDescription>Upload a product image and let AI design your ad.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Image Preview Area - Top on Mobile, Left on Desktop */}
          <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center border-b md:border-b-0 md:border-r overflow-auto min-h-[40vh] md:min-h-0">
            {!image ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a product photo to start
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                <Button onClick={() => fileInputRef.current?.click()}>Choose Image</Button>
              </div>
            ) : (
              <div className="relative max-w-full max-h-full">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain shadow-lg rounded-md"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                  onClick={() => setImage(null)}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>

          {/* Chat Interface - Bottom on Mobile, Right on Desktop */}
          <div className="flex-1 md:max-w-[400px] flex flex-col bg-background">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : msg.role === 'system'
                            ? 'bg-muted text-muted-foreground text-xs text-center w-full'
                            : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating design...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t space-y-4">
              <div className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={image ? "Ex: Add 'Sale' text..." : 'Upload an image first'}
                  disabled={!image || isGenerating}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                />
                <Button
                  size="icon"
                  onClick={handleSendPrompt}
                  disabled={!image || isGenerating || !prompt.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full" onClick={handleUseImage} disabled={!image}>
                Use this Ad
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

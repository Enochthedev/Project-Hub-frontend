"use client"

import { useState } from "react"
import { Conversation, Message } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Download, 
  Share2, 
  Copy, 
  Mail, 
  FileText,
  Link,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  User,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ConversationExportProps {
  conversation: Conversation
  messages: Message[]
  className?: string
}

interface ExportOptions {
  format: 'pdf' | 'txt' | 'json' | 'html'
  includeMetadata: boolean
  includeTimestamps: boolean
  includeRatings: boolean
  includeSources: boolean
  includeBookmarksOnly: boolean
  anonymize: boolean
}

interface ShareOptions {
  shareType: 'link' | 'email' | 'embed'
  expiresIn: '1h' | '24h' | '7d' | '30d' | 'never'
  allowComments: boolean
  requireAuth: boolean
  password?: string
}

export function ConversationExport({ conversation, messages, className }: ConversationExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeMetadata: true,
    includeTimestamps: true,
    includeRatings: false,
    includeSources: true,
    includeBookmarksOnly: false,
    anonymize: false,
  })

  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    shareType: 'link',
    expiresIn: '7d',
    allowComments: false,
    requireAuth: true,
  })

  const [shareUrl, setShareUrl] = useState<string>('')
  const [isGeneratingShare, setIsGeneratingShare] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleExport = async () => {
    try {
      // In a real app, this would call the API to generate the export
      const exportData = generateExportData()
      
      switch (exportOptions.format) {
        case 'json':
          downloadFile(JSON.stringify(exportData, null, 2), 'conversation.json', 'application/json')
          break
        case 'txt':
          downloadFile(generateTextExport(exportData), 'conversation.txt', 'text/plain')
          break
        case 'html':
          downloadFile(generateHtmlExport(exportData), 'conversation.html', 'text/html')
          break
        case 'pdf':
          // Would integrate with PDF generation library
          console.log('PDF export not implemented in demo')
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleShare = async () => {
    setIsGeneratingShare(true)
    try {
      // In a real app, this would call the API to create a shareable link
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      const mockShareUrl = `https://projecthub.com/shared/conversations/${conversation.id}?token=abc123`
      setShareUrl(mockShareUrl)
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setIsGeneratingShare(false)
    }
  }

  const generateExportData = () => {
    let filteredMessages = messages
    
    if (exportOptions.includeBookmarksOnly) {
      filteredMessages = messages.filter(msg => msg.isBookmarked)
    }

    return {
      conversation: {
        id: exportOptions.anonymize ? 'anonymous' : conversation.id,
        title: conversation.title,
        status: conversation.status,
        createdAt: exportOptions.includeTimestamps ? conversation.createdAt : undefined,
        messageCount: filteredMessages.length,
      },
      messages: filteredMessages.map(msg => ({
        id: exportOptions.anonymize ? undefined : msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: exportOptions.includeTimestamps ? msg.createdAt : undefined,
        rating: exportOptions.includeRatings ? msg.averageRating : undefined,
        sources: exportOptions.includeSources ? msg.sources : undefined,
        confidenceScore: exportOptions.includeMetadata ? msg.confidenceScore : undefined,
        isBookmarked: msg.isBookmarked,
      })),
      exportedAt: new Date().toISOString(),
      exportOptions,
    }
  }

  const generateTextExport = (data: any) => {
    let text = `Conversation: ${data.conversation.title}\n`
    text += `Status: ${data.conversation.status}\n`
    if (data.conversation.createdAt) {
      text += `Created: ${new Date(data.conversation.createdAt).toLocaleString()}\n`
    }
    text += `Messages: ${data.conversation.messageCount}\n\n`
    text += '=' .repeat(50) + '\n\n'

    data.messages.forEach((msg: any, index: number) => {
      text += `[${msg.type.toUpperCase()}]`
      if (msg.timestamp) {
        text += ` - ${new Date(msg.timestamp).toLocaleString()}`
      }
      text += '\n'
      text += msg.content + '\n'
      
      if (msg.rating) {
        text += `Rating: ${msg.rating}/5\n`
      }
      
      if (msg.sources && msg.sources.length > 0) {
        text += `Sources: ${msg.sources.join(', ')}\n`
      }
      
      if (msg.isBookmarked) {
        text += '📖 Bookmarked\n'
      }
      
      text += '\n' + '-'.repeat(30) + '\n\n'
    })

    return text
  }

  const generateHtmlExport = (data: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${data.conversation.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #1B998B; padding-bottom: 20px; margin-bottom: 30px; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .user { background-color: #1B998B; color: white; margin-left: 20%; }
        .assistant { background-color: #f8f9fa; border-left: 4px solid #1B998B; }
        .timestamp { font-size: 0.8em; color: #666; }
        .rating { color: #ffc107; }
        .bookmarked { color: #1B998B; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.conversation.title}</h1>
        <p>Status: ${data.conversation.status}</p>
        ${data.conversation.createdAt ? `<p>Created: ${new Date(data.conversation.createdAt).toLocaleString()}</p>` : ''}
        <p>Messages: ${data.conversation.messageCount}</p>
    </div>
    
    ${data.messages.map((msg: any) => `
        <div class="message ${msg.type}">
            <div class="timestamp">${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</div>
            <p>${msg.content}</p>
            ${msg.rating ? `<div class="rating">Rating: ${'★'.repeat(Math.floor(msg.rating))} (${msg.rating}/5)</div>` : ''}
            ${msg.isBookmarked ? '<div class="bookmarked">📖 Bookmarked</div>' : ''}
        </div>
    `).join('')}
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.8em; color: #666;">
        Exported on ${new Date().toLocaleString()} from Project Hub AI Assistant
    </div>
</body>
</html>
    `
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getPreviewData = () => {
    return generateExportData()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="space-y-4">
          {/* Export Format */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
              Export Format
            </h3>
            <Select
              value={exportOptions.format}
              onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="html">HTML Page</SelectItem>
                <SelectItem value="txt">Plain Text</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
              Include in Export
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'includeMetadata', label: 'Metadata & confidence scores' },
                { key: 'includeTimestamps', label: 'Timestamps' },
                { key: 'includeRatings', label: 'Message ratings' },
                { key: 'includeSources', label: 'Source references' },
                { key: 'includeBookmarksOnly', label: 'Bookmarked messages only' },
                { key: 'anonymize', label: 'Anonymize data' },
              ].map(option => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.key}
                    checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, [option.key]: checked }))
                    }
                  />
                  <label 
                    htmlFor={option.key}
                    className="text-sm text-[#534D56] dark:text-[#F8F1FF] cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                Preview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-7 px-2"
              >
                {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPreview ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showPreview && (
              <div className="p-3 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded border text-xs">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {exportOptions.format === 'json' 
                    ? JSON.stringify(getPreviewData(), null, 2).slice(0, 500) + '...'
                    : generateTextExport(getPreviewData()).slice(0, 500) + '...'
                  }
                </pre>
              </div>
            )}
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90">
            <Download className="h-4 w-4 mr-2" />
            Export Conversation
          </Button>
        </TabsContent>
        
        <TabsContent value="share" className="space-y-4">
          {/* Share Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
              Share Method
            </h3>
            <Select
              value={shareOptions.shareType}
              onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, shareType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Shareable Link</SelectItem>
                <SelectItem value="email">Email Invitation</SelectItem>
                <SelectItem value="embed">Embed Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
              Share Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#534D56] dark:text-[#F8F1FF]">
                  Expires In
                </label>
                <Select
                  value={shareOptions.expiresIn}
                  onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, expiresIn: value }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#534D56] dark:text-[#F8F1FF]">
                  Password (Optional)
                </label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={shareOptions.password || ''}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))}
                  className="h-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireAuth"
                  checked={shareOptions.requireAuth}
                  onCheckedChange={(checked) => 
                    setShareOptions(prev => ({ ...prev, requireAuth: checked as boolean }))
                  }
                />
                <label htmlFor="requireAuth" className="text-sm text-[#534D56] dark:text-[#F8F1FF]">
                  Require authentication to view
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowComments"
                  checked={shareOptions.allowComments}
                  onCheckedChange={(checked) => 
                    setShareOptions(prev => ({ ...prev, allowComments: checked as boolean }))
                  }
                />
                <label htmlFor="allowComments" className="text-sm text-[#534D56] dark:text-[#F8F1FF]">
                  Allow comments on shared conversation
                </label>
              </div>
            </div>
          </div>

          {/* Generate Share Link */}
          {!shareUrl ? (
            <Button 
              onClick={handleShare} 
              disabled={isGeneratingShare}
              className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isGeneratingShare ? 'Generating...' : 'Generate Share Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                    Share Link
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(shareUrl)}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  value={shareUrl}
                  readOnly
                  className="text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`mailto:?subject=Shared Conversation&body=${shareUrl}`)}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareUrl)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

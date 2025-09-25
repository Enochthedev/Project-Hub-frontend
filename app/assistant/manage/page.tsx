"use client"

import { useState } from "react"
import { ConversationSearch } from "@/components/ai/conversation-search"
import { BookmarkedMessages } from "@/components/ai/bookmarked-messages"
import { ConversationAnalytics } from "@/components/ai/conversation-analytics"
import { ConversationExport } from "@/components/ai/conversation-export"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Search, 
  Bookmark, 
  BarChart3, 
  Download,
  MessageCircle,
  Settings,
  Filter
} from "lucide-react"
import { AnimatedBlob } from "@/components/ui/animated-blob"
import { ParticleBackground } from "@/components/ui/particle-background"

export default function AssistantManagePage() {
  const [activeTab, setActiveTab] = useState("search")
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Mock data for demonstration
  const mockConversation = {
    id: 'conv-123',
    studentId: 'student-1',
    title: 'Project Planning Discussion',
    status: 'active' as const,
    language: 'en',
    messageCount: 15,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    lastMessageAt: '2024-01-15T14:30:00Z',
  }

  const mockMessages = [
    {
      id: 'msg-1',
      conversationId: 'conv-123',
      type: 'user' as const,
      content: 'How should I structure my project timeline?',
      isBookmarked: false,
      status: 'sent' as const,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-123',
      type: 'assistant' as const,
      content: 'Here\'s a comprehensive approach to structuring your project timeline...',
      confidenceScore: 0.92,
      sources: ['project-guidelines', 'timeline-templates'],
      isBookmarked: true,
      status: 'delivered' as const,
      averageRating: 4.5,
      ratingCount: 3,
      createdAt: '2024-01-15T10:01:00Z',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F1FF] to-[#F0E6FF] dark:from-[#534D56] dark:to-[#483C4F] relative">
      <div className="container mx-auto py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
                AI Assistant Management
              </h1>
              <p className="text-[#656176] dark:text-[#DECDF5]">
                Manage your conversations, bookmarks, and analyze your AI interactions
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/80 dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176] backdrop-blur">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-[#1B998B]" />
                <div>
                  <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">24</p>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Conversations</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/80 dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176] backdrop-blur">
              <div className="flex items-center gap-3">
                <Bookmark className="h-8 w-8 text-[#1B998B]" />
                <div>
                  <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">18</p>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Bookmarks</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/80 dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176] backdrop-blur">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-[#1B998B]" />
                <div>
                  <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">4.2</p>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Avg Rating</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/80 dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176] backdrop-blur">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-[#1B998B]" />
                <div>
                  <p className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">5</p>
                  <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Exports</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-[#656176]/30 rounded-xl border border-[#DECDF5] dark:border-[#656176] backdrop-blur overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-[#DECDF5] dark:border-[#656176] bg-[#F8F1FF] dark:bg-[#656176]/50">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="search" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#534D56] data-[state=active]:border-b-2 data-[state=active]:border-[#1B998B] rounded-none px-6 py-4"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search & Filter
                  {searchResults.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {searchResults.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="bookmarks" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#534D56] data-[state=active]:border-b-2 data-[state=active]:border-[#1B998B] rounded-none px-6 py-4"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmarks
                  <Badge variant="secondary" className="ml-2">18</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#534D56] data-[state=active]:border-b-2 data-[state=active]:border-[#1B998B] rounded-none px-6 py-4"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="export" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#534D56] data-[state=active]:border-b-2 data-[state=active]:border-[#1B998B] rounded-none px-6 py-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export & Share
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="search" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">
                      Search Conversations
                    </h2>
                    <p className="text-[#656176] dark:text-[#DECDF5] mb-4">
                      Find specific conversations, messages, or topics using advanced search and filtering options.
                    </p>
                  </div>
                  
                  <ConversationSearch 
                    onResultsChange={setSearchResults}
                  />

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF] mb-4">
                        Search Results ({searchResults.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.slice(0, 5).map((result, index) => (
                          <div 
                            key={index}
                            className="p-4 bg-white dark:bg-[#534D56] rounded-lg border border-[#DECDF5] dark:border-[#656176]"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">
                                {result.title || 'Untitled Conversation'}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {result.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#656176] dark:text-[#DECDF5] mb-2">
                              {result.messageCount} messages • Last active {new Date(result.lastMessageAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                Open
                              </Button>
                              <Button variant="ghost" size="sm">
                                Export
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bookmarks" className="mt-0">
                <div>
                  <h2 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">
                    Bookmarked Messages
                  </h2>
                  <p className="text-[#656176] dark:text-[#DECDF5] mb-6">
                    Organize and manage your saved AI responses for quick reference.
                  </p>
                  
                  <BookmarkedMessages />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div>
                  <h2 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">
                    Conversation Analytics
                  </h2>
                  <p className="text-[#656176] dark:text-[#DECDF5] mb-6">
                    Analyze your AI assistant usage patterns, satisfaction scores, and conversation trends.
                  </p>
                  
                  <ConversationAnalytics />
                </div>
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">
                      Export & Share Conversations
                    </h2>
                    <p className="text-[#656176] dark:text-[#DECDF5] mb-4">
                      Export your conversations in various formats or create shareable links for collaboration.
                    </p>
                  </div>

                  {/* Sample Conversation for Export */}
                  <div className="p-4 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176]">
                    <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF] mb-2">
                      Sample Conversation: {mockConversation.title}
                    </h3>
                    <p className="text-sm text-[#656176] dark:text-[#DECDF5] mb-4">
                      {mockConversation.messageCount} messages • Status: {mockConversation.status}
                    </p>
                    
                    <ConversationExport 
                      conversation={mockConversation}
                      messages={mockMessages}
                    />
                  </div>

                  {/* Recent Exports */}
                  <div>
                    <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF] mb-4">
                      Recent Exports
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Project Planning Discussion.pdf', date: '2024-01-15', size: '2.3 MB' },
                        { name: 'Technical Questions.html', date: '2024-01-14', size: '1.8 MB' },
                        { name: 'Research Methods Chat.txt', date: '2024-01-13', size: '0.5 MB' },
                      ].map((export_, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-[#534D56] rounded-lg border border-[#DECDF5] dark:border-[#656176]"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="h-4 w-4 text-[#1B998B]" />
                            <div>
                              <p className="font-medium text-[#534D56] dark:text-[#F8F1FF]">
                                {export_.name}
                              </p>
                              <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
                                {export_.date} • {export_.size}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Background Elements */}
      <ParticleBackground
        particleColor="#1B998B"
        particleCount={15}
        speed={0.2}
        className="opacity-10 dark:opacity-20"
      />
      <AnimatedBlob 
        color="#1B998B" 
        size="lg" 
        speed="slow" 
        opacity={0.1} 
        className="-left-20 -top-20 z-0" 
      />
      <AnimatedBlob 
        color="#DECDF5" 
        size="md" 
        speed="medium" 
        opacity={0.2} 
        className="right-10 top-40 z-0" 
      />
    </div>
  )
}
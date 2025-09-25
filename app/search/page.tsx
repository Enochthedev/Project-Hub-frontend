"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Bookmark,
  BookmarkCheck,
  FolderOpen,
  Users,
  MessageSquare,
  Target,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

// Mock search data
const mockSearchResults = {
  projects: [
    {
      id: "1",
      type: "project",
      title: "AI-Powered Student Performance Analytics",
      description:
        "A machine learning system to analyze and predict student performance patterns using historical academic data.",
      author: "John Doe",
      department: "Computer Science",
      tags: ["AI", "Analytics", "Education"],
      date: "2024-03-10",
      status: "active",
      relevance: 95,
    },
    {
      id: "2",
      type: "project",
      title: "Blockchain-Based Academic Credential Verification",
      description: "A decentralized system for verifying and storing academic credentials using blockchain technology.",
      author: "Mike Johnson",
      department: "Computer Science",
      tags: ["Blockchain", "Security", "Verification"],
      date: "2024-03-08",
      status: "pending",
      relevance: 88,
    },
  ],
  users: [
    {
      id: "1",
      type: "user",
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@ui.edu.ng",
      role: "supervisor",
      department: "Computer Science",
      specialization: "Machine Learning, AI",
      avatar: "/placeholder-user.jpg",
      relevance: 92,
    },
    {
      id: "2",
      type: "user",
      name: "John Doe",
      email: "john.doe@ui.edu.ng",
      role: "student",
      department: "Computer Science",
      specialization: "Data Science",
      avatar: "/placeholder-user.jpg",
      relevance: 85,
    },
  ],
  conversations: [
    {
      id: "1",
      type: "conversation",
      title: "Discussion on Machine Learning Algorithms",
      preview: "We discussed various ML algorithms including neural networks, decision trees, and ensemble methods...",
      participants: ["Dr. Sarah Wilson", "John Doe"],
      date: "2024-03-12",
      messageCount: 15,
      relevance: 90,
    },
    {
      id: "2",
      type: "conversation",
      title: "Project Proposal Review",
      preview: "Reviewing the blockchain project proposal and discussing implementation details...",
      participants: ["Prof. David Brown", "Mike Johnson"],
      date: "2024-03-11",
      messageCount: 8,
      relevance: 82,
    },
  ],
  milestones: [
    {
      id: "1",
      type: "milestone",
      title: "Complete Literature Review",
      description: "Finish comprehensive literature review for AI analytics project",
      project: "AI-Powered Student Performance Analytics",
      dueDate: "2024-03-20",
      status: "in_progress",
      priority: "high",
      relevance: 87,
    },
    {
      id: "2",
      type: "milestone",
      title: "System Architecture Design",
      description: "Design the overall system architecture for blockchain verification",
      project: "Blockchain-Based Academic Credential Verification",
      dueDate: "2024-03-25",
      status: "pending",
      priority: "medium",
      relevance: 80,
    },
  ],
}

const popularSearches = [
  "machine learning",
  "blockchain",
  "mobile app development",
  "data science",
  "artificial intelligence",
  "web development",
  "IoT projects",
  "cybersecurity",
]

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "title", label: "Title" },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([])

  // Combine all results for "all" tab
  const allResults = useMemo(() => {
    return [
      ...mockSearchResults.projects,
      ...mockSearchResults.users,
      ...mockSearchResults.conversations,
      ...mockSearchResults.milestones,
    ].sort((a, b) => {
      if (sortBy === "relevance") return b.relevance - a.relevance
      if (sortBy === "date") return new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
      if (sortBy === "title") return (a.title || a.name || "").localeCompare(b.title || b.name || "")
      return 0
    })
  }, [sortBy])

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return allResults

    return allResults.filter((item) => {
      const searchText = searchQuery.toLowerCase()
      const title = (item.title || item.name || "").toLowerCase()
      const description = (item.description || item.preview || item.specialization || "").toLowerCase()
      const tags = ("tags" in item ? item.tags?.join(" ") || "" : "").toLowerCase()

      return title.includes(searchText) || description.includes(searchText) || tags.includes(searchText)
    })
  }, [allResults, searchQuery])

  // Get filtered results by type
  const getResultsByType = (type: string) => {
    if (type === "all") return filteredResults
    return filteredResults.filter((item) => item.type === type)
  }

  const handleBookmark = (itemId: string) => {
    setBookmarkedItems((prev) => {
      if (prev.includes(itemId)) {
        toast.success("Removed from bookmarks")
        return prev.filter((id) => id !== itemId)
      } else {
        toast.success("Added to bookmarks")
        return [...prev, itemId]
      }
    })
  }

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query)
  }

  const renderProjectResult = (project: any) => (
    <Card key={project.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <Badge variant="outline">Project</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {project.relevance}% match
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => handleBookmark(project.id)}>
              {bookmarkedItems.includes(project.id) ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{project.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {project.author}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(project.date).toLocaleDateString()}
          </div>
          <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderUserResult = (user: any) => (
    <Card key={user.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <Badge variant="outline">User</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {user.relevance}% match
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => handleBookmark(user.id)}>
              {bookmarkedItems.includes(user.id) ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "supervisor" ? "default" : "secondary"}>{user.role}</Badge>
            <span className="text-muted-foreground">{user.department}</span>
          </div>
          <p className="text-muted-foreground">
            <strong>Specialization:</strong> {user.specialization}
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderConversationResult = (conversation: any) => (
    <Card key={conversation.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <Badge variant="outline">Conversation</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {conversation.relevance}% match
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => handleBookmark(conversation.id)}>
              {bookmarkedItems.includes(conversation.id) ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{conversation.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{conversation.preview}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {conversation.participants.join(", ")}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {conversation.messageCount} messages
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(conversation.date).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderMilestoneResult = (milestone: any) => (
    <Card key={milestone.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <Badge variant="outline">Milestone</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {milestone.relevance}% match
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => handleBookmark(milestone.id)}>
              {bookmarkedItems.includes(milestone.id) ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{milestone.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{milestone.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            {milestone.project}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Due: {new Date(milestone.dueDate).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={milestone.status === "in_progress" ? "default" : "secondary"}>
            {milestone.status.replace("_", " ")}
          </Badge>
          <Badge variant={milestone.priority === "high" ? "destructive" : "outline"}>
            {milestone.priority} priority
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  const renderResult = (item: any) => {
    switch (item.type) {
      case "project":
        return renderProjectResult(item)
      case "user":
        return renderUserResult(item)
      case "conversation":
        return renderConversationResult(item)
      case "milestone":
        return renderMilestoneResult(item)
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Global Search</h1>
        <p className="text-[#656176] dark:text-[#DECDF5]">
          Search across projects, users, conversations, and milestones
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search for projects, users, conversations, or milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg"
          />
        </div>
      </div>

      {/* Popular Searches */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePopularSearch(search)}
                  className="text-sm"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Search Results</h2>
              <p className="text-muted-foreground">
                Found {filteredResults.length} results for "{searchQuery}"
              </p>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All ({filteredResults.length})
              </TabsTrigger>
              <TabsTrigger value="project" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects ({getResultsByType("project").length})
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users ({getResultsByType("user").length})
              </TabsTrigger>
              <TabsTrigger value="conversation" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chats ({getResultsByType("conversation").length})
              </TabsTrigger>
              <TabsTrigger value="milestone" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Milestones ({getResultsByType("milestone").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {getResultsByType("all").map(renderResult)}
            </TabsContent>

            <TabsContent value="project" className="space-y-4">
              {getResultsByType("project").map(renderResult)}
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              {getResultsByType("user").map(renderResult)}
            </TabsContent>

            <TabsContent value="conversation" className="space-y-4">
              {getResultsByType("conversation").map(renderResult)}
            </TabsContent>

            <TabsContent value="milestone" className="space-y-4">
              {getResultsByType("milestone").map(renderResult)}
            </TabsContent>
          </Tabs>

          {/* No Results */}
          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or browse popular searches above.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

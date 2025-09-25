"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Search,
  BookmarkPlus,
  ExternalLink,
  FolderOpen,
  Users,
  MessageSquare,
  Target,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react"

interface SearchResult {
  id: string
  type: "project" | "user" | "conversation" | "milestone"
  title: string
  description: string
  relevanceScore: number
  metadata: any
  createdAt: string
  updatedAt: string
}

interface SearchFilters {
  type: string
  dateRange: string
  sortBy: string
  department?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    dateRange: "all",
    sortBy: "relevance",
  })
  const [activeTab, setActiveTab] = useState("all")
  const [popularSearches] = useState([
    "Machine Learning Projects",
    "Web Development",
    "Mobile Apps",
    "AI Research",
    "Database Design",
    "Blockchain",
    "IoT Projects",
    "Data Science",
  ])

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "project",
      title: "AI-Powered Student Performance Analytics",
      description:
        "A machine learning system to analyze and predict student performance patterns using historical academic data and behavioral indicators.",
      relevanceScore: 0.95,
      metadata: {
        author: "John Doe",
        department: "Computer Science",
        tags: ["AI", "Machine Learning", "Analytics"],
        status: "active",
        supervisor: "Dr. Sarah Wilson",
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:20:00Z",
    },
    {
      id: "2",
      type: "user",
      title: "Dr. Sarah Wilson",
      description:
        "Senior Lecturer in Computer Science specializing in Machine Learning and Data Analytics. Available for project supervision.",
      relevanceScore: 0.88,
      metadata: {
        role: "supervisor",
        department: "Computer Science",
        expertise: ["Machine Learning", "Data Science", "AI"],
        projectCount: 12,
        rating: 4.8,
      },
      createdAt: "2023-08-10T09:00:00Z",
      updatedAt: "2024-01-19T16:45:00Z",
    },
    {
      id: "3",
      type: "conversation",
      title: "How to implement neural networks in Python?",
      description:
        "Detailed discussion about implementing neural networks from scratch using Python and NumPy, including backpropagation algorithms.",
      relevanceScore: 0.82,
      metadata: {
        participants: ["AI Assistant", "Student"],
        messageCount: 15,
        topic: "Machine Learning",
        isBookmarked: false,
      },
      createdAt: "2024-01-18T11:20:00Z",
      updatedAt: "2024-01-18T12:30:00Z",
    },
    {
      id: "4",
      type: "milestone",
      title: "Complete Literature Review",
      description:
        "Comprehensive literature review for AI-powered analytics project covering recent advances in educational data mining.",
      relevanceScore: 0.76,
      metadata: {
        project: "AI-Powered Student Performance Analytics",
        status: "completed",
        dueDate: "2024-01-25",
        progress: 100,
      },
      createdAt: "2024-01-10T08:00:00Z",
      updatedAt: "2024-01-22T15:30:00Z",
    },
    {
      id: "5",
      type: "project",
      title: "Blockchain-Based Academic Credential Verification",
      description:
        "A decentralized system for verifying and managing academic credentials using blockchain technology and smart contracts.",
      relevanceScore: 0.71,
      metadata: {
        author: "Michael Johnson",
        department: "Information Systems",
        tags: ["Blockchain", "Security", "Verification"],
        status: "pending",
        supervisor: "Prof. David Brown",
      },
      createdAt: "2024-01-12T14:15:00Z",
      updatedAt: "2024-01-20T10:45:00Z",
    },
  ]

  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query, filters])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      // Mock API call - replace with actual search API
      await new Promise((resolve) => setTimeout(resolve, 800))

      let filteredResults = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (result.metadata.tags &&
            result.metadata.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
      )

      // Apply filters
      if (filters.type !== "all") {
        filteredResults = filteredResults.filter((result) => result.type === filters.type)
      }

      // Apply sorting
      if (filters.sortBy === "relevance") {
        filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
      } else if (filters.sortBy === "date") {
        filteredResults.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      }

      setResults(filteredResults)
    } catch (error) {
      toast.error("Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set("q", query)
      window.history.pushState({}, "", url.toString())
    }
  }

  const handleBookmark = async (resultId: string) => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Added to bookmarks")
    } catch (error) {
      toast.error("Failed to bookmark item")
    }
  }

  const getResultsByType = (type: string) => {
    if (type === "all") return results
    return results.filter((result) => result.type === type)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "conversation":
        return <MessageSquare className="h-4 w-4" />
      case "milestone":
        return <Target className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "conversation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "milestone":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Search Everything</h1>
        <p className="text-[#656176] dark:text-[#DECDF5]">
          Find projects, users, conversations, and milestones across the platform
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for projects, users, conversations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">Past week</SelectItem>
                  <SelectItem value="month">Past month</SelectItem>
                  <SelectItem value="year">Past year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Popular Searches */}
      {!query && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Searches
            </CardTitle>
            <CardDescription>Trending searches on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(search)
                    performSearch(search)
                  }}
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
      {query && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-[#656176] dark:text-[#DECDF5]">
              {loading ? "Searching..." : `${results.length} results for "${query}"`}
            </p>
            {results.length > 0 && (
              <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                Search completed in 0.{Math.floor(Math.random() * 9) + 1} seconds
              </p>
            )}
          </div>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All ({results.length})
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
              <SearchResultsList results={results} onBookmark={handleBookmark} />
            </TabsContent>

            <TabsContent value="project" className="space-y-4">
              <SearchResultsList results={getResultsByType("project")} onBookmark={handleBookmark} />
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              <SearchResultsList results={getResultsByType("user")} onBookmark={handleBookmark} />
            </TabsContent>

            <TabsContent value="conversation" className="space-y-4">
              <SearchResultsList results={getResultsByType("conversation")} onBookmark={handleBookmark} />
            </TabsContent>

            <TabsContent value="milestone" className="space-y-4">
              <SearchResultsList results={getResultsByType("milestone")} onBookmark={handleBookmark} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

// Search Results List Component
function SearchResultsList({
  results,
  onBookmark,
}: {
  results: SearchResult[]
  onBookmark: (id: string) => void
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No results found</p>
        <p className="text-[#656176] dark:text-[#DECDF5]">Try different keywords or adjust your filters</p>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "conversation":
        return <MessageSquare className="h-4 w-4" />
      case "milestone":
        return <Target className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "conversation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "milestone":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <Badge className={getTypeColor(result.type)}>
                    {getTypeIcon(result.type)}
                    <span className="ml-1 capitalize">{result.type}</span>
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-[#656176] dark:text-[#DECDF5]">
                      {Math.round(result.relevanceScore * 100)}% match
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">{result.title}</h3>
                  <p className="text-[#656176] dark:text-[#DECDF5] line-clamp-2">{result.description}</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#656176] dark:text-[#DECDF5]">
                  {result.metadata.author && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {result.metadata.author}
                    </div>
                  )}
                  {result.metadata.department && (
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {result.metadata.department}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(result.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Tags */}
                {result.metadata.tags && (
                  <div className="flex flex-wrap gap-2">
                    {result.metadata.tags.slice(0, 4).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {result.metadata.tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{result.metadata.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => onBookmark(result.id)} className="gap-2">
                  <BookmarkPlus className="h-4 w-4" />
                  Bookmark
                </Button>
                <Button size="sm" variant="ghost" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchPageLoading() {
  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

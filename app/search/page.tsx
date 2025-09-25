"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Search,
  BookmarkPlus,
  FolderOpen,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  Eye,
  User,
  Tag,
} from "lucide-react"

interface SearchResult {
  id: string
  type: "project" | "user" | "conversation" | "milestone"
  title: string
  description: string
  relevanceScore: number
  metadata: {
    author?: string
    date?: string
    tags?: string[]
    status?: string
    avatar?: string
    category?: string
  }
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "project",
    title: "AI-Powered Student Performance Analytics",
    description:
      "A machine learning system to analyze and predict student performance patterns using historical data and real-time metrics.",
    relevanceScore: 95,
    metadata: {
      author: "John Doe",
      date: "2024-01-20",
      tags: ["AI", "Analytics", "Education"],
      status: "Active",
      category: "Machine Learning",
    },
  },
  {
    id: "2",
    type: "user",
    title: "Dr. Sarah Wilson",
    description:
      "Professor of Computer Science specializing in Machine Learning and AI. Supervising 12 active projects.",
    relevanceScore: 88,
    metadata: {
      date: "Last active: 2024-01-19",
      tags: ["Supervisor", "AI", "Machine Learning"],
      status: "Active",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: "3",
    type: "conversation",
    title: "Discussion: Best practices for ML model validation",
    description:
      "A comprehensive discussion about validation techniques for machine learning models in academic research.",
    relevanceScore: 82,
    metadata: {
      author: "AI Assistant",
      date: "2024-01-18",
      tags: ["ML", "Validation", "Best Practices"],
      category: "Technical Discussion",
    },
  },
  {
    id: "4",
    type: "milestone",
    title: "Project Proposal Submission",
    description: "Deadline for submitting final project proposals for the Spring 2024 semester.",
    relevanceScore: 75,
    metadata: {
      date: "2024-02-15",
      status: "Upcoming",
      category: "Academic Deadline",
    },
  },
  {
    id: "5",
    type: "project",
    title: "Blockchain-Based Academic Credential Verification",
    description: "A decentralized system for verifying and managing academic credentials using blockchain technology.",
    relevanceScore: 70,
    metadata: {
      author: "Mike Johnson",
      date: "2024-01-18",
      tags: ["Blockchain", "Security", "Credentials"],
      status: "Under Review",
      category: "Blockchain",
    },
  },
]

const popularSearches = [
  "machine learning projects",
  "AI research proposals",
  "data science tutorials",
  "project collaboration",
  "academic deadlines",
  "supervisor recommendations",
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [results, setResults] = useState<SearchResult[]>(mockSearchResults)
  const [isSearching, setIsSearching] = useState(false)

  // Filter results based on active tab
  const filteredResults = useMemo(() => {
    let filtered = results

    if (activeTab !== "all") {
      filtered = filtered.filter((result) => result.type === activeTab)
    }

    // Sort results
    switch (sortBy) {
      case "relevance":
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore)
        break
      case "date":
        filtered.sort((a, b) => new Date(b.metadata.date || "").getTime() - new Date(a.metadata.date || "").getTime())
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return filtered
  }, [results, activeTab, sortBy])

  // Get result counts by type
  const resultCounts = useMemo(() => {
    const counts = {
      all: results.length,
      project: 0,
      user: 0,
      conversation: 0,
      milestone: 0,
    }

    results.forEach((result) => {
      counts[result.type]++
    })

    return counts
  }, [results])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)

    // Simulate search API call
    setTimeout(() => {
      // Filter mock results based on query
      const filtered = mockSearchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.metadata.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
          result.metadata.author?.toLowerCase().includes(query.toLowerCase()),
      )

      setResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  const handleBookmark = (resultId: string) => {
    toast.success("Added to bookmarks")
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
        return <Calendar className="h-4 w-4" />
      default:
        return null
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

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Search</h1>
          <p className="text-[#656176] dark:text-[#DECDF5]">Find projects, users, conversations, and more</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for projects, users, conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching}
            className="bg-[#1B998B] hover:bg-[#1B998B]/90"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Popular Searches */}
        {!searchQuery && (
          <div>
            <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF] mb-2">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(search)
                    handleSearch(search)
                  }}
                  className="text-xs"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {searchQuery && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF]">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-sm text-[#656176] dark:text-[#DECDF5]">{filteredResults.length} results found</p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({resultCounts.all})</TabsTrigger>
              <TabsTrigger value="project">Projects ({resultCounts.project})</TabsTrigger>
              <TabsTrigger value="user">Users ({resultCounts.user})</TabsTrigger>
              <TabsTrigger value="conversation">Conversations ({resultCounts.conversation})</TabsTrigger>
              <TabsTrigger value="milestone">Milestones ({resultCounts.milestone})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isSearching ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Result Header */}
                            <div className="flex items-center gap-3">
                              <Badge className={getTypeColor(result.type)}>
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(result.type)}
                                  <span className="capitalize">{result.type}</span>
                                </div>
                              </Badge>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                <span>{result.relevanceScore}% match</span>
                              </div>
                            </div>

                            {/* Result Content */}
                            <div>
                              <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">
                                {result.title}
                              </h3>
                              <p className="text-[#656176] dark:text-[#DECDF5] line-clamp-2">{result.description}</p>
                            </div>

                            {/* Result Metadata */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {result.metadata.author && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{result.metadata.author}</span>
                                </div>
                              )}
                              {result.metadata.date && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{result.metadata.date}</span>
                                </div>
                              )}
                              {result.metadata.status && (
                                <Badge variant="outline" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                            </div>

                            {/* Tags */}
                            {result.metadata.tags && result.metadata.tags.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                <div className="flex gap-1">
                                  {result.metadata.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {result.metadata.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{result.metadata.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => handleBookmark(result.id)}>
                              <BookmarkPlus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF] mb-2">No results found</h3>
                    <p className="text-[#656176] dark:text-[#DECDF5] mb-4">
                      Try adjusting your search terms or browse popular searches above.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setResults(mockSearchResults)
                      }}
                    >
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

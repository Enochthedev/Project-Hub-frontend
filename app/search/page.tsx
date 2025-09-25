"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, BookmarkPlus, Users, FolderOpen, MessageSquare, Clock, Star, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface SearchResult {
  id: string
  type: "project" | "user" | "conversation" | "milestone"
  title: string
  description: string
  relevanceScore: number
  metadata: any
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (query) {
      performSearch(query)
    } else {
      loadSuggestions()
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      // Mock search results - replace with actual API call
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "project",
          title: "AI-Powered Student Performance Analytics",
          description:
            "Develop a machine learning system to analyze student performance patterns and provide predictive insights for academic success.",
          relevanceScore: 0.95,
          metadata: {
            supervisor: "Dr. Sarah Johnson",
            tags: ["Machine Learning", "Analytics", "Education"],
            difficulty: "Advanced",
            students: 2,
          },
        },
        {
          id: "2",
          type: "user",
          title: "Dr. Sarah Johnson",
          description: "Professor of Computer Science specializing in Machine Learning and Educational Technology",
          relevanceScore: 0.88,
          metadata: {
            role: "supervisor",
            department: "Computer Science",
            projects: 12,
            students: 25,
          },
        },
        {
          id: "3",
          type: "conversation",
          title: "How to implement neural networks in Python?",
          description: "Discussion about implementing neural networks from scratch using Python and NumPy...",
          relevanceScore: 0.82,
          metadata: {
            date: "2024-01-10",
            messages: 15,
            bookmarked: true,
          },
        },
        {
          id: "4",
          type: "project",
          title: "Sustainable Campus Energy Management System",
          description:
            "Create a web application to monitor and optimize energy consumption across campus buildings using IoT sensors.",
          relevanceScore: 0.76,
          metadata: {
            supervisor: "Prof. Michael Chen",
            tags: ["IoT", "Sustainability", "Web Development"],
            difficulty: "Intermediate",
            students: 1,
          },
        },
      ]

      // Filter results based on query
      const filteredResults = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      setResults(filteredResults)
    } catch (error) {
      toast.error("Failed to perform search")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      // Mock suggestions - replace with actual API call
      setSuggestions([
        "machine learning projects",
        "web development tutorials",
        "data science resources",
        "AI research papers",
        "programming best practices",
      ])
    } catch (error) {
      console.error("Failed to load suggestions")
    }
  }

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchQuery)
    window.history.pushState({}, "", url.toString())
  }

  const handleBookmark = async (resultId: string) => {
    try {
      toast.success("Added to bookmarks")
    } catch (error) {
      toast.error("Failed to bookmark")
    }
  }

  const getFilteredResults = () => {
    if (activeTab === "all") return results
    return results.filter((result) => result.type === activeTab)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "project":
        return <FolderOpen className="h-5 w-5" />
      case "user":
        return <Users className="h-5 w-5" />
      case "conversation":
        return <MessageSquare className="h-5 w-5" />
      case "milestone":
        return <Clock className="h-5 w-5" />
      default:
        return <Search className="h-5 w-5" />
    }
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Project"
      case "user":
        return "User"
      case "conversation":
        return "Conversation"
      case "milestone":
        return "Milestone"
      default:
        return "Result"
    }
  }

  const renderResultCard = (result: SearchResult) => {
    switch (result.type) {
      case "project":
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary">Project</Badge>
                  <Badge className="bg-orange-100 text-orange-800">{result.metadata.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {Math.round(result.relevanceScore * 100)}% match
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleBookmark(result.id)}>
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">by {result.metadata.supervisor}</span>
                  <span className="text-sm text-muted-foreground">{result.metadata.students} students</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.metadata.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "user":
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder-user.jpg`} />
                    <AvatarFallback>
                      {result.title
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      <Badge variant="secondary">{result.metadata.role}</Badge>
                    </div>
                    <CardDescription>{result.description}</CardDescription>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(result.relevanceScore * 100)}% match</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{result.metadata.department}</span>
                <span>{result.metadata.projects} projects</span>
                <span>{result.metadata.students} students</span>
              </div>
            </CardContent>
          </Card>
        )

      case "conversation":
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <Badge variant="secondary">Conversation</Badge>
                  {result.metadata.bookmarked && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Bookmarked
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(result.relevanceScore * 100)}% match</span>
              </div>
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
                <span>{result.metadata.messages} messages</span>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getResultIcon(result.type)}
                  <Badge variant="secondary">{getResultTypeLabel(result.type)}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(result.relevanceScore * 100)}% match</span>
              </div>
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
          </Card>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-8 w-8" />
            Search
          </h1>
          <p className="text-muted-foreground">Find projects, users, conversations, and more</p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search for anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch(query)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={() => handleSearch(query)} disabled={!query.trim()}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Suggestions */}
        {!query && suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {query && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Search Results for "{query}"</h2>
                <p className="text-muted-foreground">{results.length} results found</p>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Results Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                <TabsTrigger value="project">
                  Projects ({results.filter((r) => r.type === "project").length})
                </TabsTrigger>
                <TabsTrigger value="user">Users ({results.filter((r) => r.type === "user").length})</TabsTrigger>
                <TabsTrigger value="conversation">
                  Conversations ({results.filter((r) => r.type === "conversation").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Searching...</p>
                  </div>
                ) : getFilteredResults().length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms or browse popular content</p>
                  </div>
                ) : (
                  <div className="space-y-4">{getFilteredResults().map(renderResultCard)}</div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { BookmarkPlus, Search, ExternalLink, Trash2, FolderOpen, Calendar, User, Tag } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjects } from "@/components/providers/projects-provider"
import Link from "next/link"

interface BookmarkedProject {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  tags: string[]
  supervisor: {
    name: string
    department: string
  }
  bookmarkedAt: string
  notes?: string
}

export default function BookmarksPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { savedProjects } = useProjects()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkedProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Convert saved projects to bookmarked projects format
    const convertedBookmarks: BookmarkedProject[] = savedProjects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      difficulty: project.difficulty,
      tags: project.tags || [],
      supervisor: {
        name: "Dr. Smith", // Mock data
        department: "Computer Science",
      },
      bookmarkedAt: new Date().toISOString(),
      notes: project.notes,
    }))

    setBookmarks(convertedBookmarks)
    setIsLoading(false)
  }, [isAuthenticated, savedProjects, router])

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || bookmark.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(bookmarks.map((b) => b.category)))]

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookmarkPlus className="h-8 w-8" />
            My Bookmarks
          </h1>
          <p className="text-muted-foreground">Projects you've saved for later review ({bookmarks.length} total)</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookmarked projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {filteredBookmarks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookmarkPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {bookmarks.length === 0
                  ? "Start exploring projects and bookmark the ones that interest you"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {bookmarks.length === 0 && (
                <Link href="/projects">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Discover Projects
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {bookmark.title}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">{bookmark.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category and Difficulty */}
                  <div className="flex gap-2">
                    <Badge variant="secondary">{bookmark.category}</Badge>
                    <Badge variant="outline">{bookmark.difficulty}</Badge>
                  </div>

                  {/* Tags */}
                  {bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {bookmark.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{bookmark.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Supervisor */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{bookmark.supervisor.name}</span>
                    <span>•</span>
                    <span>{bookmark.supervisor.department}</span>
                  </div>

                  {/* Bookmarked Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Notes */}
                  {bookmark.notes && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {bookmark.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/projects/${bookmark.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookmarks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bookmark Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{bookmarks.length}</div>
                  <div className="text-sm text-muted-foreground">Total Bookmarks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{categories.length - 1}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Array.from(new Set(bookmarks.flatMap((b) => b.tags))).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unique Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Array.from(new Set(bookmarks.map((b) => b.supervisor.name))).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Supervisors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

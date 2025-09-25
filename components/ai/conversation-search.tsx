"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface SearchFilters {
  query: string
  dateRange: string
  tags: string[]
  status: string
}

export function ConversationSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    dateRange: "all",
    tags: [],
    status: "all",
  })

  const availableTags = [
    "planning",
    "web-dev",
    "ml",
    "concepts",
    "database",
    "design",
    "react",
    "best-practices",
    "api",
    "auth",
  ]

  const handleSearch = () => {
    // Implement search logic here
    console.log("Searching with filters:", filters)
  }

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      dateRange: "all",
      tags: [],
      status: "all",
    })
  }

  const hasActiveFilters =
    filters.query || filters.dateRange !== "all" || filters.tags.length > 0 || filters.status !== "all"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Conversations
        </CardTitle>
        <CardDescription>Find specific conversations using keywords, tags, or filters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search conversations..."
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              className="w-full"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select
            value={filters.dateRange}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="bookmarked">Bookmarked</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Tags:</span>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {filters.query && <Badge variant="secondary">Query: "{filters.query}"</Badge>}
              {filters.dateRange !== "all" && <Badge variant="secondary">Date: {filters.dateRange}</Badge>}
              {filters.status !== "all" && <Badge variant="secondary">Status: {filters.status}</Badge>}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  Tag: {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

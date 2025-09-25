"use client"

import { useState, useEffect } from "react"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  Calendar,
  MessageCircle,
  Star,
  Bookmark,
  X,
  SlidersHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

interface ConversationSearchProps {
  onResultsChange?: (results: any[]) => void
  className?: string
}

interface SearchFilters {
  query: string
  status?: 'active' | 'archived' | 'escalated'
  dateRange?: {
    from: Date
    to: Date
  }
  hasBookmarks?: boolean
  minRating?: number
  projectId?: string
}

export function ConversationSearch({ onResultsChange, className }: ConversationSearchProps) {
  const { searchConversations, conversations, isLoadingConversations } = useAIAssistantStore()
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  const performSearch = async () => {
    try {
      const searchParams: any = {}
      
      if (filters.query) searchParams.search = filters.query
      if (filters.status) searchParams.status = filters.status
      if (filters.projectId) searchParams.projectId = filters.projectId
      if (filters.dateRange?.from) {
        searchParams.startDate = filters.dateRange.from.toISOString()
      }
      if (filters.dateRange?.to) {
        searchParams.endDate = filters.dateRange.to.toISOString()
      }

      await searchConversations(searchParams)
      
      // Filter results based on additional criteria
      let results = conversations
      
      if (filters.hasBookmarks) {
        results = results.filter(conv => 
          conv.messages?.some(msg => msg.isBookmarked)
        )
      }
      
      if (filters.minRating) {
        results = results.filter(conv => 
          conv.messages?.some(msg => 
            msg.averageRating && msg.averageRating >= filters.minRating!
          )
        )
      }

      setSearchResults(results)
      onResultsChange?.(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ query: '' })
    setShowAdvancedFilters(false)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status) count++
    if (filters.dateRange) count++
    if (filters.hasBookmarks) count++
    if (filters.minRating) count++
    if (filters.projectId) count++
    return count
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656176] dark:text-[#DECDF5]" />
        <Input
          placeholder="Search conversations, messages, or topics..."
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          className="pl-10 pr-20 border-[#DECDF5] dark:border-[#656176]"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "h-7 px-2",
              showAdvancedFilters && "bg-[#1B998B]/10 text-[#1B998B]"
            )}
          >
            <SlidersHorizontal className="h-3 w-3" />
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-[#F8F1FF] dark:bg-[#656176]/30 rounded-lg border border-[#DECDF5] dark:border-[#656176] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
              Advanced Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-[#656176] dark:text-[#DECDF5]"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#534D56] dark:text-[#F8F1FF]">
                Status
              </label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => updateFilter('status', value || undefined)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#534D56] dark:text-[#F8F1FF]">
                Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 text-xs justify-start font-normal"
                  >
                    <Calendar className="h-3 w-3 mr-2" />
                    {filters.dateRange ? (
                      `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}`
                    ) : (
                      'Select dates'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={(range) => updateFilter('dateRange', range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#534D56] dark:text-[#F8F1FF]">
                Min Rating
              </label>
              <Select
                value={filters.minRating?.toString() || ''}
                onValueChange={(value) => updateFilter('minRating', value ? parseFloat(value) : undefined)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any rating</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="2">2+ stars</SelectItem>
                  <SelectItem value="1">1+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.hasBookmarks ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('hasBookmarks', !filters.hasBookmarks)}
              className="h-7 text-xs"
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Has Bookmarks
            </Button>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {filters.query && (
        <div className="flex items-center justify-between text-sm text-[#656176] dark:text-[#DECDF5]">
          <span>
            {isLoadingConversations ? 'Searching...' : `${searchResults.length} conversations found`}
          </span>
          {searchResults.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('query', '')}
              className="h-6 px-2 text-xs"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        {filters.status && (
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => updateFilter('status', undefined)}
          >
            Status: {filters.status}
            <X className="h-3 w-3 ml-1" />
          </Badge>
        )}
        
        {filters.dateRange && (
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => updateFilter('dateRange', undefined)}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Date range
            <X className="h-3 w-3 ml-1" />
          </Badge>
        )}
        
        {filters.hasBookmarks && (
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => updateFilter('hasBookmarks', false)}
          >
            <Bookmark className="h-3 w-3 mr-1" />
            Has bookmarks
            <X className="h-3 w-3 ml-1" />
          </Badge>
        )}
        
        {filters.minRating && (
          <Badge 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => updateFilter('minRating', undefined)}
          >
            <Star className="h-3 w-3 mr-1" />
            {filters.minRating}+ stars
            <X className="h-3 w-3 ml-1" />
          </Badge>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ProjectCard } from "@/components/shared/project-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Search, Filter, SlidersHorizontal, ArrowUpDown, Loader2 } from "lucide-react"
import { useProjects } from "@/components/providers/projects-provider"
import { AIAssistantButton } from "@/components/ai/assistant-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import { useProjectsStore } from "@/lib/stores/projects-store"
import { SearchFilters } from "@/lib/api/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { cn } from "@/lib/utils"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { TouchButton } from "@/components/ui/touch-button"
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"

// Updated categories based on API specializations
const specializations = [
  "All", 
  "AI", 
  "ML", 
  "WebDev", 
  "MobileDev", 
  "DataScience", 
  "Cybersecurity", 
  "IoT", 
  "Blockchain", 
  "GameDev", 
  "DevOps"
]

const difficulties = ["All", "beginner", "intermediate", "advanced", "expert"]

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date Created" },
  { value: "title", label: "Title" },
  { value: "popularity", label: "Popularity" },
]

const sortOrders = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
]

// Common tags for filtering
const commonTags = [
  "JavaScript",
  "Python",
  "React",
  "Machine Learning",
  "Mobile",
  "Web",
  "Research",
  "AI",
  "Database",
  "Cloud",
  "Frontend",
  "Backend",
  "Full Stack",
  "Node.js",
  "TypeScript",
  "Vue.js",
  "Angular",
  "Django",
  "Flask",
  "Spring Boot",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
]

export default function ExplorePage() {
  const { isMobile, isMobileSmall, isTablet, isTouch } = useMobile()
  const projectsStore = useProjectsStore()
  
  // Local state for filters and UI
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    query: "",
    specializations: [],
    difficultyLevels: [],
    tags: [],
    isGroupProject: undefined,
    sortBy: "relevance",
    sortOrder: "desc",
    limit: 12,
    offset: 0,
  })
  
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localFilters.query])

  // Search projects when filters change (except query which is debounced)
  useEffect(() => {
    if (localFilters.specializations?.length || 
        localFilters.difficultyLevels?.length || 
        localFilters.tags?.length || 
        localFilters.isGroupProject !== undefined ||
        localFilters.sortBy !== "relevance" ||
        localFilters.sortOrder !== "desc") {
      handleSearch()
    }
  }, [
    localFilters.specializations,
    localFilters.difficultyLevels,
    localFilters.tags,
    localFilters.isGroupProject,
    localFilters.sortBy,
    localFilters.sortOrder,
  ])

  // Load initial projects
  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = useCallback(async () => {
    try {
      const searchFilters = {
        ...localFilters,
        offset: 0, // Reset to first page on new search
      }
      await projectsStore.searchProjects(searchFilters)
      setCurrentPage(1)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, [localFilters, projectsStore])

  const handlePageChange = useCallback(async (page: number) => {
    const offset = (page - 1) * (localFilters.limit || 12)
    try {
      const searchFilters = {
        ...localFilters,
        offset,
      }
      await projectsStore.searchProjects(searchFilters)
      setCurrentPage(page)
    } catch (error) {
      console.error('Page change failed:', error)
    }
  }, [localFilters, projectsStore])

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    
    setSelectedTags(newTags)
    setLocalFilters(prev => ({
      ...prev,
      tags: newTags,
    }))
  }

  const handleSpecializationChange = (specialization: string) => {
    const newSpecializations = specialization === "All" 
      ? [] 
      : [specialization]
    
    setLocalFilters(prev => ({
      ...prev,
      specializations: newSpecializations,
    }))
  }

  const handleDifficultyChange = (difficulty: string) => {
    const newDifficulties = difficulty === "All" 
      ? [] 
      : [difficulty]
    
    setLocalFilters(prev => ({
      ...prev,
      difficultyLevels: newDifficulties,
    }))
  }

  const clearAllFilters = () => {
    setLocalFilters({
      query: "",
      specializations: [],
      difficultyLevels: [],
      tags: [],
      isGroupProject: undefined,
      sortBy: "relevance",
      sortOrder: "desc",
      limit: 12,
      offset: 0,
    })
    setSelectedTags([])
    setCurrentPage(1)
  }

  // Calculate pagination
  const totalPages = projectsStore.searchResults 
    ? Math.ceil(projectsStore.searchResults.total / (localFilters.limit || 12))
    : 0

  const hasActiveFilters = useMemo(() => {
    return localFilters.query ||
           localFilters.specializations?.length ||
           localFilters.difficultyLevels?.length ||
           localFilters.tags?.length ||
           localFilters.isGroupProject !== undefined ||
           localFilters.sortBy !== "relevance" ||
           localFilters.sortOrder !== "desc"
  }, [localFilters])

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Specialization Filter */}
      <div className="space-y-2">
        <Label htmlFor="specialization" className="text-[#534D56] dark:text-[#F8F1FF]">
          Specialization
        </Label>
        <Select
          value={localFilters.specializations?.[0] || "All"}
          onValueChange={handleSpecializationChange}
        >
          <SelectTrigger
            id="specialization"
            className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
          >
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
            {specializations.map((specialization) => (
              <SelectItem
                key={specialization}
                value={specialization}
                className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
              >
                {specialization === "All" ? "All Specializations" : specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <Label htmlFor="difficulty" className="text-[#534D56] dark:text-[#F8F1FF]">
          Difficulty Level
        </Label>
        <Select
          value={localFilters.difficultyLevels?.[0] || "All"}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger
            id="difficulty"
            className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
          >
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
            {difficulties.map((difficulty) => (
              <SelectItem
                key={difficulty}
                value={difficulty}
                className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
              >
                {difficulty === "All" ? "All Levels" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Group Projects Filter */}
      <div className="flex items-center space-x-2">
        <Switch
          id="group-projects"
          checked={localFilters.isGroupProject === true}
          onCheckedChange={(checked) => 
            setLocalFilters(prev => ({ 
              ...prev, 
              isGroupProject: checked ? true : undefined 
            }))
          }
          className="data-[state=checked]:bg-[#1B998B]"
        />
        <Label htmlFor="group-projects" className="text-[#534D56] dark:text-[#F8F1FF]">
          Group Projects Only
        </Label>
      </div>

      {/* Sorting Options */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sort-by" className="text-[#534D56] dark:text-[#F8F1FF]">
            Sort By
          </Label>
          <Select
            value={localFilters.sortBy || "relevance"}
            onValueChange={(value) => 
              setLocalFilters(prev => ({ 
                ...prev, 
                sortBy: value as SearchFilters['sortBy']
              }))
            }
          >
            <SelectTrigger
              id="sort-by"
              className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
              {sortOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort-order" className="text-[#534D56] dark:text-[#F8F1FF]">
            Sort Order
          </Label>
          <Select
            value={localFilters.sortOrder || "desc"}
            onValueChange={(value) => 
              setLocalFilters(prev => ({ 
                ...prev, 
                sortOrder: value as SearchFilters['sortOrder']
              }))
            }
          >
            <SelectTrigger
              id="sort-order"
              className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
            >
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
              {sortOrders.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <Label className="text-[#534D56] dark:text-[#F8F1FF]">Tags</Label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {commonTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={
                selectedTags.includes(tag)
                  ? "cursor-pointer bg-[#1B998B] hover:bg-[#1B998B]/90"
                  : "cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50"
              }
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full border-[#DECDF5] text-[#534D56] dark:border-[#656176] dark:text-[#F8F1FF]"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <main className="min-h-screen">
      <ResponsiveContainer className={cn("py-8", isMobileSmall ? "py-6" : "py-12")}>
        <div className={cn("mb-8 flex flex-col gap-4", !isMobile && "sm:flex-row sm:items-center sm:justify-between")}>
          <div>
            <h1 className={cn(
              "font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF]",
              isMobileSmall ? "text-2xl" : "text-3xl sm:text-4xl"
            )}>
              Explore Projects
            </h1>
            <p className={cn(
              "mt-2 text-[#656176] dark:text-[#DECDF5]",
              isMobileSmall ? "text-sm" : "text-base"
            )}>
              Browse through our collection of project ideas for students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <TouchButton
                    variant="outline"
                    size={isMobileSmall ? "sm" : "default"}
                    className="gap-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </TouchButton>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className={cn(
                    "bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]",
                    isMobileSmall ? "w-[90vw] max-w-[320px]" : "w-[350px]"
                  )}
                >
                  <SheetHeader>
                    <SheetTitle className="text-[#534D56] dark:text-[#F8F1FF]">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656176] dark:text-[#DECDF5]" />
          <Input
            placeholder={isMobileSmall ? "Search projects..." : "Search projects by title, description, or tags..."}
            className={cn(
              "pl-9 pr-4 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]",
              isMobileSmall ? "h-12 text-base" : "h-10"
            )}
            value={localFilters.query || ""}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, query: e.target.value }))}
          />
          {projectsStore.isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#656176] dark:text-[#DECDF5]" />
          )}
        </div>

        <div className={cn("grid gap-6", !isMobile && "md:grid-cols-[300px_1fr] lg:gap-8")}>
        {!isMobile && (
          <Card className="h-fit border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#534D56] dark:text-[#F8F1FF]">
                <Filter className="h-4 w-4" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FiltersContent />
            </CardContent>
          </Card>
        )}

        <div>
          {/* Results Header */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                {projectsStore.searchResults ? (
                  <>
                    Showing {projectsStore.searchResults.projects.length} of {projectsStore.searchResults.total} projects
                    {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </>
                ) : (
                  "Loading projects..."
                )}
              </p>
              {projectsStore.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-[#656176] dark:text-[#DECDF5]" />
              )}
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-[#534D56] dark:text-[#F8F1FF] hover:bg-[#DECDF5]/20 dark:hover:bg-[#656176]/20"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              {localFilters.specializations?.map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="bg-[#1B998B]/10 text-[#1B998B] border-[#1B998B]/20"
                >
                  {spec}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleSpecializationChange("All")}
                  />
                </Badge>
              ))}
              {localFilters.difficultyLevels?.map((diff) => (
                <Badge
                  key={diff}
                  variant="secondary"
                  className="bg-[#1B998B]/10 text-[#1B998B] border-[#1B998B]/20"
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleDifficultyChange("All")}
                  />
                </Badge>
              ))}
              {localFilters.isGroupProject && (
                <Badge
                  variant="secondary"
                  className="bg-[#1B998B]/10 text-[#1B998B] border-[#1B998B]/20"
                >
                  Group Projects
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => setLocalFilters(prev => ({ ...prev, isGroupProject: undefined }))}
                  />
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-[#1B998B]/10 text-[#1B998B] border-[#1B998B]/20"
                >
                  {tag}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleTagToggle(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Error State */}
          {projectsStore.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/30">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Projects</h3>
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {projectsStore.error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  projectsStore.clearError()
                  handleSearch()
                }}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {projectsStore.isLoading && !projectsStore.searchResults && (
            <ResponsiveGrid
              cols={{
                xs: 1,
                sm: isMobileSmall ? 1 : 2,
                md: 2,
                lg: 3,
                xl: 3,
                "2xl": 4
              }}
              gap={isMobileSmall ? "sm" : "md"}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-[#DECDF5] dark:border-[#656176]">
                  <CardHeader className={cn(isMobileSmall ? "p-4" : "p-6")}>
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className={cn(isMobileSmall ? "p-4 pt-0" : "p-6 pt-0")}>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          )}

          {/* No Results State */}
          {!projectsStore.isLoading && projectsStore.searchResults && projectsStore.searchResults.projects.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#DECDF5] dark:border-[#656176] p-8 text-center">
              <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No projects found</h3>
              <p className="mt-2 text-sm text-[#656176] dark:text-[#DECDF5]">
                {hasActiveFilters 
                  ? "Try adjusting your filters to find more projects."
                  : "No projects are currently available."
                }
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}

          {/* Projects Grid */}
          {!projectsStore.isLoading && projectsStore.searchResults && projectsStore.searchResults.projects.length > 0 && (
            <>
              <ResponsiveGrid
                cols={{
                  xs: 1,
                  sm: isMobileSmall ? 1 : 2,
                  md: 2,
                  lg: 3,
                  xl: 3,
                  "2xl": 4
                }}
                gap={isMobileSmall ? "sm" : "md"}
                className="w-full"
              >
                {projectsStore.searchResults.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </ResponsiveGrid>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                              className="cursor-pointer"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
        </div>
        <AIAssistantButton />
      </ResponsiveContainer>
    </main>
  )
}

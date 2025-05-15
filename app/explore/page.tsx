"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/shared/project-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Search, Filter, SlidersHorizontal } from "lucide-react"
import { useProjects } from "@/components/providers/projects-provider"
import { AIAssistantButton } from "@/components/ai/assistant-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

const categories = ["All", "Web", "Mobile", "AI", "Data Science", "Game Dev", "IoT", "Blockchain"]

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"]

const allTags = [
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
]

export default function ExplorePage() {
  const { allProjects } = useProjects()
  const { isMobile } = useMobile()
  const [filters, setFilters] = useState({
    category: "All",
    difficulty: "All",
    search: "",
    tags: [] as string[],
    groupProjects: false,
  })

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const filteredProjects = allProjects.filter((project) => {
    // Filter by category
    if (filters.category !== "All" && project.category !== filters.category) {
      return false
    }

    // Filter by difficulty
    if (filters.difficulty !== "All" && project.difficulty !== filters.difficulty) {
      return false
    }

    // Filter by search
    if (
      filters.search &&
      !project.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !project.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Filter by tags
    if (filters.tags.length > 0 && !filters.tags.some((tag) => project.tags.includes(tag))) {
      return false
    }

    // Filter by group projects
    if (filters.groupProjects && !project.isGroupProject) {
      return false
    }

    return true
  })

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category" className="text-[#534D56] dark:text-[#F8F1FF]">
          Category
        </Label>
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger
            id="category"
            className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
            {categories.map((category) => (
              <SelectItem
                key={category}
                value={category}
                className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty" className="text-[#534D56] dark:text-[#F8F1FF]">
          Difficulty
        </Label>
        <Select
          value={filters.difficulty}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, difficulty: value }))}
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
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="group-projects"
          checked={filters.groupProjects}
          onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, groupProjects: checked }))}
          className="data-[state=checked]:bg-[#1B998B]"
        />
        <Label htmlFor="group-projects" className="text-[#534D56] dark:text-[#F8F1FF]">
          Group Projects Only
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-[#534D56] dark:text-[#F8F1FF]">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              className={
                filters.tags.includes(tag)
                  ? "cursor-pointer bg-[#1B998B] hover:bg-[#1B998B]/90"
                  : "cursor-pointer border-[#DECDF5] hover:bg-[#DECDF5]/50 dark:border-[#656176] dark:hover:bg-[#656176]/50"
              }
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              {filters.tags.includes(tag) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <main className="container py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-4xl">
            Explore Projects
          </h1>
          <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
            Browse through our collection of project ideas for students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 text-[#534D56] dark:text-[#F8F1FF]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
                <SheetHeader>
                  <SheetTitle className="text-[#534D56] dark:text-[#F8F1FF]">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656176] dark:text-[#DECDF5]" />
        <Input
          placeholder="Search projects..."
          className="pl-9 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
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
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Showing {filteredProjects.length} projects</p>
            {filters.tags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters((prev) => ({ ...prev, tags: [] }))}
                className="text-xs text-[#534D56] dark:text-[#F8F1FF]"
              >
                Clear filters
              </Button>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#DECDF5] dark:border-[#656176] p-8 text-center">
              <h3 className="text-lg font-medium text-[#534D56] dark:text-[#F8F1FF]">No projects found</h3>
              <p className="mt-2 text-sm text-[#656176] dark:text-[#DECDF5]">
                Try adjusting your filters to find more projects.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AIAssistantButton />
    </main>
  )
}

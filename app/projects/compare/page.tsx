"use client"
import { ProjectCompareContent } from "@/components/projects/project-compare-content"

interface ProjectComparePageProps {
  searchParams: Promise<{
    projects?: string
    view?: string
  }>
}

export default async function ProjectComparePage(props: ProjectComparePageProps) {
  const searchParams = await props.searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compare Projects</h1>
        <p className="text-muted-foreground">Compare different projects side by side to make informed decisions</p>
      </div>

      <ProjectCompareContent searchParams={searchParams} />
    </div>
  )
}

import { Suspense } from "react"
import ProjectCompareContent from "@/components/projects/project-compare-content"
import ProjectCompareLoading from "./loading"

interface ProjectComparePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectComparePage({ searchParams }: ProjectComparePageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<ProjectCompareLoading />}>
      <ProjectCompareContent searchParams={params} />
    </Suspense>
  )
}

import { Suspense } from "react"
import { ProjectCompareContent } from "@/components/projects/project-compare-content"
import ProjectCompareLoading from "./loading"

export default async function ProjectComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <Suspense fallback={<ProjectCompareLoading />}>
      <ProjectCompareContent searchParams={params} />
    </Suspense>
  )
}

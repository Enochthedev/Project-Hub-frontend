'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectAnalytics from '@/components/supervisor/project-analytics'
import StudentPerformanceComparison from '@/components/supervisor/student-performance-comparison'
import ExportableReports from '@/components/supervisor/exportable-reports'

export default function SupervisorAnalyticsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { studentProgress, fetchStudentProgress } = useSupervisorStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && user.role !== 'supervisor' && user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, isAuthenticated, router])

  useEffect(() => {
    if (user?.role === 'supervisor' || user?.role === 'admin') {
      fetchStudentProgress()
    }
  }, [user, fetchStudentProgress])

  if (!isAuthenticated || !user) {
    return <PageSkeleton />
  }

  if (user.role !== 'supervisor' && user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You need supervisor or admin privileges to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics, performance comparisons, and exportable reports
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="project-analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="project-analytics">Project Analytics</TabsTrigger>
            <TabsTrigger value="student-comparison">Student Comparison</TabsTrigger>
            <TabsTrigger value="reports">Exportable Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="project-analytics" className="space-y-6">
            <ProjectAnalytics />
          </TabsContent>

          <TabsContent value="student-comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Comparison</CardTitle>
                <CardDescription>
                  Compare performance metrics across multiple students to identify trends and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentPerformanceComparison students={studentProgress} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ExportableReports students={studentProgress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
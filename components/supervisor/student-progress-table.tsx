'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import { StudentProgressSummary } from '@/lib/api/supervisor'
import { 
  Search, 
  Eye, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'

type SortField = 'name' | 'completionRate' | 'overdue' | 'lastActivity'
type SortOrder = 'asc' | 'desc'

export default function StudentProgressTable() {
  const {
    studentProgress,
    isStudentProgressLoading,
    studentProgressError,
    fetchStudentProgress,
    fetchStudentDetails
  } = useSupervisorStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    fetchStudentProgress()
  }, [fetchStudentProgress])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getRiskLevel = (riskScore: number): 'high' | 'medium' | 'low' => {
    if (riskScore >= 0.7) return 'high'
    if (riskScore >= 0.4) return 'medium'
    return 'low'
  }

  const filteredAndSortedStudents = studentProgress
    .filter(student => {
      const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) return false
      
      if (riskFilter === 'all') return true
      return getRiskLevel(student.riskScore) === riskFilter
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.studentName.toLowerCase()
          bValue = b.studentName.toLowerCase()
          break
        case 'completionRate':
          aValue = a.completionRate
          bValue = b.completionRate
          break
        case 'overdue':
          aValue = a.overdueMilestones
          bValue = b.overdueMilestones
          break
        case 'lastActivity':
          aValue = a.lastActivity ? new Date(a.lastActivity).getTime() : 0
          bValue = b.lastActivity ? new Date(b.lastActivity).getTime() : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  const handleViewDetails = (studentId: string) => {
    fetchStudentDetails(studentId)
  }

  const handleContactStudent = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore >= 0.7) return 'destructive'
    if (riskScore >= 0.4) return 'secondary'
    return 'default'
  }

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 0.7) return 'High'
    if (riskScore >= 0.4) return 'Medium'
    return 'Low'
  }

  if (isStudentProgressLoading) {
    return <TableSkeleton />
  }

  if (studentProgressError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {studentProgressError}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStudentProgress}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={riskFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('all')}
          >
            All
          </Button>
          <Button
            variant={riskFilter === 'high' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('high')}
          >
            High Risk
          </Button>
          <Button
            variant={riskFilter === 'medium' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('medium')}
          >
            Medium Risk
          </Button>
          <Button
            variant={riskFilter === 'low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRiskFilter('low')}
          >
            Low Risk
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold"
                >
                  Student
                  {sortField === 'name' && (
                    sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('completionRate')}
                  className="h-auto p-0 font-semibold"
                >
                  Progress
                  {sortField === 'completionRate' && (
                    sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Milestones</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('lastActivity')}
                  className="h-auto p-0 font-semibold"
                >
                  Last Activity
                  {sortField === 'lastActivity' && (
                    sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No students found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedStudents.map((student) => (
                <TableRow key={student.studentId} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={student.studentName} />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.studentName}</p>
                        <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{student.completionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={student.completionRate} className="h-1.5 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" size="sm" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {student.completedMilestones}
                      </Badge>
                      <Badge variant="outline" size="sm" className="text-blue-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {student.inProgressMilestones}
                      </Badge>
                      {student.overdueMilestones > 0 && (
                        <Badge variant="secondary" size="sm" className="text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {student.overdueMilestones}
                        </Badge>
                      )}
                      {student.blockedMilestones > 0 && (
                        <Badge variant="destructive" size="sm">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {student.blockedMilestones}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(student.riskScore)} size="sm">
                      {getRiskLabel(student.riskScore)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {student.lastActivity 
                        ? new Date(student.lastActivity).toLocaleDateString()
                        : 'No activity'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(student.studentId)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContactStudent(student.studentEmail)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedStudents.length} of {studentProgress.length} students
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Milestones</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40 mt-1" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useSupervisorStore } from '@/lib/stores/supervisor-store'
import { StudentProgressSummary, ProgressReportFilters } from '@/lib/api/supervisor'
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Loader2
} from 'lucide-react'

interface ExportableReportsProps {
  students: StudentProgressSummary[]
}

export default function ExportableReports({ students }: ExportableReportsProps) {
  const {
    isExportLoading,
    exportError,
    exportReport,
    generateReport
  } = useSupervisorStore()

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'analytics'>('summary')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'overdue'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all')
  const [includeNotes, setIncludeNotes] = useState(true)
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  const handleStudentToggle = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.studentId))
    }
  }

  const buildReportFilters = (): ProgressReportFilters => {
    const filters: ProgressReportFilters = {}

    if (selectedStudents.length > 0) {
      filters.studentIds = selectedStudents
    }

    if (dateRange.startDate) {
      filters.startDate = dateRange.startDate
    }

    if (dateRange.endDate) {
      filters.endDate = dateRange.endDate
    }

    if (statusFilter !== 'all') {
      filters.status = statusFilter as any
    }

    if (priorityFilter !== 'all') {
      filters.priority = priorityFilter as any
    }

    return filters
  }

  const handleGenerateReport = async () => {
    try {
      const filters = buildReportFilters()
      await generateReport(filters)
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const handleExportReport = async () => {
    try {
      const filters = buildReportFilters()
      const exportedReport = await exportReport(exportFormat, filters)
      
      // Create download link
      const blob = new Blob([atob(exportedReport.content)], { type: exportedReport.mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = exportedReport.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  const getReportPreview = () => {
    const selectedStudentData = students.filter(s => selectedStudents.includes(s.studentId))
    
    return {
      totalStudents: selectedStudents.length || students.length,
      selectedStudents: selectedStudentData,
      dateRange: dateRange.startDate && dateRange.endDate 
        ? `${dateRange.startDate} to ${dateRange.endDate}`
        : 'All time',
      filters: {
        status: statusFilter,
        priority: priorityFilter
      }
    }
  }

  const preview = getReportPreview()

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Exportable Reports
          </CardTitle>
          <CardDescription>
            Create comprehensive reports for academic record keeping and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type and Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Progress Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="analytics">Performance Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV Spreadsheet
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Students</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
              {students.map((student) => (
                <div key={student.studentId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`export-${student.studentId}`}
                    checked={selectedStudents.includes(student.studentId)}
                    onCheckedChange={() => handleStudentToggle(student.studentId)}
                  />
                  <label 
                    htmlFor={`export-${student.studentId}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {student.studentName}
                  </label>
                  <Badge 
                    variant={student.riskScore > 0.7 ? 'destructive' : student.riskScore > 0.4 ? 'secondary' : 'default'}
                    size="sm"
                  >
                    {student.completionRate.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
            {selectedStudents.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <Label>Filters</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Milestone Status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed Only</SelectItem>
                    <SelectItem value="in_progress">In Progress Only</SelectItem>
                    <SelectItem value="overdue">Overdue Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Priority Level</Label>
                <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                    <SelectItem value="high">High Only</SelectItem>
                    <SelectItem value="medium">Medium Only</SelectItem>
                    <SelectItem value="low">Low Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom Report Details */}
          <div className="space-y-3">
            <Label>Custom Report Details (Optional)</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="custom-title" className="text-sm">Report Title</Label>
                <Input
                  id="custom-title"
                  placeholder="e.g., Q1 2024 Student Progress Report"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-description" className="text-sm">Report Description</Label>
                <Textarea
                  id="custom-description"
                  placeholder="Brief description of the report purpose and scope..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label>Additional Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-notes"
                checked={includeNotes}
                onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
              />
              <label htmlFor="include-notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Include milestone notes and comments
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            Preview of what will be included in your report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{preview.totalStudents}</strong> student{preview.totalStudents > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{preview.dateRange}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{statusFilter}</strong> status, <strong>{priorityFilter}</strong> priority
              </span>
            </div>
          </div>

          {preview.selectedStudents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Students:</h4>
              <div className="flex flex-wrap gap-2">
                {preview.selectedStudents.slice(0, 10).map((student) => (
                  <Badge key={student.studentId} variant="outline" size="sm">
                    {student.studentName}
                  </Badge>
                ))}
                {preview.selectedStudents.length > 10 && (
                  <Badge variant="secondary" size="sm">
                    +{preview.selectedStudents.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Report will be generated as a <strong>{exportFormat.toUpperCase()}</strong> file with{' '}
            <strong>{reportType}</strong> level of detail.
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {exportError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleGenerateReport}
          disabled={isExportLoading}
          className="flex-1"
        >
          {isExportLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Generate Report
        </Button>

        <Button
          onClick={handleExportReport}
          disabled={isExportLoading}
          variant="outline"
          className="flex-1"
        >
          {isExportLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export {exportFormat.toUpperCase()}
        </Button>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            Pre-configured report templates for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => {
                setReportType('summary')
                setExportFormat('pdf')
                setStatusFilter('all')
                setPriorityFilter('all')
                setCustomTitle('Weekly Progress Summary')
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Weekly Summary</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Quick overview of all students' progress for weekly reviews
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => {
                setReportType('detailed')
                setExportFormat('pdf')
                setStatusFilter('overdue')
                setPriorityFilter('high')
                setCustomTitle('At-Risk Students Report')
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">At-Risk Analysis</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Detailed report focusing on students who need attention
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => {
                setReportType('analytics')
                setExportFormat('csv')
                setStatusFilter('all')
                setPriorityFilter('all')
                setCustomTitle('Performance Analytics Export')
              }}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Data Export</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                CSV export for further analysis in spreadsheet applications
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

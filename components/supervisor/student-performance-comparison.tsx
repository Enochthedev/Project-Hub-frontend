'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { StudentProgressSummary } from '@/lib/api/supervisor'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Target,
  Award
} from 'lucide-react'

interface StudentPerformanceComparisonProps {
  students: StudentProgressSummary[]
}

export default function StudentPerformanceComparison({ students }: StudentPerformanceComparisonProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [comparisonMetric, setComparisonMetric] = useState<'completion' | 'progress' | 'risk'>('completion')
  const [viewType, setViewType] = useState<'bar' | 'radar' | 'line'>('bar')

  const handleStudentToggle = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const getSelectedStudentData = () => {
    return students.filter(student => selectedStudents.includes(student.studentId))
  }

  const getComparisonData = () => {
    const selectedData = getSelectedStudentData()
    
    switch (comparisonMetric) {
      case 'completion':
        return selectedData.map(student => ({
          name: student.studentName.split(' ')[0], // First name only for chart
          fullName: student.studentName,
          completionRate: student.completionRate,
          completed: student.completedMilestones,
          total: student.totalMilestones
        }))
      
      case 'progress':
        return selectedData.map(student => ({
          name: student.studentName.split(' ')[0],
          fullName: student.studentName,
          completed: student.completedMilestones,
          inProgress: student.inProgressMilestones,
          overdue: student.overdueMilestones,
          blocked: student.blockedMilestones
        }))
      
      case 'risk':
        return selectedData.map(student => ({
          name: student.studentName.split(' ')[0],
          fullName: student.studentName,
          riskScore: Math.round(student.riskScore * 100),
          overdue: student.overdueMilestones,
          blocked: student.blockedMilestones
        }))
      
      default:
        return []
    }
  }

  const getRadarData = () => {
    const selectedData = getSelectedStudentData()
    
    return selectedData.map(student => ({
      student: student.studentName.split(' ')[0],
      fullName: student.studentName,
      'Completion Rate': student.completionRate,
      'Progress Velocity': Math.min((student.completedMilestones / Math.max(student.totalMilestones, 1)) * 100, 100),
      'Risk Management': Math.max(100 - (student.riskScore * 100), 0),
      'Milestone Quality': Math.max(100 - (student.overdueMilestones * 10), 0),
      'Consistency': Math.max(100 - (student.blockedMilestones * 15), 0)
    }))
  }

  const getPerformanceInsights = () => {
    const selectedData = getSelectedStudentData()
    if (selectedData.length < 2) return []

    const insights = []
    
    // Find top performer
    const topPerformer = selectedData.reduce((prev, current) => 
      prev.completionRate > current.completionRate ? prev : current
    )
    
    // Find student needing most support
    const needsSupport = selectedData.reduce((prev, current) => 
      prev.riskScore > current.riskScore ? prev : current
    )
    
    // Average completion rate
    const avgCompletion = selectedData.reduce((sum, student) => sum + student.completionRate, 0) / selectedData.length
    
    insights.push({
      type: 'success' as const,
      title: 'Top Performer',
      description: `${topPerformer.studentName} leads with ${topPerformer.completionRate.toFixed(1)}% completion rate`,
      icon: Award
    })
    
    if (needsSupport.riskScore > 0.5) {
      insights.push({
        type: 'warning' as const,
        title: 'Needs Support',
        description: `${needsSupport.studentName} has a high risk score and may need additional guidance`,
        icon: AlertTriangle
      })
    }
    
    insights.push({
      type: 'info' as const,
      title: 'Group Average',
      description: `Average completion rate: ${avgCompletion.toFixed(1)}%`,
      icon: Target
    })
    
    return insights
  }

  const renderChart = () => {
    const data = getComparisonData()
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Select students to compare their performance
        </div>
      )
    }

    switch (viewType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [value, name]}
                labelFormatter={(label) => {
                  const item = data.find(d => d.name === label)
                  return item?.fullName || label
                }}
              />
              {comparisonMetric === 'completion' && (
                <Bar dataKey="completionRate" fill="#0088FE" name="Completion Rate %" />
              )}
              {comparisonMetric === 'progress' && (
                <>
                  <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                  <Bar dataKey="inProgress" fill="#FFBB28" name="In Progress" />
                  <Bar dataKey="overdue" fill="#FF8042" name="Overdue" />
                  <Bar dataKey="blocked" fill="#FF4444" name="Blocked" />
                </>
              )}
              {comparisonMetric === 'risk' && (
                <>
                  <Bar dataKey="riskScore" fill="#FF8042" name="Risk Score" />
                  <Bar dataKey="overdue" fill="#FF4444" name="Overdue" />
                  <Bar dataKey="blocked" fill="#CC0000" name="Blocked" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'radar':
        const radarData = getRadarData()
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              {radarData.map((entry, index) => (
                <Radar
                  key={entry.student}
                  name={entry.fullName}
                  dataKey={entry.student}
                  stroke={`hsl(${index * 137.5}, 70%, 50%)`}
                  fill={`hsl(${index * 137.5}, 70%, 50%)`}
                  fillOpacity={0.1}
                />
              ))}
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [value, name]}
                labelFormatter={(label) => {
                  const item = data.find(d => d.name === label)
                  return item?.fullName || label
                }}
              />
              {comparisonMetric === 'completion' && (
                <Line type="monotone" dataKey="completionRate" stroke="#0088FE" strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  const insights = getPerformanceInsights()

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Performance Comparison
          </CardTitle>
          <CardDescription>
            Compare performance metrics across multiple students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">Select Students to Compare</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {students.map((student) => (
                <div key={student.studentId} className="flex items-center space-x-2">
                  <Checkbox
                    id={student.studentId}
                    checked={selectedStudents.includes(student.studentId)}
                    onCheckedChange={() => handleStudentToggle(student.studentId)}
                  />
                  <label 
                    htmlFor={student.studentId} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
          </div>

          {/* Comparison Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Metric:</label>
              <Select value={comparisonMetric} onValueChange={(value: any) => setComparisonMetric(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completion">Completion Rate</SelectItem>
                  <SelectItem value="progress">Progress Status</SelectItem>
                  <SelectItem value="risk">Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">View:</label>
              <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="radar">Radar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Comparing {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            Visual comparison of selected students' performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>
              Key insights from the comparison analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon
                const bgColor = insight.type === 'success' ? 'bg-green-50 border-green-200' :
                               insight.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                               'bg-blue-50 border-blue-200'
                const textColor = insight.type === 'success' ? 'text-green-800' :
                                 insight.type === 'warning' ? 'text-orange-800' :
                                 'text-blue-800'
                const iconColor = insight.type === 'success' ? 'text-green-600' :
                                 insight.type === 'warning' ? 'text-orange-600' :
                                 'text-blue-600'

                return (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor}`}>
                    <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                    <div>
                      <p className={`font-medium ${textColor}`}>{insight.title}</p>
                      <p className={`text-sm ${textColor.replace('800', '700')}`}>
                        {insight.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison Table */}
      {selectedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
            <CardDescription>
              Side-by-side comparison of key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-center p-2">Completion Rate</th>
                    <th className="text-center p-2">Completed</th>
                    <th className="text-center p-2">In Progress</th>
                    <th className="text-center p-2">Overdue</th>
                    <th className="text-center p-2">Blocked</th>
                    <th className="text-center p-2">Risk Level</th>
                    <th className="text-center p-2">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {getSelectedStudentData().map((student) => (
                    <tr key={student.studentId} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{student.studentName}</td>
                      <td className="text-center p-2">
                        <Badge variant="outline">
                          {student.completionRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <span className="text-green-600 font-medium">
                          {student.completedMilestones}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <span className="text-blue-600 font-medium">
                          {student.inProgressMilestones}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <span className="text-orange-600 font-medium">
                          {student.overdueMilestones}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <span className="text-red-600 font-medium">
                          {student.blockedMilestones}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <Badge 
                          variant={student.riskScore > 0.7 ? 'destructive' : student.riskScore > 0.4 ? 'secondary' : 'default'}
                          size="sm"
                        >
                          {student.riskScore > 0.7 ? 'High' : student.riskScore > 0.4 ? 'Medium' : 'Low'}
                        </Badge>
                      </td>
                      <td className="text-center p-2 text-muted-foreground">
                        {student.lastActivity 
                          ? new Date(student.lastActivity).toLocaleDateString()
                          : 'No activity'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudentProgressSummary } from '@/lib/api/supervisor'
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Users, 
  Send,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface BulkStudentActionsProps {
  students: StudentProgressSummary[]
  selectedStudents: string[]
  onSelectionChange: (studentIds: string[]) => void
  onBulkEmail?: (studentIds: string[], subject: string, message: string) => Promise<void>
  onBulkMessage?: (studentIds: string[], message: string) => Promise<void>
  onScheduleBulkMeeting?: (studentIds: string[], meetingDetails: any) => Promise<void>
  onGenerateBulkReport?: (studentIds: string[]) => Promise<void>
}

export default function BulkStudentActions({
  students,
  selectedStudents,
  onSelectionChange,
  onBulkEmail,
  onBulkMessage,
  onScheduleBulkMeeting,
  onGenerateBulkReport
}: BulkStudentActionsProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const selectedStudentData = students.filter(student => 
    selectedStudents.includes(student.studentId)
  )

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(students.map(s => s.studentId))
    }
  }

  const handleStudentToggle = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      onSelectionChange(selectedStudents.filter(id => id !== studentId))
    } else {
      onSelectionChange([...selectedStudents, studentId])
    }
  }

  const handleBulkEmail = async () => {
    if (!onBulkEmail || !emailSubject.trim() || !emailMessage.trim()) return
    
    setIsLoading(true)
    try {
      await onBulkEmail(selectedStudents, emailSubject, emailMessage)
      setIsEmailDialogOpen(false)
      setEmailSubject('')
      setEmailMessage('')
    } catch (error) {
      console.error('Failed to send bulk email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkMessage = async () => {
    if (!onBulkMessage || !chatMessage.trim()) return
    
    setIsLoading(true)
    try {
      await onBulkMessage(selectedStudents, chatMessage)
      setIsMessageDialogOpen(false)
      setChatMessage('')
    } catch (error) {
      console.error('Failed to send bulk message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!onGenerateBulkReport) return
    
    setIsLoading(true)
    try {
      await onGenerateBulkReport(selectedStudents)
    } catch (error) {
      console.error('Failed to generate bulk report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEmailTemplate = (type: string) => {
    switch (type) {
      case 'reminder':
        return {
          subject: 'Milestone Progress Reminder',
          message: `Dear Students,

I hope this message finds you well. I wanted to check in on your progress with your current milestones.

Please review your upcoming deadlines and let me know if you need any support or have any questions.

Best regards,
[Your Name]`
        }
      case 'meeting':
        return {
          subject: 'Scheduled Check-in Meeting',
          message: `Dear Students,

I would like to schedule individual check-in meetings to discuss your project progress and address any challenges you may be facing.

Please reply with your availability for the coming week.

Best regards,
[Your Name]`
        }
      case 'support':
        return {
          subject: 'Academic Support Available',
          message: `Dear Students,

I wanted to reach out to offer additional support for your projects. If you're experiencing any difficulties or need guidance, please don't hesitate to contact me.

I'm here to help you succeed in your academic journey.

Best regards,
[Your Name]`
        }
      default:
        return { subject: '', message: '' }
    }
  }

  const applyEmailTemplate = (type: string) => {
    const template = getEmailTemplate(type)
    setEmailSubject(template.subject)
    setEmailMessage(template.message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Student Management
        </CardTitle>
        <CardDescription>
          Select students to perform bulk actions like sending emails, messages, or generating reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedStudents.length === students.length && students.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({students.length} students)
            </label>
          </div>
          {selectedStudents.length > 0 && (
            <Badge variant="secondary">
              {selectedStudents.length} selected
            </Badge>
          )}
        </div>

        {/* Student Selection List */}
        <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
          {students.map((student) => (
            <div key={student.studentId} className="flex items-center justify-between p-2 hover:bg-muted rounded">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedStudents.includes(student.studentId)}
                  onCheckedChange={() => handleStudentToggle(student.studentId)}
                />
                <div>
                  <p className="text-sm font-medium">{student.studentName}</p>
                  <p className="text-xs text-muted-foreground">{student.studentEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">
                  {student.completionRate.toFixed(0)}%
                </Badge>
                {student.overdueMilestones > 0 && (
                  <Badge variant="destructive" size="sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {student.overdueMilestones}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {/* Bulk Email */}
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email ({selectedStudents.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Bulk Email</DialogTitle>
                  <DialogDescription>
                    Send an email to {selectedStudents.length} selected students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyEmailTemplate('reminder')}
                    >
                      Reminder Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyEmailTemplate('meeting')}
                    >
                      Meeting Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyEmailTemplate('support')}
                    >
                      Support Template
                    </Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Email subject..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="mt-1 min-h-32"
                      placeholder="Email message..."
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recipients: {selectedStudentData.map(s => s.studentName).join(', ')}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkEmail} 
                    disabled={isLoading || !emailSubject.trim() || !emailMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send Email'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Bulk Message */}
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message ({selectedStudents.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Bulk Message</DialogTitle>
                  <DialogDescription>
                    Send a platform message to {selectedStudents.length} selected students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="mt-1 min-h-24"
                      placeholder="Type your message..."
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recipients: {selectedStudentData.map(s => s.studentName).join(', ')}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkMessage} 
                    disabled={isLoading || !chatMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Generate Report */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report ({selectedStudents.length})
            </Button>

            {/* Schedule Meeting */}
            <Button variant="outline" size="sm" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meetings ({selectedStudents.length})
            </Button>
          </div>
        )}

        {/* Selected Students Summary */}
        {selectedStudents.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Selected Students Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-medium">{selectedStudents.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">At Risk:</span>
                <span className="ml-2 font-medium text-destructive">
                  {selectedStudentData.filter(s => s.riskScore >= 0.7).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Overdue:</span>
                <span className="ml-2 font-medium text-orange-600">
                  {selectedStudentData.reduce((sum, s) => sum + s.overdueMilestones, 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Progress:</span>
                <span className="ml-2 font-medium">
                  {selectedStudentData.length > 0 
                    ? (selectedStudentData.reduce((sum, s) => sum + s.completionRate, 0) / selectedStudentData.length).toFixed(1)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
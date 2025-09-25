"use client"

import { useState, useEffect } from "react"
import { useAIAssistantStore } from "@/lib/stores/ai-assistant-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  MessageCircle, 
  TrendingUp, 
  Star, 
  Clock,
  Bookmark,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationAnalyticsProps {
  className?: string
}

interface AnalyticsData {
  totalConversations: number
  totalMessages: number
  averageRating: number
  responseTime: number
  bookmarkCount: number
  escalationRate: number
  satisfactionScore: number
  topTopics: Array<{ topic: string; count: number }>
  dailyActivity: Array<{ date: string; conversations: number; messages: number }>
  ratingDistribution: Array<{ rating: number; count: number }>
  confidenceScores: Array<{ range: string; count: number }>
}

const COLORS = ['#1B998B', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F39C12']

export function ConversationAnalytics({ className }: ConversationAnalyticsProps) {
  const { conversations, bookmarkedMessages } = useAIAssistantStore()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    calculateAnalytics()
  }, [conversations, bookmarkedMessages, timeRange])

  const calculateAnalytics = () => {
    if (!conversations.length) {
      setAnalyticsData(null)
      return
    }

    // Filter conversations by time range
    const now = new Date()
    const cutoffDate = new Date()
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
    }

    const filteredConversations = conversations.filter(conv => 
      new Date(conv.createdAt) >= cutoffDate
    )

    // Calculate metrics
    const totalMessages = filteredConversations.reduce((sum, conv) => sum + conv.messageCount, 0)
    
    const allMessages = filteredConversations.flatMap(conv => conv.messages || [])
    const ratedMessages = allMessages.filter(msg => msg.averageRating)
    const averageRating = ratedMessages.length > 0 
      ? ratedMessages.reduce((sum, msg) => sum + (msg.averageRating || 0), 0) / ratedMessages.length
      : 0

    const escalatedConversations = filteredConversations.filter(conv => conv.status === 'escalated')
    const escalationRate = filteredConversations.length > 0 
      ? (escalatedConversations.length / filteredConversations.length) * 100
      : 0

    // Mock data for demonstration
    const mockData: AnalyticsData = {
      totalConversations: filteredConversations.length,
      totalMessages,
      averageRating,
      responseTime: 2.3, // seconds
      bookmarkCount: bookmarkedMessages.length,
      escalationRate,
      satisfactionScore: 87,
      topTopics: [
        { topic: 'Project Planning', count: 45 },
        { topic: 'Technical Issues', count: 32 },
        { topic: 'Research Methods', count: 28 },
        { topic: 'Timeline Management', count: 21 },
        { topic: 'Resource Finding', count: 18 },
      ],
      dailyActivity: generateDailyActivity(timeRange),
      ratingDistribution: [
        { rating: 5, count: 42 },
        { rating: 4, count: 38 },
        { rating: 3, count: 15 },
        { rating: 2, count: 4 },
        { rating: 1, count: 1 },
      ],
      confidenceScores: [
        { range: '90-100%', count: 35 },
        { range: '80-89%', count: 28 },
        { range: '70-79%', count: 22 },
        { range: '60-69%', count: 12 },
        { range: '<60%', count: 3 },
      ],
    }

    setAnalyticsData(mockData)
  }

  const generateDailyActivity = (range: '7d' | '30d' | '90d') => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        conversations: Math.floor(Math.random() * 10) + 1,
        messages: Math.floor(Math.random() * 50) + 10,
      })
    }
    
    return data
  }

  if (!analyticsData) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <p className="text-[#656176] dark:text-[#DECDF5]">No data available</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
          Conversation Analytics
        </h2>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                timeRange === range && "bg-[#1B998B] text-white"
              )}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-[#1B998B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalConversations}</div>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
              {analyticsData.totalMessages} total messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3 w-3",
                    star <= analyticsData.averageRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.responseTime}s</div>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.satisfactionScore}%</div>
            <Progress value={analyticsData.satisfactionScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analyticsData.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  stackId="1"
                  stroke="#1B998B" 
                  fill="#1B998B" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stackId="1"
                  stroke="#2ECC71" 
                  fill="#2ECC71" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rating, count }) => `${rating}★ (${count})`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Discussion Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyticsData.topTopics} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="topic" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B998B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.confidenceScores.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#1B998B]" />
                    <span className="text-sm text-[#534D56] dark:text-[#F8F1FF]">
                      {item.range}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(item.count / Math.max(...analyticsData.confidenceScores.map(s => s.count))) * 100} 
                      className="w-20 h-2" 
                    />
                    <span className="text-sm text-[#656176] dark:text-[#DECDF5] w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarked Messages</CardTitle>
            <Bookmark className="h-4 w-4 text-[#1B998B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bookmarkCount}</div>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
              Helpful responses saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalation Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.escalationRate.toFixed(1)}%</div>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
              Conversations escalated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalMessages > 0 
                ? (analyticsData.totalMessages / analyticsData.totalConversations).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-xs text-[#656176] dark:text-[#DECDF5]">
              Messages per conversation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

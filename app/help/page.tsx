"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  Video,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Clock,
  Users,
  Star,
  Play,
} from "lucide-react"

interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  helpful: number
  notHelpful: number
  lastUpdated: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  views: number
  rating: number
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("articles")

  // Mock data
  const helpArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Getting Started with Project Hub",
      content: "Learn how to navigate the platform, create your profile, and start your first project...",
      category: "Getting Started",
      tags: ["basics", "setup", "profile"],
      helpful: 45,
      notHelpful: 3,
      lastUpdated: "2024-01-15",
    },
    {
      id: "2",
      title: "How to Submit a Project Proposal",
      content: "Step-by-step guide on creating and submitting your project proposal for approval...",
      category: "Projects",
      tags: ["project", "proposal", "submission"],
      helpful: 38,
      notHelpful: 2,
      lastUpdated: "2024-01-18",
    },
    {
      id: "3",
      title: "Using the AI Assistant Effectively",
      content: "Tips and tricks for getting the most out of your AI assistant conversations...",
      category: "AI Assistant",
      tags: ["ai", "chat", "tips"],
      helpful: 52,
      notHelpful: 1,
      lastUpdated: "2024-01-20",
    },
    {
      id: "4",
      title: "Managing Project Milestones",
      content: "Learn how to create, track, and complete project milestones effectively...",
      category: "Milestones",
      tags: ["milestones", "tracking", "progress"],
      helpful: 29,
      notHelpful: 4,
      lastUpdated: "2024-01-12",
    },
  ]

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I reset my password?",
      answer:
        'You can reset your password by clicking the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your email.',
      category: "Account",
      helpful: 67,
      notHelpful: 2,
    },
    {
      id: "2",
      question: "Can I change my project supervisor?",
      answer:
        "Yes, you can request a supervisor change by contacting the admin team through the support system. Please provide a valid reason for the change request.",
      category: "Projects",
      helpful: 34,
      notHelpful: 8,
    },
    {
      id: "3",
      question: "How long does project approval take?",
      answer:
        "Project approval typically takes 3-5 business days. You will receive a notification once your project has been reviewed and approved or if any changes are needed.",
      category: "Projects",
      helpful: 89,
      notHelpful: 3,
    },
    {
      id: "4",
      question: "Is my data secure on the platform?",
      answer:
        "Yes, we take data security seriously. All data is encrypted in transit and at rest. We follow industry best practices for data protection and privacy.",
      category: "Security",
      helpful: 45,
      notHelpful: 1,
    },
    {
      id: "5",
      question: "Can I collaborate with other students?",
      answer:
        "Yes, the platform supports collaboration features. You can share projects, work on group assignments, and communicate with peers through the messaging system.",
      category: "Collaboration",
      helpful: 56,
      notHelpful: 4,
    },
  ]

  const videoTutorials: VideoTutorial[] = [
    {
      id: "1",
      title: "Platform Overview and Navigation",
      description: "A comprehensive tour of the Project Hub platform and its main features.",
      duration: "8:45",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Getting Started",
      views: 1234,
      rating: 4.8,
    },
    {
      id: "2",
      title: "Creating Your First Project",
      description: "Step-by-step walkthrough of creating and submitting your first project proposal.",
      duration: "12:30",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Projects",
      views: 987,
      rating: 4.6,
    },
    {
      id: "3",
      title: "Mastering the AI Assistant",
      description: "Learn advanced techniques for getting better responses from the AI assistant.",
      duration: "15:20",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "AI Assistant",
      views: 756,
      rating: 4.9,
    },
    {
      id: "4",
      title: "Milestone Management Best Practices",
      description: "Tips for effectively planning and tracking your project milestones.",
      duration: "10:15",
      thumbnail: "/placeholder.svg?height=120&width=200",
      category: "Milestones",
      views: 543,
      rating: 4.7,
    },
  ]

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredVideos = videoTutorials.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF] flex items-center justify-center gap-3">
          <HelpCircle className="h-8 w-8" />
          Help & Support
        </h1>
        <p className="text-[#656176] dark:text-[#DECDF5] max-w-2xl mx-auto">
          Find answers to your questions, learn how to use the platform, and get support when you need it.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for help articles, FAQs, or tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Articles ({filteredArticles.length})
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQs ({filteredFAQs.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({filteredVideos.length})
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* Help Articles */}
        <TabsContent value="articles" className="space-y-4">
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.content}</CardDescription>
                    </div>
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-[#656176] dark:text-[#DECDF5]">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {new Date(article.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span>{article.helpful}</span>
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                        <span>{article.notHelpful}</span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        Read More
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs" className="space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <AccordionItem value={faq.id} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-left font-medium">{faq.question}</span>
                      <Badge variant="secondary" className="ml-4">
                        {faq.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-[#656176] dark:text-[#DECDF5]">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#656176] dark:text-[#DECDF5]">Was this helpful?</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                              <ThumbsUp className="h-3 w-3" />
                              Yes ({faq.helpful})
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                              <ThumbsDown className="h-3 w-3" />
                              No ({faq.notHelpful})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </TabsContent>

        {/* Video Tutorials */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg">
                      <Button size="lg" className="rounded-full bg-white/90 text-black hover:bg-white">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-[#534D56] dark:text-[#F8F1FF] line-clamp-2">{video.title}</h3>
                      <Badge variant="secondary">{video.category}</Badge>
                    </div>
                    <p className="text-sm text-[#656176] dark:text-[#DECDF5] line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-sm text-[#656176] dark:text-[#DECDF5]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {video.views.toLocaleString()} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {video.rating}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Watch Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Support */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Live Chat
                </CardTitle>
                <CardDescription>Get instant help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">Available now</span>
                </div>
                <p className="text-sm text-[#656176] dark:text-[#DECDF5]">Average response time: 2 minutes</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Chat</Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Email Support
                </CardTitle>
                <CardDescription>Send us a detailed message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-[#656176] dark:text-[#DECDF5]">
                  <p>support@projecthub.ui.edu.ng</p>
                  <p>Response time: 24 hours</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Phone Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-600" />
                  Phone Support
                </CardTitle>
                <CardDescription>Speak directly with our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-[#656176] dark:text-[#DECDF5]">
                  <p>+234 (0) 2 810 1055</p>
                  <p>Mon-Fri: 8:00 AM - 6:00 PM</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Contact Form Component
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "general",
        message: "",
      })

      // Show success message (you can use toast here)
      alert("Message sent successfully! We'll get back to you soon.")
    } catch (error) {
      alert("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select
          className="w-full p-2 border rounded-md"
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
        >
          <option value="general">General Inquiry</option>
          <option value="technical">Technical Support</option>
          <option value="account">Account Issues</option>
          <option value="project">Project Help</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <textarea
          className="w-full p-2 border rounded-md min-h-[120px]"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder="Please describe your issue or question in detail..."
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}

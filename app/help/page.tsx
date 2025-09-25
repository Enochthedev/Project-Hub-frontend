"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  FileText,
  Play,
  Send,
  Clock,
  Star,
  ThumbsUp,
  ExternalLink,
  Download,
} from "lucide-react"

interface Article {
  id: string
  title: string
  description: string
  category: string
  readTime: number
  rating: number
  isPopular: boolean
  content: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

interface VideoType {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  views: number
}

const mockArticles: Article[] = [
  {
    id: "1",
    title: "Getting Started with Project Hub",
    description: "A comprehensive guide to setting up your account and creating your first project.",
    category: "Getting Started",
    readTime: 5,
    rating: 4.8,
    isPopular: true,
    content: "This article covers the basics of getting started with Project Hub...",
  },
  {
    id: "2",
    title: "Managing Project Milestones",
    description: "Learn how to create, track, and manage project milestones effectively.",
    category: "Project Management",
    readTime: 8,
    rating: 4.6,
    isPopular: true,
    content: "Project milestones are crucial for tracking progress...",
  },
  {
    id: "3",
    title: "Collaborating with Supervisors",
    description: "Best practices for effective communication and collaboration with your project supervisor.",
    category: "Collaboration",
    readTime: 6,
    rating: 4.7,
    isPopular: false,
    content: "Effective collaboration with supervisors is key to project success...",
  },
]

const mockFAQs: FAQ[] = [
  {
    id: "1",
    question: "How do I create a new project?",
    answer:
      'To create a new project, navigate to the Projects section and click the "New Project" button. Fill in the required information including title, description, and select your supervisor.',
    category: "Projects",
    helpful: 45,
  },
  {
    id: "2",
    question: "Can I change my supervisor after project approval?",
    answer:
      "Yes, you can request a supervisor change through the project settings. However, this requires approval from both the current and new supervisor, as well as admin approval.",
    category: "Supervision",
    helpful: 32,
  },
  {
    id: "3",
    question: "How do I submit my final project?",
    answer:
      'Final project submission is done through the project dashboard. Upload all required files, complete the submission checklist, and click "Submit for Review".',
    category: "Submission",
    helpful: 67,
  },
  {
    id: "4",
    question: "What file formats are supported for uploads?",
    answer:
      "We support most common file formats including PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, and various image formats (JPG, PNG, GIF).",
    category: "Technical",
    helpful: 28,
  },
]

const mockVideos: VideoType[] = [
  {
    id: "1",
    title: "Project Hub Overview",
    description: "A complete walkthrough of the Project Hub platform and its features.",
    duration: "12:34",
    thumbnail: "/placeholder.jpg",
    category: "Overview",
    views: 1250,
  },
  {
    id: "2",
    title: "Creating Your First Project",
    description: "Step-by-step tutorial on creating and setting up your first project.",
    duration: "8:45",
    thumbnail: "/placeholder.jpg",
    category: "Getting Started",
    views: 890,
  },
  {
    id: "3",
    title: "Advanced Milestone Management",
    description: "Learn advanced techniques for managing complex project milestones.",
    duration: "15:20",
    thumbnail: "/placeholder.jpg",
    category: "Advanced",
    views: 567,
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

  const categories = ["Getting Started", "Project Management", "Collaboration", "Technical", "Advanced"]

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredFAQs = mockFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredVideos = mockVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields")
      return
    }

    // Simulate form submission
    toast.success("Your message has been sent! We'll get back to you within 24 hours.")
    setContactForm({ name: "", email: "", subject: "", category: "", message: "" })
    setIsContactDialogOpen(false)
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Help & Support</h1>
          <p className="text-[#656176] dark:text-[#DECDF5] mt-2">
            Find answers to your questions and get the help you need
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for help articles, FAQs, or tutorials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Support</DialogTitle>
                <DialogDescription>Send us a message and we'll get back to you as soon as possible.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={contactForm.category}
                    onValueChange={(value) => setContactForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account Problem</SelectItem>
                      <SelectItem value="project">Project Help</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue or question in detail..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleContactSubmit} className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call Support
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Us
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">
            <BookOpen className="h-4 w-4 mr-2" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.isPopular && (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{article.rating}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span>{faq.question}</span>
                        <Badge variant="outline" className="ml-2">
                          {faq.category}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <p className="text-muted-foreground mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{faq.helpful} people found this helpful</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg">
                      <Button size="lg" className="rounded-full bg-white/90 hover:bg-white text-black">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant="secondary">{video.category}</Badge>
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{video.views.toLocaleString()} views</span>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Methods */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF]">Get in Touch</h3>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-[#1B998B]" />
                    Live Chat
                  </CardTitle>
                  <CardDescription>Chat with our support team in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        <span>Online now</span>
                      </div>
                      <p className="text-muted-foreground">Average response: 2 minutes</p>
                    </div>
                    <Button className="bg-[#1B998B] hover:bg-[#1B998B]/90">Start Chat</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email Support
                  </CardTitle>
                  <CardDescription>Send us an email and we'll respond within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">support@projecthub.edu</p>
                    <p className="text-sm text-muted-foreground">For general inquiries and technical support</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    Phone Support
                  </CardTitle>
                  <CardDescription>Call us for urgent issues and immediate assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Hours & Resources */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#534D56] dark:text-[#F8F1FF]">Support Hours</h3>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Currently Open</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download User Manual
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Community Forum
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Video className="h-4 w-4 mr-2" />
                    Video Tutorials
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Knowledge Base
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>For critical system issues outside business hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">Emergency Hotline</p>
                    <p className="text-sm">+1 (555) 999-0000</p>
                    <p className="text-xs text-muted-foreground">Available 24/7 for critical system outages only</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

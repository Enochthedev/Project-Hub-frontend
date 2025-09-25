"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface HelpArticle {
  id: string
  title: string
  description: string
  category: string
  views: number
  helpful: number
  lastUpdated: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const helpArticles: HelpArticle[] = [
    {
      id: "1",
      title: "Getting Started with Project Hub",
      description: "Learn the basics of navigating and using Project Hub effectively",
      category: "Getting Started",
      views: 1250,
      helpful: 98,
      lastUpdated: "2024-01-10",
    },
    {
      id: "2",
      title: "How to Find and Apply for Projects",
      description: "Step-by-step guide to discovering and applying for projects that match your interests",
      category: "Projects",
      views: 890,
      helpful: 87,
      lastUpdated: "2024-01-08",
    },
    {
      id: "3",
      title: "Using the AI Assistant Effectively",
      description: "Tips and tricks for getting the most out of your AI assistant conversations",
      category: "AI Assistant",
      views: 756,
      helpful: 92,
      lastUpdated: "2024-01-12",
    },
    {
      id: "4",
      title: "Managing Your Project Milestones",
      description: "Best practices for tracking progress and meeting deadlines",
      category: "Milestones",
      views: 634,
      helpful: 85,
      lastUpdated: "2024-01-05",
    },
  ]

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I reset my password?",
      answer:
        "You can reset your password by clicking the 'Forgot Password' link on the login page. Enter your email address and follow the instructions sent to your inbox.",
      category: "Account",
      helpful: 45,
    },
    {
      id: "2",
      question: "Can I work on multiple projects at once?",
      answer:
        "Yes, you can participate in multiple projects simultaneously. However, make sure you can manage your time effectively and meet all project requirements.",
      category: "Projects",
      helpful: 38,
    },
    {
      id: "3",
      question: "How does the AI assistant work?",
      answer:
        "The AI assistant uses advanced language models to help answer your questions about projects, provide guidance, and assist with academic tasks. It learns from your interactions to provide more personalized help.",
      category: "AI Assistant",
      helpful: 52,
    },
    {
      id: "4",
      question: "What should I do if I'm falling behind on milestones?",
      answer:
        "If you're struggling with milestones, reach out to your supervisor immediately. You can also use the AI assistant for guidance and consider adjusting your project timeline if necessary.",
      category: "Milestones",
      helpful: 41,
    },
    {
      id: "5",
      question: "How do I contact my supervisor?",
      answer:
        "You can contact your supervisor through the messaging system in Project Hub, or use the contact information provided in your project details.",
      category: "Communication",
      helpful: 33,
    },
  ]

  const videoTutorials = [
    {
      id: "1",
      title: "Project Hub Overview",
      duration: "5:30",
      thumbnail: "/placeholder.svg?height=120&width=200",
      views: 2340,
    },
    {
      id: "2",
      title: "Finding Your Perfect Project",
      duration: "8:15",
      thumbnail: "/placeholder.svg?height=120&width=200",
      views: 1890,
    },
    {
      id: "3",
      title: "AI Assistant Best Practices",
      duration: "6:45",
      thumbnail: "/placeholder.svg?height=120&width=200",
      views: 1567,
    },
    {
      id: "4",
      title: "Milestone Management Tips",
      duration: "7:20",
      thumbnail: "/placeholder.svg?height=120&width=200",
      views: 1234,
    },
  ]

  const categories = ["all", "Getting Started", "Projects", "AI Assistant", "Milestones", "Account", "Communication"]

  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8" />
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-2">Find answers to your questions and get the help you need</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for help articles, FAQs, or tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">Get instant help from our support team</p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Send us a detailed message about your issue</p>
              <Button variant="outline" className="w-full bg-transparent">
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Call us during business hours</p>
              <Button variant="outline" className="w-full bg-transparent">
                Call Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>

          {/* Help Articles */}
          <TabsContent value="articles" className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8">
                <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No articles found</h3>
                <p className="text-muted-foreground">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary">{article.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {article.helpful}%
                        </div>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{article.views} views</span>
                        <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FAQs */}
          <TabsContent value="faqs" className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No FAQs found</h3>
                <p className="text-muted-foreground">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="px-6 py-4 text-left">
                          <div className="flex items-center justify-between w-full mr-4">
                            <span>{faq.question}</span>
                            <Badge variant="outline">{faq.category}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-muted-foreground mb-4">{faq.answer}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Was this helpful?</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost">
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="text-sm text-muted-foreground ml-auto">
                              {faq.helpful} people found this helpful
                            </span>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Video Tutorials */}
          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoTutorials.map((video) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-t-lg">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-75">{video.duration}</Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{video.views} views</span>
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Get in touch with our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@projecthub.edu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                  <CardDescription>When our team is available to help</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Live chat and email support are available 24/7. Phone support follows the hours above.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Users, Calendar, ArrowRight, Search, ThumbsUp, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const discussionTopics = [
  {
    id: 1,
    title: "Best practices for React project structure?",
    author: {
      name: "Alex Chen",
      avatar: "/diverse-group.png",
    },
    category: "Web Development",
    replies: 24,
    views: 342,
    likes: 56,
    isHot: true,
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    title: "How to implement authentication in a Next.js app?",
    author: {
      name: "Sarah Johnson",
      avatar: "/diverse-group.png",
    },
    category: "Web Development",
    replies: 18,
    views: 256,
    likes: 42,
    isHot: false,
    lastActivity: "5 hours ago",
  },
  {
    id: 3,
    title: "Recommendations for machine learning project ideas for beginners?",
    author: {
      name: "Michael Brown",
      avatar: "/diverse-group.png",
    },
    category: "AI & ML",
    replies: 31,
    views: 420,
    likes: 78,
    isHot: true,
    lastActivity: "1 day ago",
  },
  {
    id: 4,
    title: "Flutter vs React Native for student projects?",
    author: {
      name: "Jessica Lee",
      avatar: "/diverse-group.png",
    },
    category: "Mobile Development",
    replies: 42,
    views: 512,
    likes: 63,
    isHot: true,
    lastActivity: "3 hours ago",
  },
  {
    id: 5,
    title: "How to approach database design for a student project?",
    author: {
      name: "David Wilson",
      avatar: "/diverse-group.png",
    },
    category: "Databases",
    replies: 15,
    views: 198,
    likes: 27,
    isHot: false,
    lastActivity: "1 day ago",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Web Development Workshop",
    description: "Learn modern web development techniques with our expert instructors.",
    date: "May 25, 2025",
    time: "2:00 PM - 4:00 PM EST",
    location: "Online",
    image: "/coding-workshop.png",
  },
  {
    id: 2,
    title: "Project Showcase",
    description: "Students present their latest projects and receive feedback from peers and mentors.",
    date: "June 10, 2025",
    time: "1:00 PM - 5:00 PM EST",
    location: "Online",
    image: "/placeholder-9tb75.png",
  },
  {
    id: 3,
    title: "AI in Education Hackathon",
    description: "Build AI-powered tools to improve the educational experience.",
    date: "June 15-17, 2025",
    time: "All day",
    location: "Online",
    image: "/placeholder.svg?height=120&width=240&query=hackathon",
  },
]

export default function CommunityPage() {
  return (
    <main className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-4xl">Community</h1>
        <p className="mt-2 text-[#656176] dark:text-[#DECDF5] max-w-3xl">
          Connect with other students, share ideas, get help with your projects, and participate in events.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="discussions" className="w-full">
            <TabsList className="bg-[#F8F1FF] dark:bg-[#656176]/50 border border-[#DECDF5] dark:border-[#656176] p-1 w-full">
              <TabsTrigger
                value="discussions"
                className="flex-1 data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex-1 data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex-1 data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
              >
                <Users className="mr-2 h-4 w-4" />
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Recent Discussions</h2>
                <Button className="bg-[#1B998B] hover:bg-[#1B998B]/90">New Topic</Button>
              </div>

              <div className="space-y-4">
                {discussionTopics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 transition-all hover:shadow-md"
                  >
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <Image
                            src={topic.author.avatar || "/placeholder.svg"}
                            alt={topic.author.name}
                            width={40}
                            height={40}
                            className="rounded-full mr-3"
                          />
                          <div>
                            <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">
                              <Link
                                href={`/resources/community/discussions/${topic.id}`}
                                className="hover:text-[#1B998B]"
                              >
                                {topic.title}
                              </Link>
                            </CardTitle>
                            <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                              Posted by {topic.author.name} • {topic.lastActivity}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {topic.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-[#656176] dark:text-[#DECDF5]">
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          <span>{topic.replies} replies</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          <span>{topic.views} views</span>
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          <span>{topic.likes} likes</span>
                        </div>
                      </div>
                      {topic.isHot && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                        >
                          Hot
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
                >
                  View All Discussions
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Upcoming Events</h2>
                <Button className="bg-[#1B998B] hover:bg-[#1B998B]/90">All Events</Button>
              </div>

              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 p-4">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          width={240}
                          height={120}
                          className="rounded-lg w-full h-auto object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-4">
                        <CardTitle className="text-xl text-[#534D56] dark:text-[#F8F1FF]">{event.title}</CardTitle>
                        <CardDescription className="mt-2 text-[#656176] dark:text-[#DECDF5]">
                          {event.description}
                        </CardDescription>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#656176] dark:text-[#DECDF5]">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-[#1B998B]" />
                            {event.date}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {event.time}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {event.location}
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button asChild className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                            <Link href={`/resources/community/events/${event.id}`}>
                              Register
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Community Members</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#656176] dark:text-[#DECDF5]" />
                  <Input
                    placeholder="Search members..."
                    className="pl-9 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card
                    key={i}
                    className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 transition-all hover:shadow-md"
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <Image
                        src={`/placeholder.svg?height=80&width=80&query=person ${i + 1}`}
                        alt={`Member ${i + 1}`}
                        width={80}
                        height={80}
                        className="rounded-full mb-4"
                      />
                      <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">
                        {
                          [
                            "Alex Chen",
                            "Sarah Johnson",
                            "Michael Brown",
                            "Jessica Lee",
                            "David Wilson",
                            "Emily Rodriguez",
                          ][i]
                        }
                      </h3>
                      <p className="text-sm text-[#656176] dark:text-[#DECDF5] mt-1">
                        {
                          [
                            "Web Developer",
                            "UX Designer",
                            "Data Scientist",
                            "Mobile Developer",
                            "DevOps Engineer",
                            "AI Researcher",
                          ][i]
                        }
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {["React", "Figma", "Python", "Flutter", "AWS", "TensorFlow"][i]}
                        </Badge>
                        <Badge className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                          {["Next.js", "UI/UX", "ML", "Mobile", "DevOps", "NLP"][i]}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 w-full border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
                >
                  View All Members
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30">
            <CardHeader>
              <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Join Our Community</CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                Connect with other students and share your project journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90">Sign Up Now</Button>
            </CardContent>
          </Card>

          <Card className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30">
            <CardHeader>
              <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Web Development", "Mobile Development", "AI & ML", "Databases", "UI/UX Design", "DevOps"].map(
                  (category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-[#F8F1FF] dark:hover:bg-[#656176]/50 transition-colors"
                    >
                      <span className="text-[#534D56] dark:text-[#F8F1FF]">{category}</span>
                      <Badge className="bg-[#DECDF5]/50 text-[#534D56] dark:bg-[#656176] dark:text-[#DECDF5]">
                        {Math.floor(Math.random() * 100) + 10}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30">
            <CardHeader>
              <CardTitle className="text-lg text-[#534D56] dark:text-[#F8F1FF]">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                Our community is built on respect, collaboration, and learning. Please review our guidelines to ensure a
                positive experience for everyone.
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
              >
                Read Guidelines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

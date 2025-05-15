import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Book, Code, Server, Database, Layers } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    icon: <FileText className="h-5 w-5" />,
    name: "Getting Started",
    description: "Learn the basics of Project Hub and how to get started with your first project.",
    links: [
      { title: "Introduction to Project Hub", href: "/resources/docs/introduction" },
      { title: "Creating Your First Project", href: "/resources/docs/first-project" },
      { title: "Project Templates", href: "/resources/docs/templates" },
      { title: "Saving and Organizing Projects", href: "/resources/docs/organizing" },
    ],
  },
  {
    icon: <Book className="h-5 w-5" />,
    name: "Guides",
    description: "Step-by-step guides for common tasks and project types.",
    links: [
      { title: "Web Development Projects", href: "/resources/docs/guides/web" },
      { title: "Mobile App Projects", href: "/resources/docs/guides/mobile" },
      { title: "AI and Machine Learning", href: "/resources/docs/guides/ai" },
      { title: "IoT Project Planning", href: "/resources/docs/guides/iot" },
    ],
  },
  {
    icon: <Code className="h-5 w-5" />,
    name: "API Reference",
    description: "Detailed documentation for the Project Hub API.",
    links: [
      { title: "Authentication", href: "/resources/docs/api/auth" },
      { title: "Projects API", href: "/resources/docs/api/projects" },
      { title: "Users API", href: "/resources/docs/api/users" },
      { title: "Webhooks", href: "/resources/docs/api/webhooks" },
    ],
  },
  {
    icon: <Server className="h-5 w-5" />,
    name: "Deployment",
    description: "Learn how to deploy your projects to various platforms.",
    links: [
      { title: "Deploying to Vercel", href: "/resources/docs/deployment/vercel" },
      { title: "Deploying to Netlify", href: "/resources/docs/deployment/netlify" },
      { title: "Deploying to AWS", href: "/resources/docs/deployment/aws" },
      { title: "Continuous Integration", href: "/resources/docs/deployment/ci" },
    ],
  },
  {
    icon: <Database className="h-5 w-5" />,
    name: "Databases",
    description: "Guides for integrating databases with your projects.",
    links: [
      { title: "SQL Databases", href: "/resources/docs/databases/sql" },
      { title: "NoSQL Databases", href: "/resources/docs/databases/nosql" },
      { title: "Database Design", href: "/resources/docs/databases/design" },
      { title: "Data Modeling", href: "/resources/docs/databases/modeling" },
    ],
  },
  {
    icon: <Layers className="h-5 w-5" />,
    name: "Advanced Topics",
    description: "Dive deeper into advanced project development concepts.",
    links: [
      { title: "Scalability", href: "/resources/docs/advanced/scalability" },
      { title: "Security Best Practices", href: "/resources/docs/advanced/security" },
      { title: "Performance Optimization", href: "/resources/docs/advanced/performance" },
      { title: "Testing Strategies", href: "/resources/docs/advanced/testing" },
    ],
  },
]

export default function DocumentationPage() {
  return (
    <main className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#534D56] dark:text-[#F8F1FF] sm:text-4xl">
          Documentation
        </h1>
        <p className="mt-2 text-[#656176] dark:text-[#DECDF5] max-w-3xl">
          Comprehensive guides and reference documentation to help you make the most of Project Hub and build successful
          projects.
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#656176] dark:text-[#DECDF5]" />
        <Input
          placeholder="Search documentation..."
          className="pl-10 border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF] h-12"
        />
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="bg-[#F8F1FF] dark:bg-[#656176]/50 border border-[#DECDF5] dark:border-[#656176] p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="guides"
            className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
          >
            Guides
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
          >
            API
          </TabsTrigger>
          <TabsTrigger
            value="examples"
            className="data-[state=active]:bg-[#1B998B] data-[state=active]:text-white rounded-md"
          >
            Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 transition-all hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-[#1B998B]/10 p-2 text-[#1B998B]">{category.icon}</div>
                    <CardTitle className="text-xl text-[#534D56] dark:text-[#F8F1FF]">{category.name}</CardTitle>
                  </div>
                  <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.links.map((link) => (
                      <li key={link.title}>
                        <Link
                          href={link.href}
                          className="text-[#1B998B] hover:underline hover:text-[#1B998B]/80 flex items-center"
                        >
                          <span className="mr-2">•</span>
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          <div className="rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 p-6">
            <h2 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">Popular Guides</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {categories
                .find((c) => c.name === "Guides")
                ?.links.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="flex items-start p-4 rounded-lg border border-[#DECDF5] dark:border-[#656176] hover:bg-[#F8F1FF] dark:hover:bg-[#656176]/50 transition-colors"
                  >
                    <FileText className="h-5 w-5 mr-3 text-[#1B998B] mt-0.5" />
                    <div>
                      <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{link.title}</h3>
                      <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                        Learn how to create and manage {link.title.toLowerCase()} effectively.
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <div className="rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 p-6">
            <h2 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">API Reference</h2>
            <p className="text-[#656176] dark:text-[#DECDF5] mb-6">
              Complete API documentation for integrating with Project Hub services.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {categories
                .find((c) => c.name === "API Reference")
                ?.links.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="flex items-start p-4 rounded-lg border border-[#DECDF5] dark:border-[#656176] hover:bg-[#F8F1FF] dark:hover:bg-[#656176]/50 transition-colors"
                  >
                    <Code className="h-5 w-5 mr-3 text-[#1B998B] mt-0.5" />
                    <div>
                      <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF]">{link.title}</h3>
                      <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
                        API documentation for {link.title.toLowerCase()} endpoints.
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <div className="rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-white dark:bg-[#656176]/30 p-6">
            <h2 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">Code Examples</h2>
            <p className="text-[#656176] dark:text-[#DECDF5] mb-6">
              Ready-to-use code examples for common project scenarios.
            </p>
            <div className="grid gap-4">
              <div className="rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-[#F8F1FF] dark:bg-[#656176]/50 p-4">
                <h3 className="font-medium text-[#534D56] dark:text-[#F8F1FF] mb-2">Basic Project Setup</h3>
                <pre className="bg-white dark:bg-[#534D56] p-3 rounded overflow-x-auto text-sm text-[#534D56] dark:text-[#F8F1FF]">
                  <code>{`// Example project setup code
import { createProject } from '@project-hub/sdk';

const newProject = await createProject({
  name: 'My Awesome Project',
  description: 'A project to demonstrate Project Hub capabilities',
  category: 'Web',
  tags: ['javascript', 'react', 'nextjs']
});

console.log('Project created:', newProject.id);`}</code>
                </pre>
                <Button className="mt-3 bg-[#1B998B] hover:bg-[#1B998B]/90">Copy Code</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 rounded-lg border border-[#DECDF5] dark:border-[#656176] bg-[#F8F1FF] dark:bg-[#656176]/30 p-6 text-center">
        <h2 className="text-2xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Need more help?</h2>
        <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
          Can't find what you're looking for? Join our community or contact support.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-[#1B998B] hover:bg-[#1B998B]/90">
            <Link href="/resources/community">Join Community</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent text-[#534D56] dark:text-[#F8F1FF]"
          >
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

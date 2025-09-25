"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  BookmarkPlus,
  Bot,
  Target,
  Lightbulb,
  Users,
  BarChart3,
  Shield,
  Home,
  FolderOpen,
  MessageSquare,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  // Role-based navigation items
  const getNavigationItems = () => {
    if (!user) return []

    const baseItems = [{ label: "Home", href: "/", icon: Home }]

    switch (user.role) {
      case "student":
        return [
          ...baseItems,
          { label: "Discover", href: "/projects", icon: Search },
          { label: "Bookmarks", href: "/bookmarks", icon: BookmarkPlus },
          { label: "AI Assistant", href: "/ai-assistant", icon: Bot },
          { label: "Milestones", href: "/milestones", icon: Target },
          { label: "Recommendations", href: "/recommendations", icon: Lightbulb },
        ]
      case "supervisor":
        return [
          ...baseItems,
          { label: "Dashboard", href: "/supervisor", icon: BarChart3 },
          { label: "My Projects", href: "/supervisor/projects", icon: FolderOpen },
          { label: "Students", href: "/supervisor/students", icon: Users },
          { label: "AI Monitoring", href: "/supervisor/ai-monitoring", icon: MessageSquare },
          { label: "Analytics", href: "/supervisor/analytics", icon: BarChart3 },
        ]
      case "admin":
        return [
          ...baseItems,
          { label: "Dashboard", href: "/admin", icon: BarChart3 },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Projects", href: "/admin/projects", icon: FolderOpen },
          { label: "AI Management", href: "/admin/ai", icon: Bot },
          { label: "System", href: "/admin/system", icon: Shield },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">ProjectHub</span>
                <span className="text-xs text-muted-foreground hidden sm:block">FYP Management Platform</span>
              </div>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-90">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">ProjectHub</span>
                <span className="text-xs text-muted-foreground hidden sm:block">FYP Management Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2 h-9 px-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side - Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects, users..."
                  className="pl-10 pr-4 w-64 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Milestone Due Soon</p>
                    <p className="text-xs text-muted-foreground">Project proposal due in 2 days</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">New Recommendation</p>
                    <p className="text-xs text-muted-foreground">AI found 3 new projects for you</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Message from Supervisor</p>
                    <p className="text-xs text-muted-foreground">Dr. Smith commented on your progress</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-teal-600 text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-teal-600 text-white">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                      return (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start space-x-3 h-12"
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </nav>

                  <div className="pt-4 border-t space-y-2">
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start space-x-3">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start space-x-3">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed top-0 left-0 right-0 p-4 bg-background border-b">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects, users..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="button" variant="ghost" onClick={() => setIsSearchOpen(false)}>
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

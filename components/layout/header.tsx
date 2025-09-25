"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { ChevronDown, Github, User, LogOut, Settings, BookMarked } from "lucide-react"
import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { ResponsiveContainer } from "@/components/ui/responsive-container"
import { TouchButton } from "@/components/ui/touch-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

const mainNavItems = [
  { name: "Home", href: "/" },
  {
    name: "Projects",
    href: "/explore",
    children: [
      { name: "Explore All", href: "/explore" },
      { name: "Trending", href: "/explore?filter=trending" },
      { name: "New Additions", href: "/explore?filter=new" },
    ],
  },
  {
    name: "Resources",
    href: "#",
    children: [
      { name: "Tutorials", href: "/resources/tutorials" },
      { name: "Documentation", href: "/resources/docs" },
      { name: "Community", href: "/resources/community" },
    ],
  },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, isTablet, isMobileSmall } = useMobile()
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const name = user.studentProfile?.name || user.supervisorProfile?.name || user.email
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUserName = () => {
    if (!user) return 'User'
    return user.studentProfile?.name || user.supervisorProfile?.name || user.email
  }

  // Add scroll effect with cleanup
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    // Only add the event listener on the client
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll)
      // Initial check
      handleScroll()

      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "border-b border-[#DECDF5] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-[#656176] dark:bg-[#534D56]/95 dark:supports-[backdrop-filter]:bg-[#534D56]/80"
          : "bg-white dark:bg-[#534D56]",
      )}
    >
      <ResponsiveContainer className="flex h-16 items-center justify-between" padding="md">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90 touch-sm:gap-1">
            <div className={cn(
              "relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1B998B] to-[#1B998B]/80 shadow-sm",
              isMobileSmall ? "h-7 w-7" : "h-8 w-8"
            )}>
              <div className="absolute inset-0 opacity-80 mix-blend-overlay">
                <div className="h-full w-full bg-dots-light dark:bg-dots-dark"></div>
              </div>
              <span className={cn(
                "relative font-bold text-white",
                isMobileSmall ? "text-sm" : "text-lg"
              )}>PH</span>
            </div>
            <span className={cn(
              "font-bold text-[#534D56] dark:text-[#F8F1FF]",
              isMobileSmall ? "text-lg" : "text-xl"
            )}>
              {isMobileSmall ? "PH" : "Project Hub"}
            </span>
          </Link>

          {!isMobile && (
            <nav className="flex items-center gap-4 lg:gap-6">
              {mainNavItems.map((item) =>
                item.children ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <TouchButton
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#1B998B] h-auto p-2",
                          pathname.startsWith(item.href) ? "text-[#1B998B]" : "text-[#656176] dark:text-[#DECDF5]",
                        )}
                      >
                        {item.name} <ChevronDown className="h-4 w-4" />
                      </TouchButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]"
                    >
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.name} asChild>
                          <Link
                            href={child.href}
                            className="text-[#534D56] dark:text-[#F8F1FF] focus:bg-[#DECDF5]/20 dark:focus:bg-[#656176]/50"
                          >
                            {child.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-[#1B998B]",
                      pathname === item.href ? "text-[#1B998B]" : "text-[#656176] dark:text-[#DECDF5]",
                    )}
                  >
                    {item.name}
                  </Link>
                ),
              )}
            </nav>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          {!isMobile && isAuthenticated && (
            <>
              <TouchButton
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#1B998B] h-auto px-3 py-2",
                  pathname === "/saved" ? "text-[#1B998B]" : "text-[#656176] dark:text-[#DECDF5]",
                )}
              >
                <Link href="/saved">Saved</Link>
              </TouchButton>
              <TouchButton
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#1B998B] h-auto px-3 py-2",
                  pathname === "/assistant" ? "text-[#1B998B]" : "text-[#656176] dark:text-[#DECDF5]",
                )}
              >
                <Link href="/assistant">
                  {isTablet ? "AI" : "AI Assistant"}
                </Link>
              </TouchButton>
              <div className="h-4 w-px bg-[#DECDF5] dark:bg-[#656176]"></div>
            </>
          )}
          
          {!isMobile && (
            <TouchButton variant="ghost" size="icon" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </TouchButton>
          )}

          <div className="flex items-center">
            <ModeToggle />
          </div>

          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <TouchButton variant="ghost" size="icon" touchSize="large">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </TouchButton>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176] w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-6 mt-8">
                  {mainNavItems.map((item) => (
                    <div key={item.name} className="py-2">
                      {item.children ? (
                        <>
                          <div className="mb-3 font-medium text-[#534D56] dark:text-[#F8F1FF] text-base">{item.name}</div>
                          <div className="flex flex-col pl-4 border-l-2 border-[#DECDF5] dark:border-[#656176] space-y-2">
                            {item.children.map((child) => (
                              <TouchButton
                                key={child.name}
                                variant="ghost"
                                size="sm"
                                asChild
                                className="justify-start h-auto py-3 px-2 text-sm text-[#656176] dark:text-[#DECDF5] hover:text-[#1B998B] hover:bg-[#DECDF5]/20 dark:hover:bg-[#656176]/20"
                              >
                                <Link href={child.href}>
                                  {child.name}
                                </Link>
                              </TouchButton>
                            ))}
                          </div>
                        </>
                      ) : (
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          asChild
                          className={cn(
                            "justify-start h-auto py-3 px-2 w-full font-medium text-base",
                            pathname === item.href ? "text-[#1B998B] bg-[#1B998B]/10" : "text-[#534D56] dark:text-[#F8F1FF]",
                          )}
                        >
                          <Link href={item.href}>
                            {item.name}
                          </Link>
                        </TouchButton>
                      )}
                    </div>
                  ))}
                  {isAuthenticated && (
                    <>
                      <div className="py-2">
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          asChild
                          className={cn(
                            "justify-start h-auto py-3 px-2 w-full font-medium text-base",
                            pathname === "/saved" ? "text-[#1B998B] bg-[#1B998B]/10" : "text-[#534D56] dark:text-[#F8F1FF]",
                          )}
                        >
                          <Link href="/saved">
                            Saved Projects
                          </Link>
                        </TouchButton>
                      </div>
                      <div className="py-2">
                        <TouchButton
                          variant="ghost"
                          size="sm"
                          asChild
                          className={cn(
                            "justify-start h-auto py-3 px-2 w-full font-medium text-base",
                            pathname === "/assistant" ? "text-[#1B998B] bg-[#1B998B]/10" : "text-[#534D56] dark:text-[#F8F1FF]",
                          )}
                        >
                          <Link href="/assistant">
                            AI Assistant
                          </Link>
                        </TouchButton>
                      </div>
                    </>
                  )}
                  <div className="py-2">
                    <TouchButton
                      variant="ghost"
                      size="sm"
                      asChild
                      className="justify-start h-auto py-3 px-2 w-full font-medium text-base text-[#534D56] dark:text-[#F8F1FF]"
                    >
                      <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-2" /> GitHub
                      </Link>
                    </TouchButton>
                  </div>
                  {isAuthenticated ? (
                    <>
                      <div className="border-t border-[#DECDF5] dark:border-[#656176] my-4"></div>
                      <div className="py-1">
                        <div className="py-2 text-sm text-[#656176] dark:text-[#DECDF5]">
                          {getUserName()}
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="py-2 font-medium text-[#534D56] dark:text-[#F8F1FF] flex items-center gap-2"
                          >
                            <User className="h-4 w-4" /> Profile
                          </Link>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/settings"
                            className="py-2 font-medium text-[#534D56] dark:text-[#F8F1FF] flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" /> Settings
                          </Link>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={handleLogout}
                            className="py-2 font-medium text-[#534D56] dark:text-[#F8F1FF] flex items-center gap-2 w-full text-left"
                          >
                            <LogOut className="h-4 w-4" /> Log out
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-[#DECDF5] dark:border-[#656176] my-6"></div>
                      <div className="flex flex-col gap-3">
                        <TouchButton
                          variant="outline"
                          size="lg"
                          asChild
                          className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent w-full"
                        >
                          <Link href="/login">Log in</Link>
                        </TouchButton>
                        <TouchButton 
                          size="lg" 
                          asChild 
                          className="bg-[#1B998B] hover:bg-[#1B998B]/90 w-full"
                        >
                          <Link href="/signup">Sign up</Link>
                        </TouchButton>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.studentProfile?.profilePicture || user?.supervisorProfile?.profilePicture} alt={getUserName()} />
                    <AvatarFallback className="bg-[#1B998B] text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved" className="cursor-pointer">
                    <BookMarked className="mr-2 h-4 w-4" />
                    <span>Saved Projects</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <TouchButton
                variant="outline"
                size={isTablet ? "sm" : "default"}
                asChild
                className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent"
              >
                <Link href="/login">Log in</Link>
              </TouchButton>
              <TouchButton 
                size={isTablet ? "sm" : "default"}
                asChild 
                className="bg-[#1B998B] hover:bg-[#1B998B]/90"
              >
                <Link href="/signup">Sign up</Link>
              </TouchButton>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </header>
  )
}

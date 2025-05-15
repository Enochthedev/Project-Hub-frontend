"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { ChevronDown, Github } from "lucide-react"
import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

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
  const { isMobile } = useMobile()
  const [scrolled, setScrolled] = useState(false)

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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-6 md:space-x-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1B998B] to-[#1B998B]/80 shadow-sm">
              <div className="absolute inset-0 opacity-80 mix-blend-overlay">
                <div className="h-full w-full bg-dots-light dark:bg-dots-dark"></div>
              </div>
              <span className="relative text-lg font-bold text-white">PH</span>
            </div>
            <span className="text-xl font-bold text-[#534D56] dark:text-[#F8F1FF]">Project Hub</span>
          </Link>

          {!isMobile && (
            <nav className="flex items-center gap-6">
              {mainNavItems.map((item) =>
                item.children ? (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#1B998B]",
                          pathname.startsWith(item.href) ? "text-[#1B998B]" : "text-[#656176] dark:text-[#DECDF5]",
                        )}
                      >
                        {item.name} <ChevronDown className="h-4 w-4" />
                      </button>
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
        <div className="flex items-center space-x-4 md:space-x-5">
          {!isMobile && (
            <>
              <Link
                href="/saved"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#1B998B]",
                  pathname === "/saved" ? "text-[#1B998B]" : "text-[#656176] dark:text-[#DECDF5]",
                )}
              >
                Saved
              </Link>
              <div className="h-4 w-px bg-[#DECDF5] dark:bg-[#656176]"></div>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-[#534D56] dark:text-[#F8F1FF]">
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}

          <div className="flex items-center pl-1">
            <ModeToggle />
          </div>

          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-[#534D56] border-[#DECDF5] dark:border-[#656176]">
                <nav className="flex flex-col gap-4 mt-8">
                  {mainNavItems.map((item) => (
                    <div key={item.name} className="py-1">
                      {item.children ? (
                        <>
                          <div className="mb-1 font-medium text-[#534D56] dark:text-[#F8F1FF]">{item.name}</div>
                          <div className="flex flex-col pl-3 border-l border-[#DECDF5] dark:border-[#656176]">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="py-2 text-sm text-[#656176] dark:text-[#DECDF5] hover:text-[#1B998B]"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "py-2 font-medium",
                            pathname === item.href ? "text-[#1B998B]" : "text-[#534D56] dark:text-[#F8F1FF]",
                          )}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  <div className="py-1">
                    <Link
                      href="/saved"
                      className={cn(
                        "py-2 font-medium",
                        pathname === "/saved" ? "text-[#1B998B]" : "text-[#534D56] dark:text-[#F8F1FF]",
                      )}
                    >
                      Saved
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 font-medium text-[#534D56] dark:text-[#F8F1FF] flex items-center gap-2"
                    >
                      <Github className="h-4 w-4" /> GitHub
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-3 pl-1">
              <Button
                variant="outline"
                asChild
                className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-transparent"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"
import { Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#DECDF5] bg-[#F8F1FF]/80 backdrop-blur supports-[backdrop-filter]:bg-[#F8F1FF]/60 dark:border-[#656176] dark:bg-[#534D56]/80 dark:supports-[backdrop-filter]:bg-[#534D56]/60">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Project Hub</h3>
            <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
              Project ideas, matched to your brain and your semester.
            </p>
            <p className="mt-2 text-xs text-[#656176] dark:text-[#DECDF5]">
              Built by{" "}
              <Link href="https://twitter.com/wave" className="text-[#1B998B] hover:underline">
                @wave
              </Link>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Links</h3>
            <Link href="/about" className="text-sm text-[#656176] hover:text-[#1B998B] dark:text-[#DECDF5]">
              About
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#656176] hover:text-[#1B998B] dark:text-[#DECDF5]"
            >
              GitHub
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Legal</h3>
            <Link href="/terms" className="text-sm text-[#656176] hover:text-[#1B998B] dark:text-[#DECDF5]">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-[#656176] hover:text-[#1B998B] dark:text-[#DECDF5]">
              Privacy Policy
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#534D56] dark:text-[#F8F1FF]">Connect</h3>
            <div className="flex gap-3">
              <Link href="https://twitter.com" className="text-[#656176] hover:text-[#1B998B] dark:text-[#DECDF5]">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://github.com" className="text-[#656176] hover:text-[#1B998B] dark:text-[#DECDF5]">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertTriangle, Mail, RefreshCw } from 'lucide-react'

function VerifyEmailContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const { verifyEmail, resendEmailVerification, error, clearError, user } = useAuthStore()

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setVerificationStatus('error')
        return
      }

      try {
        await verifyEmail(token)
        setVerificationStatus('success')
      } catch (error) {
        console.error('Email verification failed:', error)
        setVerificationStatus('error')
      }
    }

    performVerification()
  }, [token, verifyEmail])

  const handleResendVerification = async () => {
    if (!resendEmail) return

    setIsResending(true)
    clearError()

    try {
      await resendEmailVerification(resendEmail)
      setVerificationStatus('resend')
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = () => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'student') {
        router.push('/explore')
      } else if (user.role === 'supervisor') {
        router.push('/supervisor/dashboard')
      } else {
        router.push('/admin')
      }
    } else {
      router.push('/login')
    }
  }

  if (verificationStatus === 'loading') {
    return (
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                Verifying your email
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                Email Verified Successfully!
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                Your email address has been verified. You can now access all platform features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      What's next?
                    </h3>
                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Explore thousands of project ideas</li>
                        <li>Get personalized recommendations</li>
                        <li>Connect with supervisors</li>
                        <li>Track your project progress</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90"
              >
                Continue to Platform
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (verificationStatus === 'resend') {
    return (
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                Verification Email Sent
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                We've sent a new verification email to {resendEmail}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                <div className="flex">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Check your email
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>Click the verification link in the email to complete the process.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  Back to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Error state
  return (
    <main className="container py-20">
      <div className="mx-auto max-w-md">
        <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
              Verification Failed
            </CardTitle>
            <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
              {!token 
                ? "Invalid or missing verification token."
                : "The verification link has expired or is invalid."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="resend-email" className="text-sm font-medium text-[#534D56] dark:text-[#F8F1FF]">
                  Enter your email to resend verification
                </label>
                <div className="flex space-x-2">
                  <input
                    id="resend-email"
                    type="email"
                    placeholder="your.email@ui.edu.ng"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#DECDF5] rounded-md bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                    disabled={isResending}
                  />
                  <Button
                    onClick={handleResendVerification}
                    disabled={!resendEmail || isResending}
                    size="sm"
                    className="bg-[#1B998B] hover:bg-[#1B998B]/90"
                  >
                    {isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">
                    Create New Account
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                Loading...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
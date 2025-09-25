"use client"

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle, X } from 'lucide-react'

interface EmailVerificationPromptProps {
  email: string
  onDismiss?: () => void
  showDismiss?: boolean
  className?: string
}

export function EmailVerificationPrompt({ 
  email, 
  onDismiss, 
  showDismiss = true,
  className = "" 
}: EmailVerificationPromptProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { resendEmailVerification, error, clearError } = useAuthStore()

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendSuccess(false)
    clearError()

    try {
      await resendEmailVerification(email)
      setResendSuccess(true)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className={`border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
              <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
                Verify your email address
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                We sent a verification link to {email}
              </CardDescription>
            </div>
          </div>
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resendSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Verification email sent successfully! Check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">To complete your registration:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your email inbox and spam folder</li>
              <li>Click the verification link in the email</li>
              <li>Return here to access all features</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-800/50"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend verification email'
              )}
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              className="text-yellow-700 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-200"
            >
              I've verified my email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

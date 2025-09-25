"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const { forgotPassword, isLoading, error, clearError } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearError()

    try {
      await forgotPassword(data.email)
      setIsSuccess(true)
    } catch (error) {
      // Error is handled by the store
      console.error('Password reset request failed:', error)
    }
  }

  if (isSuccess) {
    return (
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                Check your email
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                We've sent a password reset link to {getValues('email')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                <div className="flex">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      What's next?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Check your email inbox and spam folder</li>
                        <li>Click the reset link in the email</li>
                        <li>Create a new password</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setIsSuccess(false)
                    clearError()
                  }}
                  variant="outline"
                  className="w-full border-[#DECDF5] text-[#534D56] hover:bg-[#F8F1FF] dark:border-[#656176] dark:text-[#F8F1FF] dark:hover:bg-[#656176]"
                >
                  Send another email
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login" className="flex items-center justify-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#534D56] dark:text-[#F8F1FF]">
            Forgot your password?
          </h1>
          <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        
        <Card className="border-[#DECDF5] bg-white shadow-sm dark:border-[#656176] dark:bg-[#656176]/30">
          <CardContent className="p-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#534D56] dark:text-[#F8F1FF]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your University of Ibadan email"
                  autoComplete="email"
                  {...register('email')}
                  className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF]"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90 focus-visible:ring-[#1B998B]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button asChild variant="ghost" className="text-[#656176] hover:text-[#534D56] dark:text-[#DECDF5] dark:hover:text-[#F8F1FF]">
                <Link href="/login" className="flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const { resetPassword, isLoading, error, clearError } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  const password = watch('newPassword')

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset.')
    } else {
      setTokenError(null)
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError()

    try {
      await resetPassword(data.token, data.newPassword, data.confirmPassword)
      setIsSuccess(true)
    } catch (error) {
      // Error is handled by the store
      console.error('Password reset failed:', error)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ]
    
    strength = checks.filter(Boolean).length
    
    if (strength < 3) return { level: 'weak', color: 'bg-red-500', text: 'Weak' }
    if (strength < 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Medium' }
    return { level: 'strong', color: 'bg-green-500', text: 'Strong' }
  }

  const passwordStrength = password ? getPasswordStrength(password) : null

  if (tokenError) {
    return (
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <Card className="border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                {tokenError}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Link href="/forgot-password">
                  Request New Reset Link
                </Link>
              </Button>
              
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
                Password Reset Successful
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                Your password has been successfully reset. You can now log in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90"
              >
                Continue to Login
              </Button>
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
            Reset your password
          </h1>
          <p className="mt-2 text-[#656176] dark:text-[#DECDF5]">
            Enter your new password below.
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
              <input type="hidden" {...register('token')} />
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[#534D56] dark:text-[#F8F1FF]">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('newPassword')}
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF] pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#656176]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#656176]" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#656176] dark:text-[#DECDF5]">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.level === 'weak' ? 'text-red-600' :
                        passwordStrength.level === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.level === 'weak' ? 1 : passwordStrength.level === 'medium' ? 2 : 3) * 33.33}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#534D56] dark:text-[#F8F1FF]">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="border-[#DECDF5] bg-white text-[#534D56] focus:border-[#1B998B] focus:ring-[#1B998B] dark:border-[#656176] dark:bg-[#656176]/50 dark:text-[#F8F1FF] pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-[#656176]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#656176]" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
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
                    Resetting password...
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button asChild variant="ghost" className="text-[#656176] hover:text-[#534D56] dark:text-[#DECDF5] dark:hover:text-[#F8F1FF]">
                <Link href="/login">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="container py-20">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

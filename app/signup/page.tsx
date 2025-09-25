"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Users } from 'lucide-react'

export default function SignupPage() {
  return (
    <main className="container py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#534D56] dark:text-[#F8F1FF] mb-4">
            Join Project Hub
          </h1>
          <p className="text-lg text-[#656176] dark:text-[#DECDF5] max-w-2xl mx-auto">
            Choose your account type to get started with discovering and managing final year projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Signup */}
          <Card className="relative overflow-hidden border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80"></div>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B998B]/10">
                <GraduationCap className="h-8 w-8 text-[#1B998B]" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                I'm a Student
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                Find and save final year project ideas that match your interests and skills
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Browse thousands of project ideas
                </div>
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Get AI-powered recommendations
                </div>
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Save and organize your favorites
                </div>
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Connect with supervisors
                </div>
              </div>
              <Button asChild className="w-full bg-[#1B998B] hover:bg-[#1B998B]/90">
                <Link href="/signup/student">
                  Sign up as Student
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Supervisor Signup */}
          <Card className="relative overflow-hidden border-[#DECDF5] bg-white dark:border-[#656176] dark:bg-[#656176]/30 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B998B] to-[#1B998B]/80"></div>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B998B]/10">
                <Users className="h-8 w-8 text-[#1B998B]" />
              </div>
              <CardTitle className="text-2xl text-[#534D56] dark:text-[#F8F1FF]">
                I'm a Supervisor
              </CardTitle>
              <CardDescription className="text-[#656176] dark:text-[#DECDF5]">
                Share your project ideas and connect with talented students
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Post and manage project ideas
                </div>
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Review student applications
                </div>
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Track project progress
                </div>
                <div className="flex items-center text-sm text-[#656176] dark:text-[#DECDF5]">
                  <div className="w-2 h-2 bg-[#1B998B] rounded-full mr-3"></div>
                  Collaborate with students
                </div>
              </div>
              <Button asChild variant="outline" className="w-full border-[#1B998B] text-[#1B998B] hover:bg-[#1B998B] hover:text-white">
                <Link href="/signup/supervisor">
                  Sign up as Supervisor
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-[#656176] dark:text-[#DECDF5]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#1B998B] hover:text-[#1B998B]/80">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  className?: string
  onClick?: () => void
}

const colorVariants = {
  blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  red: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  className,
  onClick
}: MetricCardProps) {
  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center',
          colorVariants[color]
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground flex-1">
              {description}
            </p>
          )}
          {trend && (
            <div className="ml-2">
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

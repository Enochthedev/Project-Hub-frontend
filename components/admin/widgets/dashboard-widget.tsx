"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardWidgetProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  isLoading?: boolean
  error?: string
  onRefresh?: () => void
  onExpand?: () => void
  onMinimize?: () => void
  isExpanded?: boolean
}

export function DashboardWidget({
  title,
  description,
  children,
  className,
  actions,
  isLoading = false,
  error,
  onRefresh,
  onExpand,
  onMinimize,
  isExpanded = false
}: DashboardWidgetProps) {
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-medium truncate">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm truncate">{description}</CardDescription>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}
          {onExpand && !isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          {onMinimize && isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          {actions || (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-destructive mb-2">Error loading data</div>
              <div className="text-xs text-muted-foreground">{error}</div>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
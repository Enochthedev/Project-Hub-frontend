"use client"

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendIndicatorProps {
  value: number
  format?: 'number' | 'percentage' | 'currency'
  showIcon?: boolean
  showValue?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TrendIndicator({
  value,
  format = 'number',
  showIcon = true,
  showValue = true,
  className,
  size = 'sm'
}: TrendIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isNeutral = value === 0

  const formatValue = (val: number) => {
    const absValue = Math.abs(val)
    switch (format) {
      case 'percentage':
        return `${absValue.toFixed(1)}%`
      case 'currency':
        return `$${absValue.toLocaleString()}`
      default:
        return absValue.toLocaleString()
    }
  }

  const getIcon = () => {
    if (!showIcon) return null
    
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
    
    if (isPositive) {
      return <TrendingUp className={iconSize} />
    } else if (isNegative) {
      return <TrendingDown className={iconSize} />
    } else {
      return <Minus className={iconSize} />
    }
  }

  const getColorClass = () => {
    if (isPositive) {
      return 'text-green-600 dark:text-green-400'
    } else if (isNegative) {
      return 'text-red-600 dark:text-red-400'
    } else {
      return 'text-muted-foreground'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'md':
        return 'text-sm'
      case 'lg':
        return 'text-base'
      default:
        return 'text-xs'
    }
  }

  return (
    <div className={cn(
      'flex items-center space-x-1',
      getColorClass(),
      getTextSize(),
      className
    )}>
      {getIcon()}
      {showValue && (
        <span className="font-medium">
          {isPositive && '+'}
          {formatValue(value)}
        </span>
      )}
    </div>
  )
}
import { api, ApiResponse } from './client'
import { RecommendationResult, RecommendationFilters, Recommendation } from './types'

export interface RecommendationFeedback {
    projectId: string
    feedbackType: 'like' | 'dislike' | 'rating' | 'bookmark' | 'view'
    rating?: number // 1-5 for rating type
    comment?: string
}

export interface RecommendationExplanation {
    projectId: string
    similarityScore: number
    explanation: {
        skillAnalysis: {
            matchingSkills: string[]
            skillGaps: string[]
            skillOverlap: number
            learningOpportunities: string[]
        }
        interestAlignment: {
            directMatches: string[]
            relatedAreas: string[]
            interestScore: number
            explorationPotential: string[]
        }
        careerRelevance: {
            industryConnections: string[]
            skillDevelopment: string[]
            portfolioValue: string
            marketDemand: string
        }
        confidenceLevel: 'low' | 'medium' | 'high'
        reasoning: string
    }
}

export interface AccessibleExplanation {
    projectId: string
    accessibleExplanation: {
        summary: string
        visualElements: {
            similarityBar: {
                percentage: number
                color: string
                label: string
            }
            skillsChart: {
                matching: number
                total: number
                percentage: number
            }
        }
        plainLanguage: {
            whyRecommended: string
            whatYoullLearn: string
            challenges: string
            opportunities: string
        }
        definitions: Record<string, string>
    }
}

export interface ProgressiveRecommendationRequest {
    limit?: number
    includeSpecializations?: string[]
    minSimilarityScore?: number
}

export interface ProgressiveRecommendationResponse {
    requestId: string
    message: string
    estimatedTimeMs?: number
}

export interface RecommendationProgress {
    requestId: string
    progress: number
    stage: string
    estimatedTimeRemaining: number
    completed: boolean
    result?: RecommendationResult
    error?: string
}

// Recommendations API service
export const recommendationsApi = {
    // Generate recommendations for current user
    generateRecommendations: async (filters: RecommendationFilters = {}): Promise<RecommendationResult> => {
        const params = new URLSearchParams()

        if (filters.limit) params.append('limit', filters.limit.toString())
        if (filters.excludeSpecializations?.length) {
            filters.excludeSpecializations.forEach(spec => params.append('excludeSpecializations', spec))
        }
        if (filters.includeSpecializations?.length) {
            filters.includeSpecializations.forEach(spec => params.append('includeSpecializations', spec))
        }
        if (filters.maxDifficulty) params.append('maxDifficulty', filters.maxDifficulty)
        if (filters.forceRefresh) params.append('forceRefresh', filters.forceRefresh.toString())
        if (filters.minSimilarityScore) params.append('minSimilarityScore', filters.minSimilarityScore.toString())
        if (filters.includeDiversityBoost !== undefined) {
            params.append('includeDiversityBoost', filters.includeDiversityBoost.toString())
        }

        const response = await api.get<RecommendationResult>(`/recommendations?${params.toString()}`)
        return response.data!
    },

    // Force refresh recommendations
    refreshRecommendations: async (): Promise<RecommendationResult> => {
        const response = await api.post<RecommendationResult>('/recommendations/refresh')
        return response.data!
    },

    // Get recommendation history
    getRecommendationHistory: async (): Promise<Recommendation[]> => {
        const response = await api.get<Recommendation[]>('/recommendations/history')
        return response.data!
    },

    // Submit feedback for a recommendation
    submitFeedback: async (
        recommendationId: string,
        projectId: string,
        feedback: RecommendationFeedback
    ): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(
            `/recommendations/${recommendationId}/feedback?projectId=${projectId}`,
            feedback
        )
        return response.data!
    },

    // Get detailed explanation for a recommendation
    getRecommendationExplanation: async (
        recommendationId: string,
        projectId: string
    ): Promise<RecommendationExplanation> => {
        const response = await api.get<RecommendationExplanation>(
            `/recommendations/${recommendationId}/explanation?projectId=${projectId}`
        )
        return response.data!
    },

    // Get accessible explanation for a recommendation
    getAccessibleExplanation: async (
        recommendationId: string,
        projectId: string
    ): Promise<AccessibleExplanation> => {
        const response = await api.get<AccessibleExplanation>(
            `/recommendations/${recommendationId}/accessible-explanation?projectId=${projectId}`
        )
        return response.data!
    },

    // Start progressive recommendation generation
    generateRecommendationsWithProgress: async (
        options: ProgressiveRecommendationRequest = {}
    ): Promise<ProgressiveRecommendationResponse> => {
        const response = await api.post<ProgressiveRecommendationResponse>(
            '/recommendations/generate-with-progress',
            options
        )
        return response.data!
    },

    // Get recommendation generation progress
    getRecommendationProgress: async (requestId: string): Promise<RecommendationProgress> => {
        const response = await api.get<RecommendationProgress>(`/recommendations/progress/${requestId}`)
        return response.data!
    },

    // Rate a recommendation (simple thumbs up/down)
    rateRecommendation: async (
        projectId: string,
        rating: 'positive' | 'negative'
    ): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(
            `/recommendations/rate`,
            { projectId, rating }
        )
        return response.data!
    },

    // Check recommendation service health
    getServiceHealth: async (): Promise<{
        status: string
        aiService: boolean
        fallbackService: boolean
        timestamp: string
    }> => {
        const response = await api.get('/recommendations/health')
        return response.data!
    },
}

// Recommendation utility functions
export const recommendationUtils = {
    // Format similarity score as percentage
    formatSimilarityScore: (score: number): string => {
        return `${Math.round(score * 100)}%`
    },

    // Get similarity score color
    getSimilarityScoreColor: (score: number): string => {
        if (score >= 0.8) return 'green'
        if (score >= 0.6) return 'yellow'
        if (score >= 0.4) return 'orange'
        return 'red'
    },

    // Get similarity score label
    getSimilarityScoreLabel: (score: number): string => {
        if (score >= 0.8) return 'Excellent Match'
        if (score >= 0.6) return 'Good Match'
        if (score >= 0.4) return 'Fair Match'
        return 'Poor Match'
    },

    // Sort recommendations by similarity score
    sortBySimilarityScore: (recommendations: Recommendation[]): Recommendation[] => {
        return [...recommendations].sort((a, b) => b.similarityScore - a.similarityScore)
    },

    // Filter recommendations by minimum score
    filterByMinScore: (recommendations: Recommendation[], minScore: number): Recommendation[] => {
        return recommendations.filter(rec => rec.similarityScore >= minScore)
    },

    // Group recommendations by specialization
    groupBySpecialization: (recommendations: Recommendation[]): Record<string, Recommendation[]> => {
        return recommendations.reduce((groups, rec) => {
            const spec = rec.specialization
            if (!groups[spec]) {
                groups[spec] = []
            }
            groups[spec].push(rec)
            return groups
        }, {} as Record<string, Recommendation[]>)
    },

    // Get top matching skills across recommendations
    getTopMatchingSkills: (recommendations: Recommendation[], limit: number = 10): string[] => {
        const skillCounts: Record<string, number> = {}

        recommendations.forEach(rec => {
            rec.matchingSkills.forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1
            })
        })

        return Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([skill]) => skill)
    },

    // Calculate average similarity score
    calculateAverageSimilarityScore: (recommendations: Recommendation[]): number => {
        if (recommendations.length === 0) return 0
        const total = recommendations.reduce((sum, rec) => sum + rec.similarityScore, 0)
        return total / recommendations.length
    },

    // Check if recommendation is from cache
    isFromCache: (result: RecommendationResult): boolean => {
        return result.fromCache
    },

    // Check if recommendation is expired
    isExpired: (result: RecommendationResult): boolean => {
        return new Date(result.expiresAt) < new Date()
    },

    // Format processing time
    formatProcessingTime: (timeMs: number): string => {
        if (timeMs < 1000) return `${timeMs}ms`
        return `${(timeMs / 1000).toFixed(1)}s`
    },
}
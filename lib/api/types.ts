// User and Authentication Types
export interface User {
    id: string
    email: string
    role: 'student' | 'supervisor' | 'admin'
    isEmailVerified: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
    studentProfile?: StudentProfile
    supervisorProfile?: SupervisorProfile
}

export interface StudentProfile {
    id: string
    userId: string
    name: string
    studentId: string
    level: string
    department: string
    skills: string[]
    interests: string[]
    preferredSpecializations: string[]
    bio?: string
    profilePicture?: string
    createdAt: string
    updatedAt: string
}

export interface SupervisorProfile {
    id: string
    userId: string
    name: string
    title: string
    department: string
    specializations: string[]
    researchInterests: string[]
    bio?: string
    profilePicture?: string
    contactEmail?: string
    officeLocation?: string
    availableSlots: number
    currentStudents: number
    createdAt: string
    updatedAt: string
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
}

export interface LoginResponse {
    user: User
    tokens: TokenPair
}

// Project Types
export interface Project {
    id: string
    title: string
    abstract: string
    description: string
    specialization: string
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    tags: string[]
    requiredSkills: string[]
    learningOutcomes: string[]
    isGroupProject: boolean
    maxGroupSize?: number
    estimatedDuration: string
    supervisor: {
        id: string
        name: string
        title: string
        department: string
        specializations: string[]
    }
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived'
    isAvailable: boolean
    applicationDeadline?: string
    createdAt: string
    updatedAt: string
    viewCount?: number
    bookmarkCount?: number
}

export interface ProjectSummary {
    id: string
    title: string
    abstract: string
    specialization: string
    difficultyLevel: string
    tags: string[]
    isGroupProject: boolean
    supervisor: {
        id: string
        name: string
        department: string
    }
    viewCount: number
    bookmarkCount: number
    createdAt: string
}

export interface PaginatedProjects {
    projects: ProjectSummary[]
    total: number
    limit: number
    offset: number
    hasMore: boolean
}

// Search and Filter Types
export interface SearchFilters {
    query?: string
    specializations?: string[]
    difficultyLevels?: string[]
    tags?: string[]
    isGroupProject?: boolean
    yearFrom?: number
    yearTo?: number
    sortBy?: 'relevance' | 'date' | 'title' | 'popularity'
    sortOrder?: 'asc' | 'desc'
    limit?: number
    offset?: number
}

// Recommendation Types
export interface Recommendation {
    projectId: string
    title: string
    abstract: string
    specialization: string
    difficultyLevel: string
    similarityScore: number
    matchingSkills: string[]
    matchingInterests: string[]
    reasoning: string
    supervisor: {
        id: string
        name: string
        specialization: string
    }
    diversityBoost?: number
}

export interface RecommendationResult {
    recommendations: Recommendation[]
    reasoning: string
    averageSimilarityScore: number
    fromCache: boolean
    generatedAt: string
    expiresAt: string
    metadata: {
        method: string
        fallback: boolean
        projectsAnalyzed: number
        cacheHitRate: number
        processingTimeMs: number
    }
}

export interface RecommendationFilters {
    limit?: number
    excludeSpecializations?: string[]
    includeSpecializations?: string[]
    maxDifficulty?: string
    forceRefresh?: boolean
    minSimilarityScore?: number
    includeDiversityBoost?: boolean
}

// AI Assistant Types
export interface Conversation {
    id: string
    studentId: string
    title: string
    status: 'active' | 'archived' | 'escalated'
    projectId?: string
    language: string
    messageCount: number
    messages?: Message[]
    context?: any
    createdAt: string
    updatedAt: string
    lastMessageAt: string
}

export interface Message {
    id: string
    conversationId: string
    type: 'user' | 'assistant'
    content: string
    metadata?: any
    confidenceScore?: number
    sources?: string[]
    isBookmarked: boolean
    status: 'sent' | 'delivered' | 'read'
    averageRating?: number
    ratingCount?: number
    createdAt: string
}

export interface AIResponse {
    response: string
    confidenceScore: number
    sources: string[]
    conversationId: string
    messageId: string
    fromAI: boolean
    suggestedFollowUps?: string[]
    escalationSuggestion?: string
    metadata: {
        processingTime: number
        language: string
        category: string
        requiresHumanReview?: boolean
    }
}

// Bookmark Types
export interface Bookmark {
    id: string
    userId: string
    projectId: string
    project: ProjectSummary
    notes?: string
    tags: string[]
    categoryId?: string
    category?: BookmarkCategory
    createdAt: string
    updatedAt: string
}

export interface BookmarkCategory {
    id: string
    userId: string
    name: string
    description?: string
    color: string
    bookmarkCount: number
    createdAt: string
    updatedAt: string
}

// Milestone Types
export interface Milestone {
    id: string
    title: string
    description: string
    dueDate: string
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
    priority: 'low' | 'medium' | 'high' | 'critical'
    progress: number
    projectId?: string
    studentId: string
    supervisorId?: string
    createdAt: string
    updatedAt: string
}

// Error Types
export interface ApiError {
    success: false
    errorCode: string
    message: string
    timestamp: string
    path: string
    details?: any
}
// Export all API services
export * from './client'
export * from './types'
export * from './auth'
export * from './projects'
export * from './recommendations'
export * from './ai-assistant'
export * from './bookmarks'
export * from './milestones'

// Re-export commonly used types
export type {
    User,
    Project,
    ProjectSummary,
    Recommendation,
    Conversation,
    Message,
    Bookmark,
    BookmarkCategory,
    Milestone,
    ApiResponse,
} from './types'

// Re-export main API client
export { api as default } from './client'
